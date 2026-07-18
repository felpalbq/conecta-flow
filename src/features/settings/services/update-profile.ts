'use server';

import { revalidatePath } from 'next/cache';

import { logAction } from '@/core/audit/log-action';
import { requireUser } from '@/core/auth/services/require-user';
import { createClient } from '@/infrastructure/supabase/server-client';

import { profileSchema, type ProfileInput } from '../schemas/profile-schema';

export async function updateProfile(input: ProfileInput): Promise<{ error?: string }> {
  const parsed = profileSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Verifique os dados informados.' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ name: parsed.data.name, avatar_url: parsed.data.avatarUrl || null })
    .eq('id', user.id);

  if (error) {
    return { error: 'Não foi possível salvar as alterações.' };
  }

  await logAction({
    companyId: null,
    action: 'profile.updated',
    entity: `profiles:${user.id}`,
    metadata: { fields: ['name', 'avatarUrl'] },
  });

  // TODO(marco-2): publish profile.updated event once the events table exists.
  revalidatePath('/settings/profile');
  return {};
}
