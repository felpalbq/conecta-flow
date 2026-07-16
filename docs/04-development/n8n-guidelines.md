# n8n Guidelines — Conecta Flow

O n8n é um **orquestrador de eventos e integrações** — nunca o backend, nunca fonte de regras de negócio. A aplicação decide; o n8n executa. **Entra na arquitetura pós-piloto** (ADR-009), quando existirem automações reais (follow-up automático, sincronizações, jobs).

Critério de qualidade: se um workflow desaparecer hoje, a aplicação continua consistente. O n8n acelera processos — nunca define o comportamento do sistema.

## Responsabilidades

**Sempre no n8n:** chamadas HTTP, integrações, webhooks, cron jobs, notificações, filas, transformações simples, retentativas, execuções assíncronas.

**Nunca no n8n:** regras comerciais, autenticação/autorização, permissões, lead score, RAG, memória da IA, persistência principal, SQL complexo, lógica de planos/módulos, interpretação de mensagens, decisões comerciais.

## Arquitetura

```
Evento → Application → Webhook → n8n → Integrações → resultado → Application
```

Toda alteração definitiva retorna para a aplicação. Preferência de acesso a dados: Application API → Edge Functions → RPC → SQL (último recurso). O n8n nunca acessa tabelas críticas diretamente quando existir API. O n8n nunca conversa diretamente com o modelo LLM — sempre via serviço do Conversation Agent.

## Multi-tenant

Um workflow atende todas as empresas (personalização por configuração — ver `../02-architecture/integration-strategy.md`). Todo workflow identifica o `company_id` do evento antes de executar. Nunca criar workflow por cliente (exceção enterprise documentada).

## Padrões de workflow

- **Nomenclatura (ADR-005):** `WF_SOURCE_EVENT_V<n>` — ex.: `WF_WHATSAPP_MESSAGE_RECEIVED_V1`, `WF_FOLLOWUP_EXECUTION_V1`.
- **Categorias:** Incoming Events, Background Jobs, Notifications, Integrations. Pastas organizadas por domínio.
- **Estrutura:** Trigger → Validation → Processing → Application Action → Logging → Response.
- Um workflow = uma responsabilidade. Nunca workflows gigantes nem "temporários". Todo workflow possui documentação, nome, versão, data e histórico.

## Entrada e saída

- Toda entrada validada — nunca confiar em payloads externos.
- Toda saída com: status, timestamp, correlation_id, empresa, origem, resultado.
- Webhooks: validar origem e assinatura, registrar evento, responder rapidamente.

## Erros e retentativas

- Todo erro: registra log, notifica quando crítico, permite retentativa. Nunca falhar silenciosamente.
- Retry apenas em: timeout, erro temporário, rate limit. **Nunca repetir operações destrutivas automaticamente.**
- Idempotência obrigatória: reexecutar sem efeitos duplicados.

## Logs e observabilidade

Registrar por execução: workflow, empresa, evento, início/fim/duração, resultado, erro (payload resumido). Nunca informações sensíveis. Mission Control acompanha saúde, erros e consumo — não administra workflows diariamente.

## Segredos

Credentials Manager do n8n + environment variables. Nunca: hardcode, tokens em nós, dentro do JSON exportado, GitHub, documentação.

## Versionamento

Workflows exportados e versionados no Git (`n8n/workflows/WF_*.json`). Nova versão = novo sufixo (`V1 → V2`); nunca sobrescrever histórico. Nunca manter workflows apenas dentro do n8n — exportar periodicamente.

## Infraestrutura

Docker Compose em VPS (com a Evolution API durante o piloto), atrás de Caddy, com autenticação, acesso restrito e backups.
