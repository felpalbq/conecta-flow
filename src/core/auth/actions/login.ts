'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/infrastructure/supabase/server-client';

import { loginSchema, type LoginInput } from '../schemas/login-schema';

export async function login(input: LoginInput): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Verifique os dados informados.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'E-mail ou senha inválidos.' };
  }

  redirect('/');
}
