/**
 * Canonical `dominio.acao` permission catalog (docs/02-architecture/permission-model.md).
 * Source of truth for both `ROLE_PERMISSIONS` (role-permissions.ts) and the
 * `permissions` table (projected via migration for admin/UI lookups) — see
 * migration 20260717013200_sync_permission_catalog.sql. Keep this list and
 * that migration in sync whenever a new permission key is introduced.
 */
export interface PermissionCatalogEntry {
  key: string;
  description: string;
  scope: 'company' | 'platform';
}

export const PERMISSION_CATALOG: readonly PermissionCatalogEntry[] = [
  { key: 'conversation.read', description: 'Visualizar conversas da empresa', scope: 'company' },
  { key: 'conversation.reply', description: 'Responder conversas da empresa', scope: 'company' },
  {
    key: 'conversation.assign',
    description: 'Atribuir responsável por uma conversa',
    scope: 'company',
  },
  {
    key: 'conversation.handoff',
    description: 'Assumir ou devolver conversa entre IA e humano',
    scope: 'company',
  },
  { key: 'contact.read', description: 'Visualizar contatos da empresa', scope: 'company' },
  { key: 'contact.edit', description: 'Editar dados de contatos da empresa', scope: 'company' },
  {
    key: 'user.manage',
    description: 'Gerenciar usuários e memberships da própria empresa',
    scope: 'company',
  },
  { key: 'dashboard.read', description: 'Visualizar indicadores da empresa', scope: 'company' },
  {
    key: 'audit.read',
    description: 'Consultar registros de auditoria da própria empresa',
    scope: 'company',
  },
  { key: 'module.read', description: 'Visualizar módulos ativos da empresa', scope: 'company' },
  {
    key: 'platform.company.manage',
    description: 'Gerenciar empresas e tenants da plataforma',
    scope: 'platform',
  },
  {
    key: 'platform.user.manage',
    description: 'Administrar usuários da plataforma',
    scope: 'platform',
  },
  {
    key: 'platform.audit.read',
    description: 'Consultar auditoria global da plataforma',
    scope: 'platform',
  },
] as const;

export const PERMISSION_CATALOG_KEYS: ReadonlySet<string> = new Set(
  PERMISSION_CATALOG.map((entry) => entry.key),
);
