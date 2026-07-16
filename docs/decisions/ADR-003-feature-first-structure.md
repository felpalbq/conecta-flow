# ADR-003 — Estrutura feature-first pragmática

**Status:** Aceito · 2026-07-15

## Contexto

Três estruturas de projeto conflitantes foram propostas no planejamento, incluindo uma versão DDD completa (`modules/<dominio>/{domain,application,infrastructure,ui}`).

## Decisão

Adotar feature-first pragmático: `src/{app, features, core, shared, infrastructure}` (detalhes em `../04-development/project-structure.md`). Rejeitar a estrutura DDD em camadas por módulo.

## Consequências

- Menos cerimônia para uma equipe de uma pessoa + IA; coerente com o princípio da simplicidade.
- As fronteiras conceituais permanecem: feature não importa feature (eventos/serviços), regra de negócio fora de componentes, integrações isoladas em `infrastructure/`.
- Se um domínio crescer a ponto de justificar camadas internas, a decisão pode ser revisada por novo ADR.
