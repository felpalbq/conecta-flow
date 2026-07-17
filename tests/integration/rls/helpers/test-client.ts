import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/supabase/types';

import { DEV_PASSWORD } from '../../../fixtures/rls-seed';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Anon-key client that signs in as a seeded fixture user — exercises the same client -> PostgREST -> RLS path the app relies on, not raw SQL. */
export async function signInAs(email: string) {
  const supabase = createClient<Database>(supabaseUrl, anonKey);

  const { error } = await supabase.auth.signInWithPassword({ email, password: DEV_PASSWORD });

  if (error) {
    throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  }

  return supabase;
}
