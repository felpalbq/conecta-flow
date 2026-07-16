# Database Model — Conecta Flow

Modelo lógico do banco (Supabase/Postgres). Não contém SQL nem migrations — as migrations são geradas a partir deste documento. O banco reflete o domínio, nunca o contrário.

## Convenções

- Identificadores: UUID. Tabelas: snake_case plural. Colunas: snake_case. PK: `id`. FK: `<entity>_id`.
- Colunas padrão em toda tabela: `id`, `created_at`, `updated_at`; quando aplicável: `deleted_at` (soft delete), `created_by`, `updated_by`, `version` (concorrência otimista em entidades críticas).
- **`company_id` obrigatório em TODA tabela operacional** — inclusive `messages`, `timeline_events`, `leads` etc. (ADR-006). RLS vira filtro direto, sem joins.
- RLS obrigatório em todas as tabelas de negócio. Ausência de política = acesso negado. Mission Control usa políticas próprias de escopo platform.

## Identidade e tenancy

| Tabela | Campos principais | Notas |
|--------|-------------------|-------|
| `companies` | name, slug, status, timezone, locale, plan | tenant principal |
| `profiles` | name, email, avatar_url, status, last_login | espelho de `auth.users` |
| `company_memberships` | profile_id, company_id, role, permissions, status | vínculo multi-empresa (ADR-001) |
| `permissions` | key (`dominio.acao`), description | catálogo global |
| `admin_users` | profile_id, permissions, status | administradores da plataforma (Mission Control) |
| `audit_logs` | actor, company_id, action, entity, metadata, timestamp | imutável; nunca apagar/alterar |

## Core operacional

| Tabela | Campos principais | Notas |
|--------|-------------------|-------|
| `contacts` | company_id, name, phone, email, origin, tags, notes, status, last_interaction | |
| `conversations` | company_id, contact_id, channel, status, owner_type (`ai/user/queue`), assigned_user_id, priority, last_message_at, last_summary | centro do sistema |
| `messages` | company_id, conversation_id, sender_type, message_type, content, attachment_id, status, provider_message_id, sent_at, received_at | `provider_message_id` garante idempotência; nunca apagar |
| `attachments` | company_id, conversation_id, storage_path, mime_type, size, checksum, thumbnail | binário no Storage, nunca no banco |
| `leads` | company_id, conversation_id, contact_id, score, stage, potential, temperature, probability, status, qualified_at | ADR-002 |
| `timeline_events` | company_id, conversation_id, event_type, payload, source, created_at | imutável |
| `followups` | company_id, conversation_id, scheduled_for, status, reason, created_by | |
| `tasks` | company_id, conversation_id, assigned_to, title, status, priority, due_date | |
| `summaries` | company_id, conversation_id, summary, generated_by, generated_at | |

## Eventos e consumo

| Tabela | Campos principais | Notas |
|--------|-------------------|-------|
| `events` | event_type, version, company_id, actor, source, correlation_id, payload, created_at, processed_at | event store imutável (ADR-008); gravado na mesma transação da mudança |
| `usage` | company_id, kind (tokens/messages/storage/...), model, quantity, cost, latency, metadata, created_at | custo de IA desde a 1ª chamada |

Filas de processamento: Supabase Queues (pgmq) — `retry_count` e status fazem o papel de DLQ.

## Configuração

`company_settings`, `company_modules` (module_id, enabled, activated_at), `company_integrations` (integration_type, provider, credentials_reference, status, configuration — ver `integration-strategy.md`), `company_business_hours`, `quick_replies`, `agent_configurations`, `prompt_versions` (versão, autor, data, histórico — nunca editar prompt em produção).

## IA (pós-piloto para RAG — ADR-013)

MVP: FAQ estruturado por empresa (`knowledge_entries` simples). Pós-piloto: `knowledge_documents`, `knowledge_chunks`, `embeddings` (pgvector; sempre com `company_id` — nunca misturar embeddings entre empresas; nunca armazenar embeddings junto das mensagens), `ai_memory`, `conversation_context`, `tool_calls`.

## Módulos (quando ativados)

`appointments`, `appointment_reminders`, `payment_links`, `payments`, `campaigns`, `campaign_contacts`, `landing_pages`, `forms`, `webhooks`. Cada módulo possui suas próprias tabelas — nunca misturar com as do Core.

## Mission Control

`admin_users`, `system_logs`, `audit_logs`, `tenant_health`, `workflow_health`, `integration_health`, `system_events`.

## Soft delete e imutabilidade

- Soft delete (`deleted_at`): registros importantes nunca são removidos fisicamente.
- Nunca apagar nem modificar: `messages`, `timeline_events`, `audit_logs`, `events`, `payments`.
- LGPD: eliminação atende-se por **anonimização** (remove PII, preserva registros e métricas) — ver `security-model.md`.

## Índices

Criar para: `company_id` (toda tabela principal), `conversation_id`, `contact_id`, `phone`, `email`, `status`, `last_message_at`, `created_at`, `event_type`. Full Text Search em: `contacts`, `messages`, `summaries`, conhecimento.

## Storage

Estrutura lógica isolada por tenant:

```
storage/{company_id}/conversations/ | knowledge/ | uploads/
```

Arquivos privados; nunca URLs públicas permanentes.

## Regras

- Toda alteração estrutural via migration (`supabase/migrations/`); nunca alterar produção manualmente; migrations em PR próprio.
- Seeds apenas com dados fictícios — nunca dados reais em desenvolvimento.
- Ordem das migrations iniciais: extensions → companies → profiles → memberships → permissions → admin_users → audit_logs → core entities → policies.
- Backups criptografados, preservando isolamento, eventos, auditoria e integridade referencial. Restauração por empresa deve ser possível.
