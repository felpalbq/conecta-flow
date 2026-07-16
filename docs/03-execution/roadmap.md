# Roadmap — Conecta Flow

Sequência de construção da plataforma. Princípio: construir o menor produto capaz de resolver a maior dor; não construir funcionalidades antes da necessidade. Velocidade sem arquitetura cria dívida; arquitetura sem execução cria documentação.

## Fases

```
FASE 0  Fundação (documentação + ambiente)
FASE 1  Experiência e Produto Visual (Lovable — paralela)
FASE 2  Core Operacional          → Marcos 1 e 2
FASE 3  Inteligência Artificial   → Marco 3
FASE 4  Valor + Piloto Interno    → Marco 4
────────────────────────────────── pós-piloto ──
FASE 5  Automação e Integrações (n8n, Meta API, Google Calendar)
FASE 6  Módulos Avançados (Agenda, Campanhas, Pagamentos, Landing Pages)
FASE 7  Escala SaaS (billing, planos, limites, onboarding)
```

O detalhamento executável das fases 0–4 (tarefas e critérios de aceite) está em `implementation-plan.md`.

## Fase 0 — Fundação

Documentação canônica em `docs/` + ADRs + CLAUDE.md + estrutura de repositório + padrões. Concluída quando o projeto possui documentação, estrutura e padrões definidos.

## Fase 1 — Experiência (Lovable, paralela)

Protótipo visual navegável com dados mockados: Home, Inbox, Contatos, Dashboard, Configurações. O produto nasce da experiência — validar fluxo, telas, navegação e percepção de valor antes/durante o código. Nunca é código de produção (ver `../04-development/lovable-workflow.md`). Critério: o usuário consegue se imaginar utilizando diariamente.

## Fases 2–4 — MVP em 4 marcos

| Marco | Entrega | Critério de aceite |
|-------|---------|--------------------|
| 1. Fundação segura | auth, companies, memberships, permissões, RLS | Empresa A não lê nada da Empresa B (teste automatizado) |
| 2. Inbox operacional | contatos, conversas, mensagens, Realtime, WhatsApp (Evolution) | mensagem real de celular respondida pela plataforma |
| 3. Agente inteligente | triagem, resposta, handoff, custo rastreado | IA resolve conversa simples e transfere quando deve |
| 4. Valor + piloto | dashboard, follow-up assistido, Mission Control mínimo | responder com dados reais: quantos atendimentos a IA fez e quanto custou |

**Piloto interno:** operação do fundador (soluções digitais para MPEs), 2–4 semanas, validando estabilidade, experiência, custos reais e gargalos. Usar internamente antes de vender.

## Pós-piloto (Fases 5–7)

Somente após validação do piloto:

- **RAG** (pgvector + embeddings OpenAI) — quando um cliente real tiver conhecimento que não cabe em contexto (ADR-013).
- **n8n** — follow-up automático, sincronizações, jobs (ADR-009).
- **Meta WhatsApp Cloud API** — gate obrigatório antes do 1º cliente pagante (ADR-014).
- **Módulos**: Agenda → Campanhas → Pagamentos → Landing Pages → Instagram. Critério: existe demanda real (o problema existe? pagam? usam diariamente?).
- **LGPD**: contratos/DPA antes do primeiro piloto externo.
- **Escala SaaS**: billing, planos, limites, métricas avançadas, onboarding, staging.

## Ordem das ferramentas

Lovable (experiência) → Claude Code (arquitetura e código) → Supabase (dados) → n8n (processos, pós-piloto) → APIs externas (conforme necessidade).

## Definition of Ready

Uma funcionalidade pode começar quando possui: objetivo definido, regra de negócio documentada, permissões definidas, impacto arquitetural avaliado, critério de aceite.

## Definition of Done

Uma funcionalidade está pronta quando possui: código implementado, testes mínimos, documentação atualizada, segurança validada, commit realizado.

## Objetivos

**Comercial:** não é ter uma plataforma completa — é provar que "esse sistema reduz perda de clientes e carga de atendimento".

**Técnico:** não é escalar — é criar uma base segura, modular e evolutiva.
