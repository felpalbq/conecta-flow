# Instruções — Auditoria + Unificação de Repositório

Ordem obrigatória. Não pular etapas; não executar a próxima sem os critérios de conclusão da anterior.

| # | Arquivo | O quê |
|---|---------|-------|
| 01 | `instrucao-01-correcoes-auditoria.md` | Corrige as violações e discrepâncias encontradas em auditoria no `conecta-flow-platform`. Executar ANTES da migração — migrar código já corrigido. |
| 02 | `instrucao-02-adr-015-repositorio-oficial.md` | Registra a decisão: `flow-connect` passa a ser o repositório oficial. Gera ADR-015 e atualiza docs. Nenhum código muda nesta etapa. |
| 03 | `instrucao-03-migracao-e-guardrails.md` | Executa a migração da fundação (Supabase, RLS, testes, docs, auth adaptado) para o `flow-connect` e instala os guardrails de convivência com o Lovable. Contém checkpoint de confirmação obrigatório. |

Contexto para o Claude Code: a auditoria foi feita por leitura direta do código em 2026-07-17 (commit do zip enviado). Se o repositório mudou desde então, revalidar cada achado antes de corrigir — não corrigir o que já foi corrigido.
