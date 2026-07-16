# ADR-010 — Acesso a dados com supabase-js; sem ORM

**Status:** Aceito · 2026-07-15

## Contexto

A stack deixava a decisão em aberto: Drizzle ORM vs Supabase Client. Critério declarado: simplicidade, evitando abstrações desnecessárias.

## Decisão

supabase-js com tipos gerados (`supabase gen types`). Sem ORM.

## Consequências

- O client propaga o JWT do usuário: **RLS funciona como segunda camada de defesa em toda query** — decisivo para multi-tenancy. Um ORM com conexão direta bypassaria RLS por padrão.
- Menos uma dependência e um conceito.
- Revisitar (novo ADR) apenas se surgirem queries analíticas complexas que o client não expresse bem; database functions cobrem casos transacionais.
