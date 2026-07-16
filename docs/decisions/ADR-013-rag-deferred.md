# ADR-013 — RAG adiado para pós-piloto

**Status:** Aceito · 2026-07-15

## Contexto

A arquitetura do agente prevê RAG com pgvector, mas implementá-lo antes de existir demanda real é custo e complexidade sem validação — contrário ao princípio "IA pensa apenas quando necessário".

## Decisão

- **MVP:** conhecimento da empresa como FAQ estruturado no banco (`knowledge_entries`), injetado no contexto do agente.
- **Pós-piloto:** pgvector + embeddings OpenAI + pipeline documentos → chunks → embeddings → busca, quando um cliente real tiver conhecimento que não cabe em contexto.

## Consequências

- Marco 3 fica menor e mais barato; a estrutura do prompt/contexto já prevê o slot de "conhecimento recuperado".
- Isolamento por `company_id` obrigatório desde o desenho das tabelas de conhecimento.
