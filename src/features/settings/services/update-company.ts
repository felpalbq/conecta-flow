'use server';

import { revalidatePath } from 'next/cache';

import { logAction } from '@/core/audit/log-action';
import { getActiveCompanyOrThrow } from '@/core/tenancy/services/get-active-company';
import { createClient } from '@/infrastructure/supabase/server-client';

import { companySchema, type CompanyInput } from '../schemas/company-schema';

export async function updateCompany(input: CompanyInput): Promise<{ error?: string }> {
  const parsed = companySchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Verifique os dados informados.' };
  }

  const { membership } = await getActiveCompanyOrThrow();
  const supabase = await createClient();

  // RLS (companies_update) enforces that only an active Owner membership can
  // write here — a non-owner request silently affects zero rows.
  const { error, data } = await supabase
    .from('companies')
    .update({
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
    })
    .eq('id', membership.companyId)
    .select('id');

  if (error || !data || data.length === 0) {
    return { error: 'Não foi possível salvar. Apenas o Owner pode editar a empresa.' };
  }

  await logAction({
    companyId: membership.companyId,
    action: 'company.updated',
    entity: `companies:${membership.companyId}`,
    metadata: { fields: ['name', 'timezone', 'locale'] },
  });

  // TODO(marco-2): publish company.updated event once the events table exists.
  revalidatePath('/settings/company');
  return {};
}
