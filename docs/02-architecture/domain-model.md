# Domain Model — Conecta Flow

Modelo de domínio: os objetos que existem no sistema e como se relacionam. Não descreve tabelas, APIs ou tecnologias (ver `database-model.md` para o modelo persistido).

## Filosofia

O Conecta Flow é um **Conversation Engine**. A Conversation é a entidade central; todo o restante existe para enriquecê-la, organizá-la ou automatizá-la. Toda entidade deve responder: "como ela melhora uma Conversation?"

## Entidades

### Company
Empresa cliente. **Unidade de isolamento da arquitetura** — tudo pertence a uma Company (ver `multi-tenancy.md`). Possui: memberships, conversas, contatos, integrações, módulos, configurações, agente, métricas.

### Profile (usuário)
Pessoa que acessa o sistema. Um usuário pode pertencer a uma ou mais empresas através de **Company Membership** (ADR-001). Não existem tipos de usuário — existem permissões diferentes por membership.

### Company Membership
Relação Profile + Company: role, permissões, status. É o objeto que dá contexto de tenant à sessão.

### Contact
Pessoa ou organização que conversa com a empresa. Pertence à Company (nunca ao usuário). Pode ter várias conversas ao longo do tempo e múltiplas identidades de canal (WhatsApp, e-mail...). Nunca assumir que um canal representa uma pessoa única.

### Conversation
Relacionamento contínuo entre empresa e contato por um canal — nunca apenas uma troca de mensagens. Possui: Contact, Company, Channel, Messages, Timeline Events, responsável atual, contexto de IA, Lead (quando existir), Attachments, Follow-ups, Tasks, Summaries. Nunca é destruída; apenas encerrada/arquivada. Estados e ciclo completo em `conversation-lifecycle.md`.

### Message
Unidade de comunicação (texto, imagem, áudio, vídeo, documento, localização, contato, template). Pertence a exatamente uma Conversation. Nunca apagada.

### Channel
Canal da conversa (whatsapp; futuros: instagram, landing_page, api). Muda apenas a origem — nunca a lógica do domínio.

### AI Agent
Camada cognitiva da empresa: modelo + memória + conhecimento + ferramentas + políticas + prompts + contexto. Atua sobre conversas, nunca diretamente sobre usuários. Ver `ai-agent-architecture.md`.

### Lead
Oportunidade comercial. **Nasce da qualificação de uma Conversation** (ADR-002), nunca automaticamente — um contato pode gerar oportunidades diferentes ao longo do tempo, cada uma a partir de uma conversa. Carrega `contact_id` denormalizado. Possui: estágio, score, potencial, intenção, prioridade, origem, status. Toda qualificação pertence ao Lead, nunca à Conversation.

### Lead Score
Avaliação dinâmica (nunca definitiva) baseada em interesse, comportamento, frequência, origem, respostas, histórico. O algoritmo pode evoluir sem alterar o domínio. Nunca depende apenas da IA.

### Timeline Event
Registro imutável de toda ação relevante (mensagem, handoff, qualificação, pagamento...). Memória operacional e principal fonte de auditoria da conversa. Pertence à Conversation.

### Attachment, Follow-up, Task, Summary
Pertencem à Conversation; nunca existem isoladamente. Follow-up é uma ação futura (não uma mensagem). Summary é memória condensada gerada pela IA — nunca substitui o histórico.

### Module, Integration, Plan, Usage
Module: capacidade opcional ativada por empresa. Integration: conexão externa com credenciais próprias por empresa. Plan: combinação comercial de módulos. Usage: consumo por empresa (mensagens, tokens, custo IA, storage) — alimenta o Mission Control.

### Schedule / Payment / Campaign
Não pertencem ao Core — são entidades dos módulos opcionais. Sempre removíveis sem afetar o domínio principal.

## Aggregates

Cada aggregate tem um único root; somente o root modifica seus objetos internos.

| Aggregate Root | Contém | Responsabilidades |
|---------------|--------|-------------------|
| **Company** | memberships, módulos, integrações, configurações, agente, horários, respostas rápidas | criar empresa, ativar módulos, gerenciar usuários/integrações. Nunca gerencia conversas |
| **Conversation** (o mais importante) | messages, timeline, notes, tasks, attachments, summaries, owner, contexto IA, status | receber mensagens, registrar eventos, transferências, encerramento |
| **Contact** | telefones, e-mails, tags, preferências, metadata | cadastro, atualização, identificação. Nunca possui mensagens |
| **Lead** | score, qualificação, estágio, prioridade, dados de oportunidade | qualificação, conversão, perda, reativação |
| **Agent Configuration** | prompts, políticas, conhecimento, ferramentas, modelo | responder, classificar, resumir, sugerir. Nunca altera dados do domínio diretamente |
| **Appointment / Campaign / Payment** (módulos) | próprios | próprios do módulo |

Timeline, Follow-up e Task pertencem ao aggregate Conversation.

## Comunicação entre aggregates

Aggregates nunca se modificam diretamente. Sempre: **evento → serviço de domínio → caso de uso**.

Exemplo: `Conversation` publica `lead.qualified` → Lead Service atualiza o aggregate `Lead`. Nunca Conversation altera Lead diretamente.

**Transações:** uma transação altera apenas um aggregate sempre que possível; múltiplos aggregates mudam via eventos. Consistência imediata dentro do aggregate; eventual entre aggregates.

## Regras fundamentais

- Mensagens: nunca apagar. Conversas: histórico preservado. Empresas: sempre isoladas.
- A IA nunca modifica aggregates diretamente — gera sugestões ou solicita ações via serviços da aplicação. O Mission Control segue a mesma regra.
- O domínio deve permanecer pequeno. Nunca alterá-lo para atender necessidade específica de um cliente.
- O modelo deve permitir evolução futura: múltiplos canais, múltiplos agentes, múltiplos números, equipes maiores.
