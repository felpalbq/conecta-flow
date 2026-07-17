import 'server-only';

import { notFound } from 'next/navigation';

import { createClient } from '@/infrastructure/supabase/server-client';

import { requireUser } from './require-user';

/**
 * Mission Control guard (ADR-011). 404s rather than redirecting to /login or
 * 403 — per docs/02-architecture/mission-control.md, a non-admin client must
 * never learn the admin area exists.
 */
export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, status')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!adminUser) {
    notFound();
  }

  return { user, adminUser };
}
