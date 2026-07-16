# ADR-012 — OpenAI como provider padrão de IA

**Status:** Aceito · 2026-07-15 (decisão do Product Owner)

## Contexto

A arquitetura exige adaptadores e proíbe acoplamento a fornecedor único, mas o provider inicial nunca havia sido definido.

## Decisão

OpenAI como provider padrão desde o dia 1, sempre atrás da camada de adaptador (Vercel AI SDK):

- Modelo econômico para triagem/classificação.
- Modelo mais capaz para respostas e qualificação.
- Embeddings OpenAI quando o RAG for implementado (ADR-013).

## Consequências

- Um único fornecedor de IA no início (LLM + embeddings) simplifica billing e monitoramento.
- A troca ou adição de providers (Anthropic, Google, OpenRouter) é configuração, não refatoração.
- Custo por chamada registrado em `usage` desde a primeira integração.
