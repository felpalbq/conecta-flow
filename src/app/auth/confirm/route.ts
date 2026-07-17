import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createClient } from '@/infrastructure/supabase/server-client';

/**
 * Callback for Supabase Auth email links (password recovery for Marco 1).
 * Local/CLI Supabase Auth defaults to the PKCE flow: GoTrue's own /verify
 * endpoint redirects here with `?code=...` (plus whatever `next` we asked
 * for in the original redirectTo) rather than a token_hash/type pair.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(next);
    }
  }

  redirect('/login?error=confirmation-failed');
}
