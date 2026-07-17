# Implementation Plan — Conecta Flow

Plano executável das fases 0–4 do roadmap. As decisões que fundamentam este plano estão registradas em `../decisions/` (ADRs 001–014).

## Etapa A — Consolidação da Documentação (Fase 0)

- [x] Documentação canônica em `docs/` (produto, arquitetura, execução, desenvolvimento)
- [x] ADRs 001–014
- [x] Glossário (linguagem ubíqua)
- [x] CLAUDE.md autossuficiente
- [ ] Validação do Product Owner
- [x] Exclusão da pasta de instruções originais

**Critério:** qualquer pessoa (ou instância de Claude) entende e desenvolve o projeto lendo apenas `CLAUDE.md` + `docs/`.

## Etapa B — Marco 1: Fundação Segura

Ambiente confiável + multi-tenancy comprovadamente isolado. Nenhuma feature visível.

- [x] Scaffold Next.js + TypeScript strict + Tailwind + shadcn/ui
- [x] ESLint + Prettier + Vitest + GitHub Actions (typecheck, lint, test em todo PR)
- [x] Stack Supabase local (`supabase/config.toml`) + `.env.example` — **pendente:** criar o projeto Supabase cloud de development (requer decisão do usuário: organização/billing; ver checkpoint em `docs/04-development/supabase-guidelines.md`)
- [x] Migrations: extensions → companies → profiles → company_memberships → permissions → admin_users → audit_logs (+ funções de autorização e policies em migrations próprias, após todas as tabelas — necessário porque o Postgres valida corpos de função `language sql` contra o catálogo na criação)
- [x] RLS em todas as tabelas + **suíte de testes de isolamento no CI** (`tests/integration/rls`, job `rls-isolation` no CI)
- [x] Supabase Auth: login, logout, recuperação de senha (verificado ponta a ponta localmente, incluindo e-mail via Mailpit)
- [x] Layout base (identidade lilás/roxo), Home mínima, Configurações (perfil/empresa)
- [x] Seed de desenvolvimento: 2 empresas, 4 usuários (owner-only, attendant-only, 1 em duas empresas com papéis diferentes, 1 platform admin sem empresa)

**Critério de aceite:** usuário da Empresa A autenticado não lê nenhum dado da Empresa B (teste automatizado); usuário multi-empresa alterna contexto corretamente.

## Etapa C — Marco 2: Inbox Operacional

Conversar de verdade pelo WhatsApp através da plataforma.

- [ ] Migrations: contacts → conversations → messages → timeline_events → events (+ pgmq)
- [ ] Domínio de conversas: criação, estados, responsável, timeline
- [ ] Publicação de eventos (`conversation.created`, `conversation.message_received`, `conversation.message_sent`...)
- [ ] Inbox UI: lista + chat (padrão WhatsApp Web), envio/recebimento, Realtime
- [ ] Contatos: CRUD, tags, observações, vínculo com conversas
- [ ] VPS com Docker: Evolution API + Caddy
- [ ] WhatsApp Adapter (interface `NormalizedMessage`) + webhook Edge Function (`/webhooks/whatsapp/{company_token}`)
- [ ] Idempotência por `provider_message_id`

**Critério de aceite:** mensagem real de celular chega na Inbox em tempo real e a resposta chega no celular. Duas empresas com números diferentes operam sem interferência.

## Etapa D — Marco 3: Agente Inteligente

IA atendendo com triagem, resposta e handoff — custo controlado.

- [ ] Adapter LLM (Vercel AI SDK) — OpenAI: modelo econômico p/ triagem, modelo capaz p/ respostas (ADR-012)
- [ ] Tabela `usage` + registro de tokens/custo/latência por chamada e por empresa (desde a 1ª chamada)
- [ ] Configuração do agente por empresa: identidade, tom, políticas, FAQ estruturado (pré-RAG)
- [ ] Prompts versionados (`prompt_versions`)
- [ ] Triagem: regras determinísticas → classificação LLM (taxonomia canônica)
- [ ] Resposta automática com contexto (últimas mensagens + resumo + FAQ + políticas)
- [ ] Handoff: IA → humano (motivo), humano assume, humano devolve; eventos correspondentes
- [ ] Lead: criação na qualificação, score inicial por regras (não só LLM)

**Critério de aceite:** conversa simples resolvida pela IA sem intervenção; pedido de humano gera handoff visível na Inbox; custo de IA por empresa visível.

## Etapa E — Marco 4: Percepção de Valor + Piloto Interno

- [ ] Dashboard: conversas atendidas, IA × humano, leads, tempo de resposta, handoffs
- [ ] Follow-up manual/assistido: identificar conversas paradas, sugerir retomada
- [ ] Mission Control mínimo (`/admin`): empresas, usuários, consumo/custo IA, erros, saúde
- [ ] Sentry + alertas básicos
- [ ] Onboarding da empresa piloto (operação do fundador): cadastro, número WhatsApp, FAQ, políticas do agente
- [ ] Operar 2–4 semanas registrando: estabilidade, custos reais, gargalos, qualidade das respostas

**Critério de aceite:** responder com dados reais — quantos atendimentos a IA fez? quanto custou? quanto tempo humano economizou?

## Pós-piloto

Ver `roadmap.md` (Fases 5–7): RAG, n8n, Meta Cloud API, módulos, LGPD externa, staging, billing.

## Processo

- Protótipo Lovable pode correr em paralelo como referência visual — nunca código de produção.
- Branches `main` + `develop` + `feature/*`; migrations em PR próprio; commits `tipo: descrição`.
- Toda etapa termina com documentação atualizada (Definition of Done).
