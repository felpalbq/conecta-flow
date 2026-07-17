import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ACTIVE_COMPANY_COOKIE } from '../constants';
import { getMemberships, type MembershipWithCompany } from './get-memberships';

export interface ActiveCompanyContext {
  membership: MembershipWithCompany;
  memberships: MembershipWithCompany[];
}

/**
 * Reads the active-company cookie and validates it against the caller's own
 * memberships (never trusts the cookie value blindly) — falls back to the
 * first membership if missing/stale/invalid. Redirects to /sem-empresa if
 * the user has zero company memberships (e.g., an admin-only profile).
 */
export async function getActiveCompanyOrThrow(): Promise<ActiveCompanyContext> {
  const memberships = await getMemberships();

  if (memberships.length === 0) {
    redirect('/sem-empresa');
  }

  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value;

  const membership = memberships.find((m) => m.companyId === activeCompanyId) ?? memberships[0]!;

  return { membership, memberships };
}
