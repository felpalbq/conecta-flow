import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { ACTIVE_COMPANY_COOKIE } from '../constants';
import { getMemberships, type MembershipWithCompany } from './get-memberships';

export interface ActiveCompanyContext {
  membership: MembershipWithCompany;
  memberships: MembershipWithCompany[];
}

/**
 * Reads the active-company cookie and validates it against the caller's own
 * memberships (never trusts the cookie value blindly) — falls back to the
 * first membership if missing/stale/invalid. Redirects to /no-company if
 * the user has zero company memberships (e.g., an admin-only profile).
 * Wrapped in React's cache() so the layout and page calling this in the same
 * request dedupe into a single lookup.
 */
export const getActiveCompanyOrThrow = cache(async (): Promise<ActiveCompanyContext> => {
  const memberships = await getMemberships();

  if (memberships.length === 0) {
    redirect('/no-company');
  }

  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value;

  const membership = memberships.find((m) => m.companyId === activeCompanyId) ?? memberships[0]!;

  return { membership, memberships };
});
