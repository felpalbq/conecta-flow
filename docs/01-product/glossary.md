# Glossary — Linguagem Ubíqua do Conecta Flow

Vocabulário canônico do domínio. Código, banco, eventos, permissões e documentação devem usar exatamente estes termos (identificadores em inglês; interface em pt-BR).

## Entidades

| Termo | Definição |
|-------|-----------|
| **Company** | Empresa cliente da plataforma. Unidade de isolamento (tenant). Tudo pertence a uma Company. |
| **Profile** | Identidade de uma pessoa que acessa o sistema (espelho de `auth.users`). |
| **Company Membership** | Vínculo Profile + Company, com role, permissões e status. Um usuário pode ter vários memberships (ADR-001). |
| **Contact** | Pessoa/organização que conversa com a empresa. Pertence à Company, nunca ao usuário. |
| **Conversation** | Entidade central. Relacionamento contínuo entre empresa e contato por um canal. Nunca é apagada. |
| **Message** | Unidade de comunicação dentro de uma Conversation (texto, imagem, áudio, vídeo, documento, localização, template). |
| **Channel** | Canal da conversa (whatsapp; futuros: instagram, landing_page, api). Nunca altera a lógica do domínio. |
| **Lead** | Oportunidade comercial. Nasce da qualificação de uma Conversation (ADR-002); nunca automaticamente. |
| **Lead Score** | Avaliação dinâmica da probabilidade comercial do Lead. Nunca depende apenas da IA. |
| **AI Agent** | Serviço cognitivo da empresa: modelo + memória + conhecimento + ferramentas + políticas + prompts. |
| **Timeline Event** | Registro imutável de uma ação relevante na conversa. Memória operacional e fonte de auditoria. |
| **Attachment** | Arquivo associado a uma Conversation (referência ao Storage; nunca binário no banco). |
| **Follow-up** | Ação futura planejada sobre uma conversa. Não é uma mensagem; pode gerar mensagens. |
| **Task** | Ação operacional atribuível (ligar, enviar proposta...). Pertence a uma Conversation. |
| **Summary** | Memória condensada da conversa gerada pela IA. Reduz contexto; nunca substitui o histórico. |
| **Module** | Capacidade opcional plugável (Scheduling, Payments, Campaigns...). Ativado por empresa. |
| **Integration** | Conexão externa de uma empresa (WhatsApp, Google, gateway de pagamento). Nunca contém regra de negócio. |
| **Event** | Fato ocorrido no sistema, imutável, publicado no event store (ADR-008). |
| **Usage** | Registro de consumo por empresa: mensagens, tokens, custo de IA, storage. |

## Estados da conversa (status)

`new → in_triage → active → waiting_customer → closed → archived`

Estados adicionais pós-MVP: `in_followup`, `scheduled`, `converted` (ver conversation-lifecycle.md).

## Responsável da conversa (owner_type)

`ai | user | queue` — exatamente um por vez. Separado do status (ADR-007).

## Categorias de triagem

`unknown | irrelevant | personal_contact | existing_customer | potential_lead`

## Origem de mensagem (sender_type)

`customer | agent | attendant | system`

## Nomenclaturas

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Eventos | `dominio.acao` (passado) | `conversation.message_received` |
| Permissões | `dominio.acao` | `contact.edit`, `conversation.assign` |
| Permissões platform | prefixo `platform.` | `platform.company.manage` |
| Workflows n8n | `WF_SOURCE_EVENT_V<n>` | `WF_WHATSAPP_MESSAGE_RECEIVED_V1` |
| Tabelas | snake_case plural | `conversations`, `company_memberships` |
| Colunas / FKs | snake_case / `<entity>_id` | `company_id`, `conversation_id` |
| Commits | `tipo: descrição` (inglês) | `feat: create conversation entity` |

## Termos de operação

| Termo | Definição |
|-------|-----------|
| **Handoff** | Transferência de responsável da conversa (IA→humano, humano→IA, humano→humano). Sempre registra motivo. |
| **Triagem** | Primeira classificação de toda conversa nova; regras determinísticas antes de LLM. |
| **Qualificação** | Avaliação comercial que pode criar um Lead. Nunca obrigatória. |
| **Mission Control** | Ambiente administrativo da plataforma (`/admin`). Invisível para clientes. |
| **Core** | Conjunto mínimo obrigatório: conversas, contatos, usuários, auth, eventos, IA, timeline, dashboard. |
| **Tenant** | Sinônimo técnico de Company. |
| **Adapter** | Camada que isola um provider externo atrás de interface normalizada (WhatsApp Adapter, LLM Adapter). |
| **Provider** | Fornecedor externo concreto (Evolution, Meta, OpenAI). O domínio nunca conhece providers. |
