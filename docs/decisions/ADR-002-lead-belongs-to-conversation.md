# ADR-002 — Lead é entidade própria ligada à Conversation

**Status:** Aceito · 2026-07-15

## Contexto

Três versões conflitavam: Lead como aggregate próprio ligado à Conversation; Lead como extensão do Contact; qualificação na própria Conversation.

## Decisão

Lead é entidade/aggregate próprio, criado na qualificação de uma **Conversation**, com `contact_id` denormalizado. Toda qualificação e score pertencem ao Lead.

## Consequências

- Um contato pode gerar múltiplas oportunidades ao longo do tempo, cada uma rastreável à conversa de origem — métricas de funil corretas.
- Coerente com os princípios "conversa é o centro" e "lead não nasce automaticamente".
- `leads` carrega `company_id`, `conversation_id` e `contact_id`.
