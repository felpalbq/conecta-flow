'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/infrastructure/supabase/server-client';

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
