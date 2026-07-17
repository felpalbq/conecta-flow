// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

import { COMPANIES, USERS } from '../../fixtures/rls-seed';
import { createServiceClient } from './helpers/service-client';
import { signInAs } from './helpers/test-client';

describe('write isolation', () => {
  let betaCompanyId: string;
  let betaOriginalName: string;

  beforeAll(async () => {
    const service = createServiceClient();
    const { data, error } = await service
      .from('companies')
      .select('id, name')
      .eq('slug', COMPANIES.beta.slug)
      .single();

    if (error || !data)
      throw new Error(`Failed to look up ${COMPANIES.beta.slug}: ${error?.message}`);
    betaCompanyId = data.id;
    betaOriginalName = data.name;
  });

  it('attendant de Alfa não consegue atualizar a Empresa B', async () => {
    const supabase = await signInAs(USERS.ownerAlfa.email);

    const { data, error } = await supabase
      .from('companies')
      .update({ name: 'Nome Invadido' })
      .eq('id', betaCompanyId)
      .select();

    // RLS's `with check` silently filters the row out of the update target —
    // this must not surface as a thrown error, matching "não lê/altera dado".
    expect(error).toBeNull();
    expect(data).toEqual([]);

    const service = createServiceClient();
    const { data: unchanged } = await service
      .from('companies')
      .select('name')
      .eq('id', betaCompanyId)
      .single();

    expect(unchanged?.name).toBe(betaOriginalName);
  });

  it('attendant não consegue atualizar a própria empresa (só owner pode)', async () => {
    const supabase = await signInAs(USERS.attendantBeta.email);

    const { data, error } = await supabase
      .from('companies')
      .update({ name: 'Nome Alterado Por Attendant' })
      .eq('id', betaCompanyId)
      .select();

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
