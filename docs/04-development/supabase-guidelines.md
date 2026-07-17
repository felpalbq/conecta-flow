# Supabase Guidelines — Conecta Flow

Como o Supabase é utilizado como infraestrutura principal. O Supabase protege o domínio — nunca é apenas um lugar onde dados são guardados. Não deve conter: regras complexas de negócio, decisões da IA, workflows de automação, lógica comercial.

## Serviços

```
Application → supabase-js → Auth | PostgreSQL | Storage | Realtime | Edge Functions | Queues
```

## Banco

- O banco representa o domínio (modelo em `../02-architecture/database-model.md`).
- `company_id` em todas as entidades empresariais, com índice (ADR-006).
- **RLS obrigatório**: nenhuma tabela de negócio existe sem política + teste de isolamento. Ausência de política = acesso negado.

## Auth

- Supabase Auth: e-mail/senha, recuperação, sessão. OAuth/magic link são evolução futura.
- Relacionamento identidade → domínio: `auth.users → profiles → company_memberships → companies` (ADR-001).
- Autorização: frontend (UX) + backend (validação) + RLS (última camada). Nunca confiar apenas no frontend.

## Migrations

- Toda alteração estrutural via migration em `supabase/migrations/`. Nunca alterar produção manualmente.
- Ordem inicial: extensions → companies → profiles → memberships → permissions → admin_users → audit_logs → core entities → policies.
- Migrations têm commit próprio, com documentação e teste.
- Tipos gerados (`supabase gen types`) versionados em `supabase/types/`.

## Seed

Apenas desenvolvimento/testes. Nunca dados reais.

## Storage

- Estrutura isolada por tenant: `storage/{company_id}/{conversations|knowledge|uploads}/`.
- Arquivos privados; nunca URLs públicas permanentes; banco guarda apenas referências.

## Realtime

- Uso: atualizações instantâneas da Inbox (novas mensagens, status, eventos da conversa).
- Nunca usar Realtime para processos complexos — para isso existem filas.

## Edge Functions

Usar quando: webhook externo, execução segura de segredo, consumidor de fila, endpoint específico. **Não colocar toda a regra do sistema** — casos de uso vivem na aplicação (ADR-009).

## Database Functions

Apenas quando a operação é naturalmente do banco ou exige consistência transacional.

## Queues (pgmq)

Consumo assíncrono de eventos (ADR-008): `retry_count`, status de falha como dead letter, alertas em falha definitiva.

## Vetores / RAG (pós-piloto, ADR-013)

pgvector com separação `knowledge_documents → knowledge_chunks → embeddings`, sempre com `company_id`.

## Auditoria e eventos

- `audit_logs` (actor, company_id, action, entity, metadata, timestamp) — imutável.
- `events` — event store (ver `../02-architecture/event-architecture.md`).

## MCP Supabase

Claude Code pode usar o MCP do Supabase para: consultar estrutura, criar migrations, validar dados, auxiliar desenvolvimento. Credenciais adicionadas manualmente; nunca armazenar tokens.

## Ambientes

Development → Staging (pós-piloto) → Production. Cada ambiente com banco, credenciais, storage e configurações próprios — nunca compartilhar credenciais. Produção com backup, recuperação e monitoramento.

## Checklist antes de usar o banco

- [ ] Multi-tenancy definido
- [ ] RLS planejado (+ teste de isolamento)
- [ ] Auth definido
- [ ] Migrations configuradas
- [ ] Storage protegido
- [ ] Ambientes separados
