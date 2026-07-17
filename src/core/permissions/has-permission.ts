import { ROLE_PERMISSIONS, type Role } from './role-permissions';

interface MembershipLike {
  role: Role;
  /** Per-membership override permissions (company_memberships.permissions jsonb). */
  overridePermissions?: readonly string[];
}

export function hasPermission(membership: MembershipLike, key: string): boolean {
  const rolePermissions: readonly string[] = ROLE_PERMISSIONS[membership.role];
  return rolePermissions.includes(key) || (membership.overridePermissions ?? []).includes(key);
}
