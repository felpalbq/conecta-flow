-- Reconciles the permissions catalog with src/core/permissions/permission-catalog.ts
-- (the code-side source of truth — see docs/02-architecture/permission-model.md).
-- The original migration only seeded a subset; this adds the conversation/contact/module
-- keys introduced by ROLE_PERMISSIONS (audit finding A3).
insert into public.permissions (key, description, scope) values
  ('conversation.read', 'Visualizar conversas da empresa', 'company'),
  ('conversation.reply', 'Responder conversas da empresa', 'company'),
  ('conversation.assign', 'Atribuir responsável por uma conversa', 'company'),
  ('conversation.handoff', 'Assumir ou devolver conversa entre IA e humano', 'company'),
  ('contact.read', 'Visualizar contatos da empresa', 'company'),
  ('contact.edit', 'Editar dados de contatos da empresa', 'company'),
  ('module.read', 'Visualizar módulos ativos da empresa', 'company')
on conflict (key) do nothing;
