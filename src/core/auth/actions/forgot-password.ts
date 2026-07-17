'use server';

import { createClient } from '@/infrastructure/supabase/server-client';

import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/forgot-password-schema';

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Informe um e-mail válido.' };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Supabase never reveals whether the email exists — always returns success
  // client-side regardless, so this response shape is safe as-is.
  // Local/CLI Supabase Auth defaults to the PKCE flow: the email link hits
  // GoTrue's own /verify endpoint, which redirects here with `?code=...`
  // appended (GoTrue preserves the `next` param below alongside it) — the
  // route handler at src/app/auth/confirm/route.ts exchanges that code for a
  // session and redirects to `next`.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  return { success: true };
}
