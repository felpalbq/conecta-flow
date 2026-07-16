# Module Architecture — Conecta Flow

Como funcionalidades opcionais são construídas, ativadas e gerenciadas. O Core resolve a maior dor comum (80% dos clientes); módulos expandem capacidades (20% mais complexos). Uma empresa nunca troca de sistema para evoluir — apenas desbloqueia funcionalidades. Existe apenas um produto.

## Estrutura

```
Platform
  └── Core (sempre presente, nunca removível)
        ├── Scheduling   (opcional)
        ├── Campaigns    (opcional)
        ├── Payments     (opcional)
        ├── Landing Pages(opcional)
        └── Social/Canais(opcional)
```

## Core

Conversation Inbox (mensagens, histórico, anexos, atendimento, handoff) · Contacts (cadastro, histórico, classificação) · Intelligent Agent (triagem, respostas, qualificação, follow-up) · Lead Intelligence (score, intenção, potencial) · Dashboard (indicadores, economia, produtividade) · Company/Users/Settings · Timeline/Events.

**O Core permanece funcional mesmo com todos os módulos opcionais removidos.**

## Módulos opcionais

| Módulo | Objetivo | Capacidades |
|--------|----------|-------------|
| Scheduling | intenção → compromisso | agenda, disponibilidade, confirmação, lembretes, reagendamento; Google Calendar futuro |
| Payments | compromisso → receita | links, PIX, cartões, status, histórico, webhooks. Nunca modifica Leads/Conversas — apenas publica eventos |
| Campaigns | recuperação/relacionamento ativo | segmentação, disparos, resultados, opt-out. Sempre via Conversation Engine — nunca envia fora do domínio da conversa |
| Landing Pages | captar leads | formulários, conversões. Todo lead recebido gera uma Conversation |
| Instagram / Facebook / Google Business | novos canais | apenas fornecem outro Channel — nunca alteram a lógica da Conversation |

Futuros módulos seguem exatamente a mesma arquitetura.

## Regras de dependência

```
Permitido:  Módulo → Core
Proibido:   Core → Módulo
```

Módulos podem depender de outros módulos declaradamente (ex.: Campaigns depende de Contacts + Agent). Nunca dependências ocultas. Comunicação sempre por **eventos e serviços** — nunca acesso direto a outro módulo.

## Ativação por empresa

Tabela `company_modules` (company_id, module_id, enabled, activated_at). Estados: ativo, inativo, suspenso, experimental. Toda funcionalidade opcional usa **feature flag** — nunca remover código para desativar.

- **Upgrade:** pagamento confirmado → módulo ativado → configuração criada → usuários notificados.
- **Downgrade:** desativar → bloquear novas ações → **manter histórico** (nunca apagar dados automaticamente).
- Toda alteração gera evento: `company.module.enabled` / `company.module.disabled`.

## Requisitos de um módulo

Todo módulo possui: domínio próprio, regras próprias, eventos, permissões próprias (`appointments.create`, `payments.generate` — nunca genéricas), configurações, limites, tabelas próprias (nunca misturar com o Core), interface, testes, feature flag e documentação. **Nunca criar módulo apenas escondendo tela.**

Processo para novo módulo: Documentação → Domínio → Eventos → Permissões → Interface → Testes → Feature Flag.

## Interface

O usuário enxerga apenas módulos ativos — menu desaparece se o módulo não existe; nenhuma tela quebrada. Módulos podem adicionar indicadores ao Dashboard, nunca modificar os do Core.

## IA

O agente usa módulos como **ferramentas** (consultar agenda → criar agendamento → publicar evento). Nunca acoplar módulo ao agente.

## Planos

Planos comerciais são combinações de módulos (ex.: Starter = Core; Growth = Core + Campaigns; Premium = Core + Campaigns + Scheduling + Payments). Módulos podem ter limites e cobrança adicional (mensagens IA, storage, disparos).

## Mission Control

Administra licenças, versões, ativação, saúde e custos dos módulos. Nunca implementa regras específicas do módulo nem edita código.

## Critério de existência

Todo novo módulo responde: resolve um problema novo ou apenas adiciona complexidade? Pode ser removido sem afetar o Core? Se não agrega valor claro, não deve existir.
