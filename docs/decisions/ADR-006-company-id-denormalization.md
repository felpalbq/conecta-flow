# ADR-006 — company_id denormalizado em todas as tabelas operacionais

**Status:** Aceito · 2026-07-15

## Contexto

O modelo lógico original definia `messages`, `timeline_events`, `leads`, `followups`, `tasks`, `summaries` e `attachments` apenas com `conversation_id`, enquanto os documentos de segurança exigiam `company_id` em toda tabela operacional. Sem a coluna, cada política RLS exigiria join com `conversations`.

## Decisão

`company_id` obrigatório e indexado em **toda** tabela operacional, incluindo as filhas de `conversations`.

## Consequências

- Políticas RLS viram filtro direto — mais rápidas e muito mais difíceis de errar.
- Pequena redundância de dados, preenchida na criação do registro (o pai já conhece a empresa).
- Índices por `company_id` em todas as tabelas principais.
