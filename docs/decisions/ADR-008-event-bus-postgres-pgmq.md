# ADR-008 — Event bus em Postgres: tabela events + Supabase Queues

**Status:** Aceito · 2026-07-15

## Contexto

A arquitetura é orientada a eventos com exigências de imutabilidade, idempotência, versionamento, DLQ e consumidores independentes — mas nenhuma decisão de implementação existia. Um broker dedicado (Kafka/Redis) seria infraestrutura desproporcional ao estágio.

## Decisão

- **Event store:** tabela `events` imutável, gravada na mesma transação da mudança de estado; publicada apenas pelo Domain Layer.
- **Consumo assíncrono:** Supabase Queues (pgmq), com `retry_count` e status de falha como dead letter.
- **Frontend:** Supabase Realtime.
- **n8n (pós-piloto):** consome via webhook/fila.

## Consequências

- Zero infraestrutura nova; transacionalidade entre estado e evento de graça.
- Auditoria e dashboard derivam do event store.
- O contrato do evento (`event_id`, `event_type`, `version`, `company_id`, `actor`, `source`, `correlation_id`, `payload`) já nasce correto — trocar o transporte no futuro não toca o domínio.
