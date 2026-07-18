# ADR-015 — flow-connect como repositório oficial; supersede ADR-004

**Status:** Aceito · 2026-07-17 · Supersede parcialmente ADR-004; impacta ADR-009

## Contexto

ADR-004 definia `conecta-flow-platform` como produto oficial e `flow-connect` (criado pelo Lovable) como protótipo de referência. O fluxo real de trabalho consolidou o Lovable como par permanente de desenvolvimento de UI, não como fase de descoberta descartável. Manter dois repositórios significava reimplementar em Next.js tudo que o Lovable já entregava pronto — custo sem benefício para o tamanho da equipe.

## Decisão

1. **`flow-connect` é o repositório oficial único:** produto, docs/, migrations, testes e CI vivem nele.
2. **Divisão de papéis por responsabilidade, não por repositório:**
   - **Lovable** = UI/UX (componentes visuais, layout, estilo, fluxos de tela)
   - **Claude Code** = arquitetura, backend, banco, segurança, integrações, testes, documentação
3. **A interface construída pelo Lovable até esta data é preservada como está.**
4. **`conecta-flow-platform` é arquivado** (read-only) após a migração da fundação — permanece como referência histórica; releases só saem do repo oficial.

## Consequências

- **ADR-009** (backend = Next.js route handlers) precisa de revisão: o repo oficial usa a stack gerada pelo Lovable — framework, bundler, router serão verificados na Instrução 03 (Fase 0). Camada de API passa para server functions do framework (Opção A) ou Supabase Edge Functions (Opção B) — decidir com base na capacidade servidor do destino.
- **Risco de conflitos:** Lovable e Claude Code comitam no mesmo repositório. Mitigação: fronteiras de propriedade por diretório (ver `docs/04-development/repository-ownership.md`) + instruções de knowledge no projeto Lovable proibindo-o de tocar em diretórios de engenharia.
- **Migrations, suíte RLS, seed e docs/ são framework-agnósticos** e migram sem adaptação. Auth, middleware e server actions exigem reescrita adaptada ao framework do repo oficial.

## Complicações conhecidas

- A stack real do `flow-connect` será auditada na Instrução 03 (Fase 0). Este ADR será atualizado com a stack verificada e a decisão da camada de API (Opção A ou B) naquela altura.
