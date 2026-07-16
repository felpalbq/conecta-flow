# Event Architecture — Conecta Flow

Arquitetura orientada a eventos. Toda alteração relevante gera um evento. Eventos representam **fatos ocorridos** — nunca intenções ("conversation.message_received", nunca "process_customer_message"). O passado não pode ser alterado: eventos são imutáveis; estados atuais são consequência.

## Implementação (ADR-008)

- **Event store:** tabela `events`, gravada **na mesma transação** da mudança de estado que a originou. Publicada apenas pelo Domain Layer.
- **Consumo assíncrono:** Supabase Queues (pgmq). Falhas usam `retry_count`; após esgotar tentativas, o item permanece na fila com status de falha (dead letter) para análise e alerta.
- **Frontend:** Supabase Realtime (novas mensagens, mudanças de status). O frontend apenas assina — nunca cria estados paralelos.
- **n8n (pós-piloto):** consome eventos via webhook/fila quando existir automação externa. Nunca é fonte de verdade — o evento nasce no domínio.

## Estrutura padrão

```json
{
  "event_id": "uuid",
  "event_type": "conversation.message_received",
  "version": "1.0",
  "timestamp": "UTC",
  "company_id": "uuid",
  "actor": "user | agent | system | integration",
  "source": "webapp | whatsapp | scheduler | n8n | mission_control",
  "correlation_id": "uuid",
  "payload": {}
}
```

- `event_id`: idempotência, auditoria, rastreamento.
- `event_type`: formato `dominio.acao` (ADR-005).
- `version`: contrato versionado — eventos evoluem sem quebrar consumidores; nunca alterar o significado de um evento existente.
- `company_id`: obrigatório quando relacionado a empresa — garante isolamento e rastreabilidade.
- `correlation_id`: acompanha a cadeia completa (mensagem → IA → handoff → notificação).

## Categorias

**Domain Events** (mudanças do negócio), **Integration Events** (de/para sistemas externos) e **System Events** (operacionais).

## Catálogo inicial

| Domínio | Eventos |
|---------|---------|
| conversation | `created`, `message_received`, `message_sent`, `assigned`, `transferred`, `handoff_requested`, `human_takeover`, `returned_to_agent`, `closed`, `archived`, `reopened` |
| lead | `created`, `classified`, `qualified`, `scored`, `converted`, `lost`, `reactivated` |
| agent | `started_processing`, `responded`, `failed`, `escalated`, `summary_generated` |
| followup | `created`, `executed`, `completed`, `cancelled` |
| user | `logged_in`, `note_added`, `task_completed` |
| company | `created`, `updated`, `module.enabled`, `module.disabled` |
| integration | `connected`, `disconnected`, `error` |
| appointment (módulo) | `created`, `confirmed`, `cancelled`, `rescheduled`, `completed` |
| payment (módulo) | `link_created`, `completed`, `failed` |
| system | `workflow.executed`, `workflow.failed`, `webhook.received`, `backup.finished`, `error.registered` |
| admin | `company_created`, `permission_changed` (toda ação administrativa) |

Novos eventos devem: ser documentados aqui, possuir versão e não quebrar consumidores existentes.

## Produtores e consumidores

Produzem: aplicação (Domain Layer), integrações/adapters, agente IA, jobs internos, n8n (pós-piloto).
Consomem: aplicação, frontend (Realtime), dashboard, IA, notificações, auditoria, Mission Control, n8n.

**Quem produz não conhece os consumidores.** Novos módulos apenas adicionam consumidores — nunca modificam eventos existentes. Nenhum consumidor conhece os demais.

## Regras de processamento

- **Eventos nunca executam lógica** — apenas informam. Consumidores reagem de forma independente.
- **Ordem:** nunca assumir ordem fixa; todo consumidor deve ser resiliente e não depender de outro ter terminado.
- **Idempotência:** todo consumidor processa o mesmo evento mais de uma vez sem efeito colateral. Mensagens duplicadas são detectadas por `event_id` e `provider_message_id` antes de criar registros.
- **Imutabilidade:** eventos nunca são alterados, apagados ou reescritos. Se algo muda, um novo evento é criado.
- **Retenção:** eventos críticos, retenção longa; operacionais, configurável.

## Usos derivados

- **Auditoria:** baseada em eventos, nunca em estados — permite reconstruir toda a operação.
- **Dashboard:** indicadores calculados a partir de eventos, nunca consultas específicas por tela.
- **IA:** reage a eventos; nunca monitora tabelas.
- **Mission Control:** acompanha o fluxo de eventos em tempo real sem acessar módulos internos.

## Regra final

Eventos são a linguagem comum do sistema. O Conecta Flow evolui adicionando novos consumidores — nunca criando dependências frágeis.
