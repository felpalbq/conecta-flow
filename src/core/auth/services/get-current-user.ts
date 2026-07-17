import 'server-only';

import { createClient } from '@/infrastructure/supabase/server-client';

/**
 * Revalidates the JWT against Supabase Auth (unlike reading the session
 * cookie alone, which can be stale/spoofed) — safe to use for trust
 * decisions.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}
