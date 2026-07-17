import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/supabase/types';

/**
 * Bypasses RLS entirely — reserved for trusted server-side flows that must
 * act outside any single user's authority (company creation, seed script,
 * future invite/admin-promotion flows). Never import from anything under
 * `app/` directly; always go through a `core`/`infrastructure` service.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
