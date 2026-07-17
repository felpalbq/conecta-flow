# Tech Stack — Conecta Flow

Tecnologias oficiais. Nenhuma tecnologia é adicionada sem avaliação. A stack prioriza: velocidade de desenvolvimento, baixa manutenção, escalabilidade gradual, comunidade madura, integração com IA, baixo custo operacional.

## Aplicação

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Framework | **Next.js 16** | frontend, route handlers (API), server components. `middleware.ts` foi renomeado para `proxy.ts` (`src/proxy.ts`) — ver AGENTS.md |
| Linguagem | **TypeScript strict** | nunca JavaScript; nunca `any` |
| UI | **React + Tailwind CSS + shadcn/ui** | nunca recriar componentes básicos; sem CSS espalhado. A CLI atual do shadcn/ui gera componentes sobre **Base UI** (`@base-ui/react`), não Radix — convenções diferem: `render={<Componente />}` no lugar de `asChild`, `onClick` no lugar de `onSelect` em itens de menu |
| Formulários | **React Hook Form + Zod** | toda entrada externa possui schema Zod |
| Server state | **TanStack Query** | cache, sincronização, mutations |
| Client state | estado local → React Context → Zustand | global apenas com justificativa |

## Backend e dados

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Plataforma | **Supabase** | PostgreSQL, Auth, Storage, Realtime, Edge Functions, Queues |
| Acesso a dados | **supabase-js + tipos gerados** | sem ORM (ADR-010) — propaga JWT, RLS como 2ª camada de defesa |
| Autenticação | Supabase Auth | login, sessão, recuperação; OAuth futuro |
| Autorização | RLS + permissões no domínio + validação backend | nunca confiar no frontend |
| Storage | Supabase Storage | arquivos nunca no banco; isolamento por `company_id` |
| Realtime | Supabase Realtime | novas mensagens, status, eventos da conversa |
| Filas/eventos | tabela `events` + **Supabase Queues (pgmq)** | ADR-008 |
| Busca | PostgreSQL Full Text Search | serviço dedicado só se necessário |
| Vetores (pós-piloto) | pgvector | embeddings, RAG (ADR-013) |

## Backend — onde roda o quê (ADR-009)

- **Next.js route handlers (Vercel):** API da aplicação, casos de uso, regras de negócio.
- **Supabase Edge Functions:** webhooks de entrada (WhatsApp, pagamentos) e consumidores de fila.
- **n8n self-hosted (pós-piloto):** workflows, integrações, tarefas assíncronas. Nunca regras de negócio.

## IA (ADR-012)

- Provider padrão: **OpenAI**, sempre via camada de adaptador (**Vercel AI SDK**) — nunca acoplar a um único fornecedor.
- Modelo econômico para triagem; modelo capaz para respostas/qualificação.
- Embeddings OpenAI quando o RAG chegar (pós-piloto).

## Deploy e infraestrutura

| Componente | Onde |
|-----------|------|
| App | Vercel (deploy somente da branch `main`) |
| Banco/serviços | Supabase Cloud |
| Evolution API (piloto) + n8n (pós-piloto) | VPS com Docker Compose + Caddy |
| Versionamento | GitHub |
| Desenvolvimento | local; Docker quando necessário |
| Ambientes | development → staging (pós-piloto) → production; credenciais nunca compartilhadas |

## Qualidade

- **ESLint + Prettier** (config padrão Next.js) · **Vitest** (unidade) · Playwright (e2e, quando houver fluxos críticos).
- **GitHub Actions:** typecheck + lint + test em todo PR; testes de isolamento RLS obrigatórios no CI.
- **Sentry** para erros; logs estruturados (evento, usuário, empresa, timestamp, contexto).
- Monitoramento inicial: logs + dashboards internos (tabelas `events`/`usage`); observabilidade dedicada é evolução.

## Validação

Toda entrada externa (formulário, API, webhook) possui schema Zod. Frontend melhora UX; backend garante segurança.

## Dependências

Toda nova dependência responde: resolve problema real? reduz complexidade? possui manutenção ativa? existe alternativa nativa?

## Regra final

A melhor tecnologia é aquela que permite evoluir o produto mantendo simplicidade.
