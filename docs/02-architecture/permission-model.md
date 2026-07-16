# Permission Model — Conecta Flow

Modelo oficial de permissões: papéis, permissões, escopos e regras de autorização.

## Modelo em camadas

```
User (Profile) → Company Membership → Role → Permissions
```

- **User:** identidade (e-mail e senha via Supabase Auth).
- **Company Membership:** vínculo usuário + empresa. Um usuário pode possuir múltiplos memberships (ADR-001).
- **Role:** pacote inicial de permissões. Papéis simplificam; permissões controlam.
- **Permissions:** controle real, granular, formato `dominio.acao`.

## Roles iniciais

### Company Owner
Dono da empresa cliente — usuário operacional, **não** administrador da plataforma.
Pode: dashboard, inbox, responder conversas, administrar equipe, configurar módulos permitidos, métricas, informações comerciais.
Não pode: acessar outras empresas (fora de seus memberships), alterar arquitetura, infraestrutura, dados de outros tenants.

### Attendant
Usuário operacional.
Pode: inbox, responder, assumir conversas, devolver para IA, consultar contatos, atualizações permitidas, recursos ativos.
Não pode: criar usuários, alterar plano, integrações críticas, configurações globais.

### Platform Administrator
Administrador da plataforma (Mission Control, tabela `admin_users`).
Pode: gerenciar empresas e tenants, administrar usuários, monitorar saúde, configurar integrações, métricas globais, suporte técnico. **Todas as ações auditadas.**

### Agente Inteligente
Não é usuário; não possui login. Opera via permissões técnicas com ferramentas autorizadas, contexto limitado e escopo da empresa (`agent.can_schedule`, `agent.can_create_payment_link`...).

## Formato das permissões

`dominio.acao` (ADR-005). Domínios principais: `conversation`, `contact`, `lead`, `agent`, `appointment`, `campaign`, `payment`, `integration`, `module`, `user`, `dashboard`, `audit`, `system`.

Exemplos: `conversation.read`, `conversation.reply`, `conversation.assign`, `conversation.handoff`, `contact.read`, `contact.edit`, `lead.score.read`, `lead.score.update`, `appointment.create`, `campaign.execute`, `module.manage`, `user.manage`, `agent.takeover`, `agent.release`.

## Escopos

- **Company Scope:** limitado à empresa do membership ativo (ex.: `conversation.read`).
- **Platform Scope:** global, prefixo `platform.` (ex.: `platform.company.manage`, `platform.user.manage`, `platform.integration.manage`, `platform.audit.read`). **Nunca concedido a usuário comum.**

## Matriz inicial

| Domínio | Owner | Attendant | Platform Admin |
|---------|-------|-----------|----------------|
| Conversation | read, reply, assign | read, reply | global |
| Contacts | read, edit | read, edição limitada | global |
| Users | gerenciar usuários da empresa | — | global |
| Modules | ver módulos ativos | — | ativar/desativar |
| Integrations | ver status | — | configurar |
| Dashboard | indicadores da empresa | conforme permissão | visão global |

## Regras

- **Handoff:** mudança de responsável exige `conversation.assign` e gera evento `conversation.assigned` com usuário anterior, novo, motivo e timestamp.
- **Módulos e feature flags:** permissão válida = módulo ativo + permissão concedida + escopo correto. Se Campaigns está desativado, `campaign.execute` não existe para a empresa.
- **API:** toda rota valida, em ordem — usuário autenticado → empresa → permissão → regra de domínio.
- **Frontend:** apenas esconde opções; nunca protege dados.
- **Banco:** RLS reforça o isolamento como última camada.
- **Auditoria:** registrar usuário, empresa, ação, objeto afetado, timestamp.

## Evolução futura

O modelo deve permitir: supervisores, equipes, departamentos, permissões customizadas — sem alterar a estrutura em camadas.

## Regra final

Papéis simplificam. Permissões controlam. Isolamento protege. Auditoria garante confiança.
