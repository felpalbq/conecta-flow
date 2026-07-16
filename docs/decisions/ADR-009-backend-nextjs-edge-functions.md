# ADR-009 — Backend: Next.js para aplicação, Edge Functions para borda, n8n pós-piloto

**Status:** Aceito · 2026-07-15

## Contexto

A stack definia Next.js/Vercel, mas a arquitetura exige webhooks de entrada, consumidores de eventos e processamento de IA — cargas que não se encaixam naturalmente em serverless de curta duração. O papel de cada opção nunca havia sido definido.

## Decisão

- **Next.js route handlers (Vercel):** API da aplicação, casos de uso, regras de negócio.
- **Supabase Edge Functions:** webhooks de entrada (WhatsApp, pagamentos) e consumidores de fila (pgmq).
- **n8n:** fora do MVP; entra pós-piloto para automações reais (follow-up automático, sincronizações, cron).

## Consequências

- Uma peça a menos de infraestrutura durante todo o MVP.
- Webhooks respondem rápido e vivem perto do banco.
- Se o processamento de IA exceder limites serverless, um worker dedicado será avaliado em novo ADR.
