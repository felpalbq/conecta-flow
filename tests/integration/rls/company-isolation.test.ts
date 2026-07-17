// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

import { COMPANIES, USERS } from '../../fixtures/rls-seed';

import { createServiceClient } from './helpers/service-client';
import { signInAs } from './helpers/test-client';

describe('company isolation', () => {
  let betaCompanyId: string;

  beforeAll(async () => {
    const service = createServiceClient();
    const { data, error } = await service
      .from('companies')
      .select('id')
      .eq('slug', COMPANIES.beta.slug)
      .single();

    if (error || !data)
      throw new Error(`Failed to look up ${COMPANIES.beta.slug}: ${error?.message}`);
    betaCompanyId = data.id;
  });

  it('Empresa A não lê nenhum dado da Empresa B: companies', async () => {
    const supabase = await signInAs(USERS.ownerAlfa.email);
    const { data, error } = await supabase.from('companies').select('*').eq('id', betaCompanyId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('Empresa A não lê nenhum dado da Empresa B: company_memberships', async () => {
    const supabase = await signInAs(USERS.ownerAlfa.email);
    const { data, error } = await supabase
      .from('company_memberships')
      .select('*')
      .eq('company_id', betaCompanyId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('Empresa A não lê nenhum dado da Empresa B: profiles de membros de B', async () => {
    const supabase = await signInAs(USERS.ownerAlfa.email);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', USERS.attendantBeta.email);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
