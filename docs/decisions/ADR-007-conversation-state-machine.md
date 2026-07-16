# ADR-007 — Status da conversa separado do responsável

**Status:** Aceito · 2026-07-15

## Contexto

O planejamento continha três máquinas de estado diferentes, misturando fase da conversa ("nova", "encerrada") com quem atende ("em atendimento IA", "em atendimento humano").

## Decisão

Dois campos independentes em `conversations`:

- **status:** `new → in_triage → active ⇄ waiting_customer → closed → archived` (pós-MVP: `in_followup`, `scheduled`, `converted`).
- **owner_type:** `ai | user | queue` (+ `assigned_user_id` quando `user`). Exatamente um responsável por vez.

## Consequências

- Reconcilia as três versões: "atendimento IA/humano" é responsável, não status.
- Handoff muda `owner_type` sem tocar no status; métricas IA × humano ficam triviais.
- O MVP implementa o subconjunto; novos status entram sem quebrar consumidores.
