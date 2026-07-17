import 'server-only';

import { cache } from 'react';

import { getCurrentUser } from '@/core/auth/services/get-current-user';
import { createClient } from '@/infrastructure/supabase/server-client';
import type { Role } from '@/core/permissions/role-permissions';

export interface MembershipWithCompany {
  id: string;
  role: Role;
  companyId: string;
  companyName: string;
  companySlug: string;
}

/**
 * Only ever returns memberships of the currently authenticated user — this
 * relies on the explicit `profile_id` filter below, not RLS alone: the
 * company_memberships_select policy also allows reading *peers'* rows
 * (anyone sharing a company), which is correct for a future team-display
 * feature but would leak other users' memberships here if left unfiltered.
 * Wrapped in React's cache() so the layout and page calling this in the
 * same request dedupe into a single query.
 */
export const getMemberships = cache(async (): Promise<MembershipWithCompany[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data: memberships, error: membershipsError } = await supabase
    .from('company_memberships')
    .select('id, role, company_id')
    .eq('profile_id', user.id)
    .eq('status', 'active');

  if (membershipsError) {
    throw new Error(`Failed to load memberships: ${membershipsError.message}`);
  }
  if (!memberships || memberships.length === 0) {
    return [];
  }

  const companyIds = memberships.map((m) => m.company_id);
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, slug')
    .in('id', companyIds);

  if (companiesError) {
    throw new Error(`Failed to load companies: ${companiesError.message}`);
  }

  const companyById = new Map((companies ?? []).map((c) => [c.id, c]));

  return memberships.flatMap((m) => {
    const company = companyById.get(m.company_id);
    if (!company) return [];

    return [
      {
        id: m.id,
        // role is enforced by a CHECK constraint, not a Postgres enum, so the
        // generated type is `string` — see role-permissions.ts.
        role: m.role as Role,
        companyId: company.id,
        companyName: company.name,
        companySlug: company.slug,
      },
    ];
  });
});
