import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';

/** Test-only: bypasses RLS to look up fixture ids the anon-signed-in assertions filter by. */
export function createServiceClient() {
  return createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
