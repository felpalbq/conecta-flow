/**
 * Single source of truth for development seed data — re-exported by
 * tests/fixtures/rls-seed.ts so the RLS isolation suite and the seed script
 * never drift apart. Never real data (supabase-guidelines.md).
 */

export const DEV_PASSWORD = 'Dev@Passw0rd!';

export const COMPANIES = {
  alfa: { slug: 'empresa-alfa', name: 'Empresa Alfa' },
  beta: { slug: 'empresa-beta', name: 'Empresa Beta' },
} as const;

export const USERS = {
  ownerAlfa: { email: 'owner.alfa@conectaflow.dev', name: 'Ana Dona (Alfa)' },
  attendantBeta: { email: 'attendant.beta@conectaflow.dev', name: 'Beto Atendente (Beta)' },
  multiUser: { email: 'multi.user@conectaflow.dev', name: 'Mia Multiempresa' },
  platformAdmin: { email: 'platform.admin@conectaflow.dev', name: 'Pat Admin (Plataforma)' },
} as const;

/** platformAdmin has zero company_memberships — Mission Control identity is separate (ADR-011). */
export const PLATFORM_ADMINS = [USERS.platformAdmin];

/**
 * multiUser belongs to both companies with different roles — exercises the
 * "usuário multi-empresa alterna contexto corretamente" acceptance criterion.
 */
export const MEMBERSHIPS = [
  { user: USERS.ownerAlfa, company: COMPANIES.alfa, role: 'owner' as const },
  { user: USERS.attendantBeta, company: COMPANIES.beta, role: 'attendant' as const },
  { user: USERS.multiUser, company: COMPANIES.alfa, role: 'attendant' as const },
  { user: USERS.multiUser, company: COMPANIES.beta, role: 'owner' as const },
];
