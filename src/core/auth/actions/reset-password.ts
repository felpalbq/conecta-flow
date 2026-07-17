'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/infrastructure/supabase/server-client';

import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/reset-password-schema';

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<{ error: string } | undefined> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: 'Não foi possível atualizar a senha. Solicite um novo link de recuperação.' };
  }

  redirect('/login');
}
