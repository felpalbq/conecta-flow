# AI Agent Architecture — Conecta Flow

Arquitetura do Agente Conversacional. O agente é uma **camada cognitiva**: interpreta, responde, classifica, resume e sugere. Toda decisão definitiva pertence ao domínio da aplicação — nunca inverter essa responsabilidade. O agente é um funcionário digital: age com contexto, limites e responsabilidade.

## Papel

Deve: atender clientes, responder perguntas, interpretar intenções, realizar triagem, qualificar leads, executar follow-ups, solicitar handoff, resumir conversas, recuperar contexto, sugerir ações.

Nunca: alterar dados persistentes diretamente, tomar decisões comerciais irreversíveis, prometer condições não autorizadas, acessar dados de outra empresa, alterar configurações, substituir julgamento humano em situações críticas.

## Arquitetura

```
Mensagem → Channel Adapter → Conversation Service → evento →
Agent Orchestrator → Intent Analysis → Context Retrieval → Decision →
Response | Action | Handoff → Conversation Service → mensagem enviada
```

Camadas internas: **Input** (mensagem + contexto obrigatório — nunca apenas a última mensagem) → **Context** (histórico, contato, classificação, empresa, regras, conhecimento) → **Intelligence** (LLM: interpretação, classificação, decisão) → **Action** (responder, follow-up, classificar, solicitar humano) → **Memory**.

## Provider e modelos (ADR-012)

- Provider padrão: **OpenAI**, sempre atrás de camada de adaptador (Vercel AI SDK) — o restante do sistema nunca conhece o provider; troca é configuração.
- Estratégia de custo: **modelo econômico para triagem; modelo capaz para respostas e qualificação**. Cada empresa pode usar modelos diferentes.
- Fallback: se um provider falha, outro pode assumir sem alterar o domínio.
- Regra de ouro: uma regra determinística resolve? Use a regra. Só depois considere IA.

## Prompts

Versionados (`prompt_versions`): versão, empresa, autor, data, histórico. Nunca editar prompt em produção — toda alteração gera nova versão; versões antigas permanecem armazenadas.

Estrutura: Identidade → Objetivo → Contexto → Regras → Limitações → Ferramentas → Formato de resposta.

## Memória (três níveis)

| Nível | Escopo | Conteúdo |
|-------|--------|----------|
| Curto prazo | conversa | mensagens recentes — contexto imediato |
| Médio prazo | conversa/empresa | resumo automático periódico — reduz tokens |
| Longo prazo | cliente da empresa | preferências, histórico, relacionamento |

A IA nunca reconstrói contexto do zero.

## Conhecimento

Pertence à empresa; nunca compartilhado entre empresas.

- **MVP:** FAQ estruturado por empresa no banco (`knowledge_entries`), injetado no contexto (ADR-013).
- **Pós-piloto (RAG):** documentos → processamento → chunks → embeddings (OpenAI) → pgvector → busca contextual → prompt. Nunca enviar toda a base ao modelo. Isolamento obrigatório: `company_id` + namespace.

## Context Builder

Monta o contexto enviado ao modelo: resumo, últimas mensagens, lead, contato, empresa, regras/políticas, ferramentas, conhecimento recuperado — sempre respeitando limite de tokens.

## Policies

Cada empresa possui políticas que fazem parte do contexto: "nunca negociar preço", "sempre solicitar nome", "nunca responder questões jurídicas"...

## Ferramentas

O agente usa ferramentas controladas: consultar agenda, criar agendamento, gerar pagamento, consultar histórico, criar tarefa, pesquisar documentos, executar follow-up. Ferramentas **nunca acessam o banco diretamente** — sempre serviços da aplicação. Cada ferramenta possui permissão própria (`agent.can_schedule`...). O agente nunca possui acesso total. Módulos são expostos ao agente como ferramentas — nunca acoplados a ele.

## Triagem

Primeira função: filtrar com o menor custo. Regras determinísticas → classificador econômico. Categorias: `unknown / irrelevant / personal_contact / existing_customer / potential_lead`. Objetivo: reduzir custo e ruído, priorizar oportunidades. Somente após a triagem inicia-se qualificação.

## Qualificação e Lead Score

Após identificar potencial: interesse, urgência, poder de compra, momento, probabilidade. Atualizações sempre **através do domínio** — nunca diretamente. Score representa probabilidade, não certeza, e nunca depende apenas da IA.

## Handoff

O agente **solicita** handoff; nunca força. A política pertence à empresa. Motivos: pedido explícito, alta intenção, negociação, reclamação, situação complexa, baixa confiança, solicitação financeira.

Estados: `AI_ACTIVE → HUMAN_REQUESTED → HUMAN_ACTIVE → AI_RETURNED`. Eventos: `conversation.handoff_requested`, `conversation.human_takeover`, `conversation.returned_to_agent`. Após atendimento humano, a conversa pode retornar ao agente com contexto preservado.

## Follow-up

Identificar ausência de resposta, avaliar oportunidade, sugerir retomada, executar contato autorizado. Nunca mensagens insistentes — respeitar limites, frequência e políticas da empresa.

## Custos e observabilidade

**Toda interação registra** (tabela `usage`, desde a primeira chamada): modelo, tokens, tempo, custo, empresa. Além disso: latência, uso de ferramentas, falhas, fallbacks, versão do prompt. Alimenta o Mission Control e protege a margem do negócio.

Quando a IA falhar: registrar, não insistir, encaminhar humano quando necessário.

## Métricas

Mensagens atendidas, taxa de resolução, handoffs, conversões, custo de IA, tempo de resposta. Avaliação contínua: precisão, satisfação, custo, segurança.

## Segurança

O agente nunca: recebe dados de outra empresa, acessa segredos, executa código, altera permissões. Auditoria de cada interação: modelo, versão do prompt, ferramentas, resultado.

## Evolução

Novos modelos, providers, ferramentas e memórias nunca exigem alteração do domínio. Novas capacidades entram como ferramentas — nunca criar agentes completamente diferentes sem necessidade.
