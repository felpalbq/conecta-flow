# ADR-001 — Usuário multi-empresa via Company Memberships

**Status:** Aceito · 2026-07-15

## Contexto

A documentação de planejamento continha duas versões conflitantes: usuário pertencente a exatamente uma empresa (`users.company_id`) vs. usuário vinculado a várias empresas via tabela de relacionamento.

## Decisão

Adotar o modelo de memberships: `auth.users → profiles → company_memberships → companies`. Cada membership carrega role, permissões e status. O contexto de tenant da sessão vem do membership ativo.

## Consequências

- Suporta o operador da plataforma e usuários que atendem para mais de uma empresa sem migração futura.
- RLS baseia-se em memberships (empresas do usuário), não em coluna única.
- A interface precisa de seletor de empresa ativa para usuários com múltiplos memberships.

## Clarificação 2026-07

Multi-membership é capacidade **arquitetural** (um profile pode ter vínculos com várias companies — necessário para o operador da plataforma e casos excepcionais administrados via Mission Control). **Não é feature de produto**: o usuário típico pertence a uma única company e a UI não promove alternância. O `CompanySwitcher` permanece no código como mecanismo de suporte, renderizado apenas quando existem múltiplos memberships — o que, por política de produto, só ocorre em contas administradas pela plataforma. O protótipo de UI não exibe switcher, e isso está correto.
