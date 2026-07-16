# System Architecture — Conecta Flow

Arquitetura conceitual da plataforma e limites de comunicação entre componentes. Nenhuma implementação pode violar estes princípios sem uma decisão registrada (ADR).

## Camadas

```
Usuário
  ↓
Frontend (Next.js / React)
  ↓
Application Layer (route handlers, casos de uso)
  ↓
Domain Layer (regras de negócio, eventos)
  ↓
Infrastructure Layer (Supabase, adapters, LLM)
  ↓
Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
  ↓
Serviços externos (WhatsApp, OpenAI, ...)
```

Nenhuma camada pula outra. Toda comunicação atravessa apenas uma fronteira por vez.

## Responsabilidades por camada

### Frontend
Pode: renderizar telas, validar formulários (UX), controlar navegação, estado temporário, consumir APIs, assinar Realtime.
Nunca: tomar decisões de negócio, implementar regras comerciais, calcular score, executar automações, controlar permissões, acessar banco/SQL diretamente, chamar LLM.

### Application Layer
Coordena casos de uso: valida requisições (Zod), chama serviços de domínio, publica eventos, monta respostas. Nunca contém SQL, componentes ou lógica de infraestrutura. Vive nos route handlers do Next.js (ADR-009).

### Domain Layer
Representa o negócio: valida regras, modifica aggregates, emite eventos, garante consistência. Nunca conhece Supabase, React, n8n ou APIs externas. **Eventos são publicados apenas pelo Domain Layer.**

### Infrastructure Layer
Comunicação externa: Supabase client, Storage, adapters (WhatsApp, LLM, pagamentos, calendário). Nunca contém regra de negócio. Toda integração externa passa por adaptador — nunca espalhar chamadas HTTP pelo projeto.

### Banco de dados (Supabase/Postgres)
Armazenar, relacionar, proteger (RLS), indexar, auditar. Não executa lógica de negócio. Estrutura orientada ao domínio, nunca ao framework. Representa a verdade do sistema — toda informação persistente vive aqui, nunca no n8n nem no frontend.

### Event Bus
Toda alteração importante gera um evento. Eventos comunicam acontecimentos; nunca executam regras. Implementação: tabela `events` + Supabase Queues (ADR-008). Ver `event-architecture.md`.

### Automação (n8n) — pós-piloto
Orquestrador: integra sistemas, executa workflows, reage a eventos, controla filas, tarefas assíncronas. Nunca: regra de negócio, persistência principal, permissões, estado permanente. Entra na arquitetura apenas quando existirem automações reais (ADR-009).

### Serviços de IA
Responsabilidades exclusivamente cognitivas: interpretar, resumir, classificar, responder, sugerir, extrair. Nunca: decidir permissões, persistir dados diretamente, executar SQL, substituir regras determinísticas. Toda resposta passa pela Application Layer. Regra simples antes de IA, sempre.

### Integrações
Isoladas em adapters próprios (WhatsApp, Instagram, Calendário, Pagamentos, LLM). O domínio conhece apenas interfaces (`sendMessage()`, `receiveMessage()`), nunca providers concretos. Ver `integration-strategy.md`.

### Mission Control
Ambiente administrativo da plataforma. Usa exatamente as mesmas APIs e regras — apenas com permissões de escopo platform. Nunca cria atalhos administrativos nem acessa tabelas diretamente. Ver `mission-control.md`.

## Core e Módulos

O Core contém apenas capacidades universais: Conversas, Contatos, Usuários, Autenticação, Eventos, IA, Timeline, Dashboard. Funcionalidades específicas nascem como módulos independentes (instaláveis, removíveis, atualizáveis sem alterar o Core). Ver `module-architecture.md`.

## Fluxo de uma mensagem

```
Mensagem → Canal (provider) → Webhook (Edge Function) → Adapter (normalização)
  → Domínio (persistência + evento) → Fila → IA (quando necessário)
  → Domínio (resposta + evento) → Adapter → Canal → Cliente
                                  ↘ Realtime → Frontend → Usuário
```

O frontend nunca conversa diretamente com a IA. Toda comunicação passa pelo backend.

## Regras transversais

- **Tempo real:** o frontend apenas assina eventos via Supabase Realtime; nunca cria estados paralelos.
- **Storage:** uploads passam pelo Storage Service → Supabase Storage; o banco guarda apenas referências.
- **Banco vetorial (pós-piloto):** nunca acessado pelo frontend; toda consulta passa pelo serviço de IA.
- **Logs e erros:** cada camada gera seus próprios logs e trata seus próprios erros; nunca esconder erros críticos; sempre propagar contexto suficiente.

## Mapa de decisões

| Componente | Decide sobre |
|-----------|--------------|
| Frontend | Experiência |
| Backend (Application + Domain) | Regras |
| Banco | Persistência |
| Eventos | Comunicação |
| n8n | Orquestração |
| IA | Cognição |
| Mission Control | Administração |

Essa separação nunca deve ser quebrada. Toda nova funcionalidade responde: "em qual camada ela pertence?" — se a resposta não for clara, revisar a arquitetura antes de implementar.

## Princípio final

O sistema deve permanecer simples. Quanto maior o crescimento do produto, maior a disciplina arquitetural. A complexidade nunca é transferida para o usuário — permanece dentro da plataforma.
