import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import type { Database } from '@/supabase/types';

/**
 * Refreshes the auth session cookie on every request. Called from
 * `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts` — see
 * AGENTS.md). This only keeps the session cookie fresh; it is not a session
 * management or authorization solution (Next.js Proxy guide) — real
 * authorization happens per route handler / server action (core/auth,
 * core/tenancy) and is enforced again by RLS.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Revalidates the JWT against Supabase Auth (unlike getSession(), which
  // just reads the cookie and can be spoofed/stale).
  await supabase.auth.getUser();

  return response;
}
