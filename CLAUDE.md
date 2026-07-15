# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual do repositório

Este repositório contém apenas **documentação de planejamento** — ainda não existe código. Todo o conteúdo está em [instruções/](instruções/), com 45 documentos de especificação (em português) que definem o produto, a arquitetura e o processo de desenvolvimento do **Conecta Flow**: um SaaS de atendimento inteligente via WhatsApp para pequenas empresas.

O código real será criado no repositório `conecta-flow-platform` (ver [instruções/38.txt](instruções/38.txt) e [instruções/43.txt](instruções/43.txt)). Não há comandos de build, lint ou teste ainda.

## Índice dos documentos

Os arquivos são numerados; os mais importantes para orientação:

- **Produto**: `00` Manifesto · `inicio` Product Vision · `01` Product Principles · `02` Atores · `04` Ciclo de vida da conversa · `05` Módulos · `42` MVP Specification
- **Arquitetura**: `06` System Architecture · `10/14/15/30` Domain/Database Model · `11/29` Event Architecture · `12/28/44` Multi-tenancy · `13/27` Security Model · `16` API Boundaries · `17/31` AI Agent Architecture · `18/32` Module Architecture · `19/34` Mission Control · `33` Permission Model · `39` Supabase · `40` n8n · `41` Integrações
- **Execução**: `20` AI Development Principles · `21` Coding Standards · `22` Git Workflow · `23` Lovable Workflow · `24` N8N Guidelines · `25` Technical Stack · `26/09` Project Structure · `35` Roadmap · `36` Development Workflow · `37` Claude Code Project Setup · `38` Repository Structure · `43` Initial Development Plan · `07/45` Como o Claude Code deve operar

Alguns números cobrem o mesmo tema em versões diferentes (ex.: 09/26, 12/28, 13/27). Em caso de divergência, confirmar com o usuário qual prevalece.

## Essência do produto

- **A conversa é o centro do produto.** Tudo (score, agenda, dashboard, CRM) existe para enriquecer a conversa — nunca o contrário.
- A experiência deve parecer uma evolução natural do WhatsApp Business, nunca um CRM complexo.
- **Regra de ouro**: toda funcionalidade deve melhorar a conversa, o resultado da conversa ou a operação da plataforma. Caso contrário, não pertence ao produto.
- O Core permanece pequeno; tudo que for específico nasce como módulo independente e plugável (agenda, pagamentos, campanhas, Instagram...).
- **Mission Control** é uma aplicação administrativa separada — nunca misturar com o ambiente do cliente.

## Stack planejada (instruções/25.txt)

- **App**: Next.js + TypeScript (strict, nunca JavaScript) + React + Tailwind + shadcn/ui
- **Forms/validação**: React Hook Form + Zod (toda entrada externa tem schema)
- **Estado**: local primeiro; server state com TanStack Query; global só se justificado (Context, depois Zustand)
- **Backend/dados**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions, pgvector para RAG); ORM ainda não decidido (Drizzle vs Supabase Client)
- **Automação**: n8n self-hosted (Docker) — orquestração apenas, **nunca** regras de negócio, persistência ou permissões
- **IA**: arquitetura de adaptadores, nunca acoplar a um único provider (Anthropic/OpenAI/Google)
- **Deploy**: Vercel (app) + Supabase Cloud + n8n em Docker · Versionamento no GitHub

## Arquitetura em camadas (instruções/06.txt)

Frontend → Backend (Supabase) → Event Bus → n8n → Serviços de IA → Integrações externas

Responsabilidades exclusivas, nunca duplicadas:
- **Frontend**: só experiência do usuário — nunca regra de negócio, score, permissões ou acesso direto à IA/banco
- **Backend**: a verdade do sistema — auth, autorização, regras, eventos, auditoria, isolamento entre empresas
- **Eventos**: toda alteração importante gera evento; eventos comunicam, nunca executam regras
- **n8n**: orquestra e integra; nunca armazena estado permanente
- **IA**: apenas cognição (interpretar, classificar, responder); regra determinística sempre vem antes de chamada a LLM (IA custa dinheiro — Princípio 6)
- **Integrações** (WhatsApp via Evolution API, etc.): sempre isoladas em camada/adapter próprio

## Regras invioláveis

- **Multi-tenancy desde a primeira linha**: nenhum recurso assume empresa única, IDs fixos ou configuração global. Empresa A nunca vê dados da Empresa B. RLS obrigatório.
- **Segurança faz parte da arquitetura**: toda funcionalidade nasce com autenticação, autorização, auditoria e menor privilégio.
- **Nunca confiar no frontend** para validação ou autorização.
- **Triagem antes de IA**: mensagens passam por classificação (irrelevante/particular/cliente/lead) antes de processamento inteligente. Lead não nasce automaticamente — conversa vira lead só quando demonstra potencial comercial.
- **Documentação é parte do produto**: alterações arquiteturais atualizam a documentação e decisões importantes geram ADR (`docs/decisions/ADR-NNN-nome.md`). Nunca alterar decisões estruturais silenciosamente.
- Nunca copiar código do protótipo Lovable diretamente — ele é apenas referência visual.

## Convenções de código (instruções/21.txt e 38.txt)

- Organização por domínio/feature (`src/modules/<dominio>/{domain,application,infrastructure,ui}`), nunca por tipo de arquivo. Domínio não depende de infraestrutura.
- Módulos se comunicam por eventos/casos de uso, não por importação direta.
- Nunca `any`; imports com alias `@/...`; sem valores mágicos; sem arquivos `utils.ts`/`helpers.ts` genéricos.
- Hooks com prefixo `use` representando comportamento (`useConversation`, `useLeadScore`).
- Workflows n8n exportados como `n8n/workflows/WF_DOMAIN_ACTION_VERSION.json`.

## Git (instruções/22.txt)

- Branches: `main` (produção, único deploy), `develop` (integração), `feature/*` (partem de `develop`, nunca de `main`), `hotfix/*`.
- Commits pequenos, uma responsabilidade, formato `feat:|fix:|refactor:|docs:|test:|chore:` em inglês (ex.: `feat: create conversation assignment service`).
- Migrations de banco têm PR próprio — nunca misturar frontend/backend/banco num commit gigante.
- Tags com versionamento semântico.

## Ordem de trabalho esperada (instruções/07.txt e 45.txt)

Antes de qualquer implementação relevante: ler a documentação aplicável → compreender o objetivo → avaliar impacto arquitetural → planejar → implementar → testar → atualizar documentação → commit. Nunca implementar baseado apenas no contexto da conversa. Perguntar ao usuário quando houver decisão de negócio, múltiplas arquiteturas possíveis ou risco alto.

Ordem de construção definida para o início do desenvolvimento (instruções/43.txt): Fundação → Multi-tenancy → Usuários → Contatos → Conversas → Mensagens → Inbox → WhatsApp (Evolution API) → IA (triagem → classificação → resposta → handoff) → Follow-up → Dashboard. Fora do MVP: agenda, pagamentos, campanhas, landing pages, Instagram, analytics avançado, kanban.
