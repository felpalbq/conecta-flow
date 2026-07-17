// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { COMPANIES, USERS } from '../../fixtures/rls-seed';
import { signInAs } from './helpers/test-client';

describe('platform admin scope', () => {
  it('platform admin lê empresas de qualquer tenant', async () => {
    const supabase = await signInAs(USERS.platformAdmin.email);

    const { data, error } = await supabase
      .from('companies')
      .select('slug')
      .in('slug', [COMPANIES.alfa.slug, COMPANIES.beta.slug]);

    expect(error).toBeNull();
    expect(data?.map((c) => c.slug).sort()).toEqual(
      [COMPANIES.alfa.slug, COMPANIES.beta.slug].sort(),
    );
  });

  it('usuário comum não lê admin_users', async () => {
    const supabase = await signInAs(USERS.ownerAlfa.email);

    const { data, error } = await supabase.from('admin_users').select('*');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('platform admin sem memberships ainda lê a própria linha em admin_users', async () => {
    const supabase = await signInAs(USERS.platformAdmin.email);

    const { data, error } = await supabase.from('admin_users').select('status');

    expect(error).toBeNull();
    expect(data).toEqual([{ status: 'active' }]);
  });
});
