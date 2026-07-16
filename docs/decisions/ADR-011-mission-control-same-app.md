# ADR-011 — Mission Control na mesma aplicação, com escopo isolado

**Status:** Aceito · 2026-07-15

## Contexto

Os documentos exigiam que o Mission Control fosse "aplicação independente com autenticação independente", enquanto a estrutura de projeto o colocava como feature do mesmo app. Um app separado hoje dobraria o custo de manutenção para servir um único administrador.

## Decisão

Mesma aplicação Next.js: route group `/admin` com middleware próprio, identidade em `admin_users` (separada dos usuários de empresa), políticas RLS de escopo platform e auditoria de toda ação.

**Gatilho de separação** (novo ADR): segundo administrador da plataforma ou primeiro cliente enterprise.

## Consequências

- Uma aplicação para manter; mesmas APIs e regras da plataforma (como os docs exigem).
- O isolamento conceitual permanece: nenhuma tela de cliente acessa funções administrativas e vice-versa.
- A separação futura é facilitada por o Mission Control já consumir apenas APIs/permissões `platform.*`.
