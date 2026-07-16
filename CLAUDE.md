# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O projeto

**Conecta Flow** — SaaS multi-tenant de atendimento inteligente via WhatsApp para micro e pequenas empresas. A conversa é a entidade central do produto; CRM, score, agenda e dashboard existem para enriquecê-la. Um Agente Inteligente (LLM + conhecimento + ferramentas + políticas) faz triagem, responde, qualifica e transfere para humanos quando agrega valor. Existe um segundo ambiente administrativo, o **Mission Control** (`/admin`), invisível para clientes.

**Estado atual:** fase de fundação — a documentação canônica em [docs/](docs/) está completa; o código da aplicação ainda não foi iniciado. Não há comandos de build/teste ainda; quando o scaffold existir (Next.js + TypeScript strict + Tailwind + shadcn/ui + Supabase), atualizar esta seção com os comandos.

## Documentação — fonte da verdade

Nunca implementar baseado apenas no contexto da conversa. Antes de qualquer alteração relevante, ler os documentos aplicáveis:

- [docs/01-product/](docs/01-product/) — manifesto, visão, princípios, atores, especificação do MVP e **glossário** (linguagem ubíqua: use exatamente esses termos)
- [docs/02-architecture/](docs/02-architecture/) — arquitetura do sistema, domínio, banco, ciclo de vida da conversa, eventos, multi-tenancy, segurança, permissões, agente IA, módulos, Mission Control, integrações
- [docs/03-execution/](docs/03-execution/) — roadmap e plano de implementação (4 marcos com critérios de aceite)
- [docs/04-development/](docs/04-development/) — stack, estrutura do projeto, padrões de código, git, Supabase, n8n, Lovable e o modelo operacional do Claude
- [docs/decisions/](docs/decisions/) — ADRs 001–014. Decisões estruturais nunca mudam silenciosamente: toda mudança arquitetural gera novo ADR e atualiza a documentação no mesmo PR.

## Stack (decidida — ver ADRs)

Next.js (route handlers = API) · TypeScript strict (nunca `any`) · Tailwind + shadcn/ui · React Hook Form + Zod · TanStack Query · **Supabase** (Postgres, Auth, Storage, Realtime, Edge Functions, Queues) · acesso a dados via **supabase-js + tipos gerados, sem ORM** (ADR-010) · eventos em tabela `events` + pgmq (ADR-008) · IA via **OpenAI** atrás de adaptador Vercel AI SDK (ADR-012) · WhatsApp via adapter normalizado — Evolution API só no piloto, Meta Cloud API antes do 1º cliente pagante (ADR-014) · deploy Vercel; VPS Docker para Evolution/n8n · n8n e RAG só pós-piloto (ADR-009, ADR-013).

## Regras invioláveis

1. **Multi-tenancy sempre:** todo dado pertence a uma Company; `company_id` denormalizado e indexado em toda tabela operacional (ADR-006); RLS obrigatório (sem política = acesso negado); nunca confiar em `company_id` vindo do frontend; testes de isolamento no CI. Usuários vinculam-se a empresas via `company_memberships` (ADR-001).
2. **Camadas:** frontend só experiência; regras de negócio no domínio (route handlers/serviços); banco não executa lógica; integrações externas sempre atrás de adapters em `infrastructure/`; IA só cognição — nunca decide permissões nem persiste dados; n8n só orquestra — nunca contém regra de negócio.
3. **Eventos:** toda alteração importante gera evento imutável `dominio.acao` na mesma transação (glossário tem o catálogo); consumidores idempotentes; features se comunicam por eventos/serviços — nunca importação direta entre features.
4. **IA custa dinheiro:** regra determinística antes de LLM; triagem com modelo econômico; custo/tokens registrados em `usage` desde a primeira chamada; prompts versionados, nunca editados em produção.
5. **Conversa é o centro:** status e responsável (`owner_type: ai|user|queue`) são campos separados (ADR-007); conversas e mensagens nunca são apagadas (LGPD atende-se por anonimização); Lead nasce da qualificação de uma Conversation, nunca automaticamente (ADR-002).
6. **Segurança primeiro:** toda funcionalidade nasce com autenticação, autorização (`dominio.acao`), auditoria; segredos nunca em código/Git; validação Zod em toda entrada externa; webhooks sempre validados.

## Convenções

- Estrutura feature-first: `src/{app, features, core, shared, infrastructure}` (ADR-003; detalhes em docs/04-development/project-structure.md). Proibido `utils.ts`/`helpers.ts` genéricos; imports com alias `@/`.
- Código e identificadores em inglês; interface em pt-BR. Tabelas snake_case plural; FKs `<entity>_id`.
- Git: `main` (produção/deploy) ← `develop` ← `feature/*` (nunca partir de `main`); commits `tipo: descrição` em inglês (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`); migrations em PR próprio; nunca misturar frontend+backend+banco num commit.
- Repositórios: este (`conecta-flow-platform`) é o produto; `conecta-flow-ui-prototype` (Lovable) é só referência visual — nunca copiar código de lá sem adaptar (ADR-004).

## Como o Claude trabalha aqui

Ordem: ler docs → entender → avaliar impacto → planejar → implementar → testar → **atualizar documentação** → commit. Perguntar ao usuário quando houver decisão de negócio, múltiplas arquiteturas ou risco alto; executar direto quando a tarefa é clara e segue padrões. Nunca executar sem confirmação: mudanças destrutivas, banco de produção, remoção de dados, mudanças de segurança. Detalhes: docs/04-development/claude-operating-model.md.
