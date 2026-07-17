# Git Workflow — Conecta Flow

O Git é a fonte da verdade: toda alteração rastreável, todo código com histórico claro, toda mudança reversível sem quebrar produção. O histórico deve contar a história do projeto.

## Repositórios (ADR-004)

| Repositório | Papel |
|-------------|-------|
| **conecta-flow-platform** | Produto oficial: frontend, backend, domínio, banco, integrações, docs. Único que gera produção. Claude Code trabalha aqui. |
| **conecta-flow-ui-prototype** | Lovable: prototipação, UX, dados mockados. Nunca produção, nunca backend, nunca regra de negócio. |

Históricos independentes; sem branches, pipelines ou releases compartilhados. Fluxo: ideia → Lovable → protótipo → validação → implementação real na platform. Nunca copiar código do protótipo cegamente.

## Branches

Uma única branch: **main** — sempre estável e deployável; todo o desenvolvimento acontece diretamente nela. Decisão do time (não há develop, feature/* nem hotfix/*) para manter o fluxo simples nesta fase do projeto — sem PRs, sem branches de integração.

Nunca criar branches auxiliares (`test`, `new`, `temp`, `backup`, `final`, `v2`, `ajustes`, `misc` ou qualquer `feature/*`/`develop`) sem alinhar antes com o usuário.

## Commits

Formato obrigatório `tipo: descrição` (inglês):

`feat:` nova funcionalidade · `fix:` correção · `refactor:` refatoração · `docs:` documentação · `test:` testes · `chore:` infraestrutura

Exemplos: `feat: create conversation assignment service`, `fix: prevent duplicate whatsapp messages`.

Proibidos: `update`, `changes`, `fixes`, `ajustes`, `teste`, `temp`, `wip`, `final`.

Commits pequenos e coesos: 1 problema → 1 commit. Nunca misturar frontend, backend e banco em um commit gigante. **Migrations têm commit próprio**, separado de código de aplicação.

## Revisão (sem PRs)

Sem branches nem Pull Requests: cada commit direto na `main` deve responder sozinho — o que mudou? por que mudou? quais documentos impacta? existe risco? Antes de commitar, revisar: arquitetura, segurança, multi-tenancy, eventos, permissões, documentação. Checklist: código funciona? documentação atualizada? segurança validada? testes realizados?

## Documentação

Toda alteração arquitetural exige atualização da documentação correspondente no mesmo commit. Nunca deixar documentação desatualizada.

## Tags e versionamento

Versionamento semântico: `v0.1.0`, `v0.2.0`, ... `v1.0.0`.

## Regra final

Qualquer pessoa deve conseguir entender a evolução do sistema apenas observando o histórico.
