/**
 * Static role -> permission map (docs/02-architecture/permission-model.md:
 * "papéis simplificam; permissões controlam"). `role` is enforced at the
 * database level by a CHECK constraint (companies_memberships.role), not a
 * Postgres enum, so the generated Database type widens it to `string` —
 * callers reading from Supabase cast to `Role` at the boundary.
 */
export const ROLE_PERMISSIONS = {
  owner: ['user.manage', 'dashboard.read', 'audit.read'],
  attendant: ['dashboard.read'],
} as const satisfies Record<string, readonly string[]>;

export type Role = keyof typeof ROLE_PERMISSIONS;
