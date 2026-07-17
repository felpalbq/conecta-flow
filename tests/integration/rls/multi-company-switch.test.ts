// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { COMPANIES, USERS } from '../../fixtures/rls-seed';
import { signInAs } from './helpers/test-client';

describe('multi-company context switching', () => {
  it('usuário multi-empresa alterna contexto corretamente', async () => {
    const supabase = await signInAs(USERS.multiUser.email);

    const { data: unfiltered, error: unfilteredError } = await supabase
      .from('companies')
      .select('slug')
      .in('slug', [COMPANIES.alfa.slug, COMPANIES.beta.slug]);

    expect(unfilteredError).toBeNull();
    expect(unfiltered?.map((c) => c.slug).sort()).toEqual(
      [COMPANIES.alfa.slug, COMPANIES.beta.slug].sort(),
    );

    const { data: alfaOnly, error: alfaError } = await supabase
      .from('companies')
      .select('slug')
      .eq('slug', COMPANIES.alfa.slug);

    expect(alfaError).toBeNull();
    expect(alfaOnly).toEqual([{ slug: COMPANIES.alfa.slug }]);

    const { data: betaOnly, error: betaError } = await supabase
      .from('companies')
      .select('slug')
      .eq('slug', COMPANIES.beta.slug);

    expect(betaError).toBeNull();
    expect(betaOnly).toEqual([{ slug: COMPANIES.beta.slug }]);
  });

  it('papel difere por empresa: attendant em Alfa, owner em Beta', async () => {
    const supabase = await signInAs(USERS.multiUser.email);

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, slug')
      .in('slug', [COMPANIES.alfa.slug, COMPANIES.beta.slug]);
    expect(companiesError).toBeNull();

    const companyIdBySlug = new Map((companies ?? []).map((c) => [c.slug, c.id]));

    const { data: memberships, error: membershipsError } = await supabase
      .from('company_memberships')
      .select('company_id, role');
    expect(membershipsError).toBeNull();

    const roleByCompanyId = new Map((memberships ?? []).map((m) => [m.company_id, m.role]));

    const alfaId = companyIdBySlug.get(COMPANIES.alfa.slug);
    const betaId = companyIdBySlug.get(COMPANIES.beta.slug);
    expect(alfaId).toBeDefined();
    expect(betaId).toBeDefined();

    expect(roleByCompanyId.get(alfaId!)).toBe('attendant');
    expect(roleByCompanyId.get(betaId!)).toBe('owner');
  });
});
