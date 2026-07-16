# ADR-004 — Dois repositórios; documentação dentro do principal

**Status:** Aceito · 2026-07-15

## Contexto

O planejamento oscilava entre 2 e 3 repositórios (com um repositório dedicado a docs) e três grafias de nome (connect-flow / conectaflow / conecta-flow).

## Decisão

Dois repositórios: **`conecta-flow-platform`** (produto oficial + `docs/`) e **`conecta-flow-ui-prototype`** (Lovable). Grafia canônica: `conecta-flow`.

## Consequências

- Documentação muda no mesmo PR que o código — nunca dessincroniza.
- Repositório de docs separado é descartado (overhead sem benefício para o tamanho da equipe).
- Apenas `conecta-flow-platform` gera produção e releases.
