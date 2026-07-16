# Project Structure — Conecta Flow

Organização oficial do repositório `conecta-flow-platform` (ADR-003: feature-first pragmático; ADR-004: dois repositórios). O código é organizado por domínio do produto — nunca por tipo técnico. A estrutura física reflete a estrutura mental do produto.

## Raiz

```
conecta-flow-platform/
├── CLAUDE.md
├── README.md
├── package.json
├── .env.example          # nunca criar .env versionado
├── docs/                 # documentação oficial (nunca duplicar no src)
│   ├── 01-product/
│   ├── 02-architecture/
│   ├── 03-execution/
│   ├── 04-development/
│   └── decisions/        # ADR-NNN-nome.md
├── src/
├── supabase/
├── n8n/                  # pós-piloto
├── tests/
├── scripts/              # setup, migrações, manutenção
└── public/
```

## src/

```
src/
├── app/              # camada Next.js: rotas, layouts, providers, route handlers
│                     #   inclui route group /admin (Mission Control, ADR-011)
│                     #   nunca contém regra de negócio
├── features/         # centro da aplicação — um diretório por domínio
│   ├── inbox/
│   ├── conversations/
│   ├── contacts/
│   ├── leads/
│   ├── agent/
│   ├── dashboard/
│   ├── settings/
│   └── admin/        # features do Mission Control
├── core/             # conceitos usados por toda a aplicação
│   ├── auth/
│   ├── tenancy/      # contexto de empresa, memberships
│   ├── permissions/
│   ├── events/       # publicação/consumo de eventos de domínio
│   └── notifications/
├── shared/           # somente o realmente genérico — nunca usar como depósito
│   ├── components/   # ui base (shadcn), componentes comuns
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── constants/
└── infrastructure/   # comunicação com o mundo externo
    ├── supabase/     # client, tipos gerados
    ├── llm/          # adapter OpenAI/Vercel AI SDK
    ├── whatsapp/     # adapters de provider (evolution, meta)
    ├── storage/
    └── integrations/ # demais adapters
```

## Estrutura interna de uma feature

```
features/inbox/
├── components/
├── hooks/
├── services/       # lógica de negócio do domínio
├── schemas/        # Zod
├── types/
└── events/         # eventos que a feature publica/consome
```

Cada feature contém tudo que necessita. Teste: "esta feature continua funcionando se eu mover outra feature?" — se não, existe acoplamento excessivo.

## Regras de dependência

```
Permitido:  feature → core → infrastructure
            feature → shared
Proibido:   infrastructure → feature
            feature → feature (importação direta)
            core → feature
```

Comunicação entre features: **eventos ou serviços** — nunca importação direta (ex.: Inbox precisa de Lead → usa Lead Service ou reage a `lead.created`; nunca importa a tabela de Lead).

O frontend consome casos de uso — nunca acessa o banco diretamente. Nenhuma feature ignora tenant, permissões ou auditoria.

## supabase/

```
supabase/
├── migrations/     # toda alteração de banco; nunca editar produção manualmente
├── seed/           # apenas dados fictícios de desenvolvimento
├── functions/      # Edge Functions (webhooks, consumidores de fila)
└── types/          # tipos gerados
```

## n8n/ (pós-piloto)

```
n8n/
├── workflows/      # exportados e versionados: WF_SOURCE_EVENT_V1.json
├── templates/
└── docs/
```

## tests/

```
tests/
├── unit/
├── integration/    # inclui suíte de isolamento RLS (obrigatória no CI)
├── e2e/
└── fixtures/
```

## Convenções de localização

| O que | Onde |
|-------|------|
| Componente/hook/tipo específico de domínio | dentro da feature |
| Componente/hook/tipo genuinamente reutilizável | `shared/` |
| Integração externa | `infrastructure/` (adapter) |
| Conceito transversal (auth, tenancy, eventos) | `core/` |

- Imports sempre com alias `@/` (ex.: `@/features/inbox/components`) — nunca caminhos relativos profundos.
- Proibido criar `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts` sem responsabilidade clara.
- Nunca mover componente para `shared/` porque "talvez seja reutilizado" — apenas quando for.

## Crescimento

Toda nova funcionalidade responde: é uma feature? é core? é integração? é compartilhado? A resposta define a localização. Se uma funcionalidade cresce e vira capacidade opcional, vira módulo (ver `../02-architecture/module-architecture.md`).
