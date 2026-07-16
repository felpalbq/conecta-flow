# Integration Strategy — Conecta Flow

Estratégia de integrações externas em arquitetura SaaS multi-tenant. Integrações são portas; o produto é o sistema interno. Nunca construir o produto em cima de uma porta específica.

## Princípio: adapters

Toda integração possui camada de abstração:

```
External Provider → Integration Adapter → Application Domain
```

O domínio nunca chama Meta API, Evolution API ou Google API diretamente. Conhece apenas interfaces: `sendMessage()`, `receiveMessage()`, `getConversationHistory()`. Nunca espalhar chamadas HTTP pelo projeto.

## Multi-tenant: personalização por configuração, não por código

Cada empresa possui suas integrações (tabela `company_integrations`: integration_type, provider, credentials_reference, status, configuration), mas a plataforma tem arquitetura única. Nunca criar workflow/código próprio por cliente — o mesmo `WF_WHATSAPP_MESSAGE_RECEIVED_V1` atende todas as empresas:

```
Webhook → identifica company_id → busca configuração → seleciona provider
        → normaliza evento → envia à aplicação
```

Empresas podem ter providers diferentes (A usa Evolution, B usa Meta), mensagens padrão, regras de handoff, horários e comportamento de IA diferentes — tudo configuração. Exceção enterprise (`CUSTOM_ADAPTER_X`) é rara e documentada. A arquitetura suporta 10, 100 ou 1000 empresas sem criar uma aplicação por cliente.

## Interface normalizada

Todos os providers de um tipo entregam o mesmo contrato. Ex.: WhatsApp → `NormalizedMessage { company_id, phone, message, media, timestamp, provider }`, `NormalizedContact`, `MessageStatus`.

## Prioridade de integrações

1. WhatsApp → 2. LLM → 3. RAG/vetores (pós-piloto) → 4. Google Calendar → 5. Instagram → 6. Pagamentos → 7. Landing Pages

### 1. WhatsApp (integração principal)

- **Piloto:** Evolution API (VPS Docker) — baixo custo, rápida implementação. **Não representa arquitetura definitiva** e não é compatível com os termos do WhatsApp: uso restrito ao piloto interno com número dedicado.
- **Gate obrigatório (ADR-014):** migrar para **Meta WhatsApp Cloud API** antes do primeiro cliente pagante — troca apenas o adapter.
- Adapter responsável por: receber/enviar mensagens e mídia, eventos, status. **Não responsável por:** classificação, score, IA, decisão comercial, interpretação de mensagens.

Fluxo de entrada: cliente → provider → webhook (Edge Function `/webhooks/whatsapp/{company_token}`) → adapter (normalização) → Conversation Domain → Agent.
Fluxo de saída: Agent/Humano → Conversation Domain → adapter → provider → cliente.

### 2. LLM (ADR-012)

Provider padrão OpenAI via adaptador (Vercel AI SDK). Nunca acoplar a um único fornecedor. Monitorar: tokens, custo, latência, erros. Ver `ai-agent-architecture.md`.

### 3. RAG (pós-piloto, ADR-013)

Conhecimento da empresa → processamento → embeddings → pgvector → contexto do agente. Isolamento por `company_id`; nunca misturar conhecimento entre clientes.

### 4–7. Google Calendar, Instagram, Pagamentos, Landing Pages

Módulos futuros. Instagram/canais apenas geram entrada (novo Channel) — nunca alteram o Core. Pagamentos pertencem ao Payment Module. Landing Page: formulário → integration → Contact criado → Conversation → Agent.

## Webhooks

Toda entrada externa: endpoint próprio, validação (origem, assinatura, payload, timestamp), logs, tratamento de erro, resposta rápida. Nunca processar diretamente:

```
Webhook → External Event → Domain Event → Business Logic
```

## Credenciais

Por empresa, nunca globais, nunca compartilhadas. Vivem em environment variables / secret manager / credentials manager — nunca em código, GitHub, banco público ou documentação.

## Monitoramento e falhas

Toda integração informa: status, última sincronização, erro recente — visível no Mission Control (ex.: WhatsApp CONNECTED · LLM CONNECTED · Calendar ERROR). Falhas: registrar → retry → alertar.

## Nova integração — checklist

1. Documentação → 2. Adapter → 3. Eventos → 4. Permissões → 5. Testes. Dados externos respeitam: tenant, permissões, auditoria.
