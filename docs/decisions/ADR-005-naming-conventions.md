# ADR-005 — Convenções de nomenclatura unificadas

**Status:** Aceito · 2026-07-15

## Contexto

O planejamento continha padrões duplicados para eventos ("Message Received" vs `conversation.message_received`), permissões (`view_contacts` vs `contact.read`) e workflows n8n (`conversation.receive-message` vs `WF_WHATSAPP_MESSAGE_RECEIVED_V1`).

## Decisão

- **Eventos:** `dominio.acao` no passado — `conversation.message_received`. Estrutura com `actor`, `source`, `correlation_id`, `version`.
- **Permissões:** `dominio.acao` — `contact.edit`; escopo platform com prefixo `platform.`.
- **Workflows n8n:** `WF_SOURCE_EVENT_V<n>` — `WF_WHATSAPP_MESSAGE_RECEIVED_V1`.
- Código/identificadores em inglês; interface em pt-BR.

## Consequências

Uma única linguagem em código, banco, eventos e documentação (ver `../01-product/glossary.md`). Os padrões alternativos ficam proibidos.
