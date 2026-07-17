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
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    expect(userId).toBeDefined();

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, slug')
      .in('slug', [COMPANIES.alfa.slug, COMPANIES.beta.slug]);
    expect(companiesError).toBeNull();

    const companyIdBySlug = new Map((companies ?? []).map((c) => [c.slug, c.id]));

    // Explicit profile_id filter — required in application code (see
    // core/tenancy/services/get-memberships.ts): company_memberships_select
    // also allows reading peers' rows (any company member can see all rows
    // for that company, exercised by 'peers can read each other's
    // memberships' below), so relying on RLS alone here would silently
    // return other users' rows too.
    const { data: memberships, error: membershipsError } = await supabase
      .from('company_memberships')
      .select('company_id, role')
      .eq('profile_id', userId!);
    expect(membershipsError).toBeNull();
    expect(memberships).toHaveLength(2);

    const roleByCompanyId = new Map((memberships ?? []).map((m) => [m.company_id, m.role]));

    const alfaId = companyIdBySlug.get(COMPANIES.alfa.slug);
    const betaId = companyIdBySlug.get(COMPANIES.beta.slug);
    expect(alfaId).toBeDefined();
    expect(betaId).toBeDefined();

    expect(roleByCompanyId.get(alfaId!)).toBe('attendant');
    expect(roleByCompanyId.get(betaId!)).toBe('owner');
  });

  it("peers can read each other's memberships within a shared company (by design)", async () => {
    // owner.alfa and multi.user both belong to Alfa — company_memberships_select
    // intentionally allows this (needed by a future team/switcher UI), which
    // is exactly why application code must filter by profile_id itself
    // rather than relying on RLS alone (see the test above).
    const supabase = await signInAs(USERS.ownerAlfa.email);

    const { data: alfa, error: alfaError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', COMPANIES.alfa.slug)
      .single();
    expect(alfaError).toBeNull();

    const { data: rows, error: rowsError } = await supabase
      .from('company_memberships')
      .select('role')
      .eq('company_id', alfa!.id);

    expect(rowsError).toBeNull();
    expect(rows?.map((r) => r.role).sort()).toEqual(['attendant', 'owner']);
  });
});
