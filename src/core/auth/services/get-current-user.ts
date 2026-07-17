import 'server-only';

import { cache } from 'react';

import { createClient } from '@/infrastructure/supabase/server-client';

/**
 * Revalidates the JWT against Supabase Auth (unlike reading the session
 * cookie alone, which can be stale/spoofed) — safe to use for trust
 * decisions. Wrapped in React's cache() so multiple guards in the same
 * request (layout, page, admin check) dedupe into a single call.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
});
