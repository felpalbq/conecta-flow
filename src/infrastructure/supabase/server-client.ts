import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/supabase/types';

/**
 * Server Components / Route Handlers / Server Actions client. Propagates the
 * user's JWT (ADR-010) so RLS is enforced as defense-in-depth on every query.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components can't write cookies; the session refresh in
          // proxy.ts is what actually persists refreshed tokens. Swallow
          // here rather than throw.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // no-op — called from a Server Component context.
          }
        },
      },
    },
  );
}
