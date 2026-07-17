'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { ACTIVE_COMPANY_COOKIE } from '../constants';
import { getMemberships } from '../services/get-memberships';

export async function setActiveCompany(companyId: string): Promise<{ error?: string }> {
  const memberships = await getMemberships();
  const isValid = memberships.some((m) => m.companyId === companyId);

  if (!isValid) {
    return { error: 'Empresa inválida para este usuário.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_COMPANY_COOKIE, companyId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  revalidatePath('/', 'layout');
  return {};
}
