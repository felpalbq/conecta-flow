# Conversation Lifecycle — Conecta Flow

Ciclo de vida completo da conversa, a entidade central da plataforma. Todo desenvolvimento de atendimento respeita este documento.

## Princípio fundamental

**Conversa ≠ Lead.** Uma conversa nasce antes de existir um lead; o Lead é apenas um possível desdobramento (ADR-002). Nem toda conversa vira oportunidade comercial.

## Máquina de estados canônica (ADR-007)

Dois conceitos separados:

**Status** — em que fase a conversa está:

```
new → in_triage → active ⇄ waiting_customer → closed → archived
```

Estados adicionais pós-MVP: `in_followup`, `scheduled`, `converted`. O MVP implementa o subconjunto acima; a conversa pode voltar a estados anteriores sempre que necessário (ex.: `closed → active` quando o cliente retorna). Uma conversa nunca é destruída — apenas `closed`, `archived`, silenciada ou bloqueada, todas auditáveis.

**Responsável (owner_type)** — quem atende agora: `ai | user | queue`. Exatamente um por vez, sempre visível na interface. "Em atendimento IA" e "em atendimento humano" são valores do responsável, não do status.

## Ciclo geral

```
Nova mensagem → Triagem → Identificação → Decisão → Atendimento
  → Qualificação → Conversão → Relacionamento → Reativação → Encerramento
```

### 1. Nova conversa
Criada quando um canal recebe a primeira mensagem. Neste momento o sistema conhece apenas: canal, número, data, mensagem inicial.

### 2. Triagem
Objetivo: descobrir se vale a pena continuar, com o **menor custo computacional possível** (regras → classificadores → IA, nesta ordem). Identifica: spam, mensagem automática, engano, contato pessoal, fornecedor, funcionário, curiosidade sem intenção, cliente existente, possível novo cliente.

Categorias: `unknown | irrelevant | personal_contact | existing_customer | potential_lead`.

Resultado: arquivar, ignorar, bloquear, responder automaticamente ou continuar atendimento.

### 3. Identificação
Quem está falando? Cliente novo, cliente antigo, parceiro, fornecedor, funcionário, desconhecido. Se existe histórico, todo o contexto é recuperado.

### 4. Primeira decisão
Quem assume: IA, humano, fila ou outro usuário. Depende da política operacional da empresa — nunca é fixa.

### 5. Atendimento
A conversa alterna entre IA e humanos quantas vezes for necessário. O responsável atual está sempre visível. O contexto acompanha a conversa (nunca o usuário) e permanece nas trocas de responsável.

### 6. Qualificação
Acontece apenas quando faz sentido — nunca é obrigatória. Define: interesse, urgência, necessidade, potencial, orçamento, intenção. **Somente agora nasce o Lead.**

### 7. Lead Score
Calculado após a qualificação a partir de interesse, comportamento, frequência, origem, respostas, interação, histórico. O algoritmo pode evoluir; nunca depende apenas da IA.

### 8. Próxima ação
Toda conversa importante possui uma próxima ação: aguardar cliente, responder, agendar, enviar proposta, cobrar retorno, finalizar, transferir, follow-up. Nenhuma conversa importante fica sem próximo passo.

### 9. Conversão
Eventos possíveis: venda, orçamento aprovado, pagamento, agendamento, contrato, cadastro. O Core não define como acontece — módulos adicionam novos eventos de conversão.

### 10. Relacionamento
Após resolver a necessidade, a conversa continua existindo. A IA pode: agradecer, acompanhar, lembrar, solicitar feedback, oferecer novos serviços. O relacionamento nunca termina na venda.

### 11. Reativação
Clientes antigos voltam ou são reativados: follow-up, campanhas, lembretes, retorno periódico. O histórico completo permanece disponível.

### 12. Encerramento
`closed` ou `archived` — nunca apagada.

## Timeline

Toda ação relevante gera um Timeline Event imutável: mensagem enviada/recebida, IA respondeu, usuário assumiu/devolveu, lead qualificado, score atualizado, agendamento criado, pagamento confirmado, follow-up executado, conversa encerrada. É a principal fonte de auditoria da plataforma.

## Contexto e memória

O contexto acompanha a conversa: resumo, histórico, score, intenção, preferências, anexos, observações, tarefas, eventos. A IA nunca reconstrói contexto do zero — usa memória resumida, histórico, conhecimento e informações estruturadas. Evitar processamento repetitivo.

## Eventos

O sistema é orientado a eventos: toda alteração relevante gera um evento que pode disparar workflows, notificações, IA, integrações, auditoria e métricas. Nunca depender apenas do estado atual. Ver `event-architecture.md`.

## Regra fundamental

O usuário trabalha na conversa. A plataforma trabalha ao redor dela. Toda funcionalidade nova deve justificar como melhora o ciclo de vida da conversa — caso contrário, pertence a outro sistema.
