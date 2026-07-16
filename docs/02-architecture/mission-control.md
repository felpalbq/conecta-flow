# Mission Control Architecture — Conecta Flow

Ambiente administrativo interno da plataforma. O cliente usa "meu atendimento inteligente"; o administrador usa "minha plataforma SaaS". São produtos conceitualmente diferentes que compartilham apenas o domínio — nunca a interface. O cliente nunca deve saber que o Mission Control existe.

## Implementação (ADR-011)

Mesma aplicação Next.js, route group `/admin` com middleware próprio, identidade em `admin_users` (separada dos usuários de empresa), políticas RLS de escopo platform e auditoria de toda ação. **Gatilho para separar em aplicação própria:** segundo administrador ou primeiro cliente enterprise.

Usa exatamente as mesmas APIs e regras da plataforma — apenas com permissões administrativas (`platform.*`). Nunca acessa tabelas diretamente; nunca cria atalhos administrativos.

## Responsabilidades

Administrar empresas, usuários e módulos · monitorar infraestrutura, IA, custos, integrações e workflows · acompanhar saúde da plataforma · auditar operações · suporte · billing (futuro).

**Nunca:** atender clientes, responder conversas, substituir o produto, virar CRM interno, ser usado por atendentes.

## Módulos do Mission Control

### 1. Company Management
Criar/ativar/desativar empresas; visualizar plano, módulos, usuários, integrações, custo, consumo, último acesso, saúde, logs. Cada empresa possui página própria com resumo completo.

### 2. User Management
Criar, suspender, reativar usuários; redefinir permissões; visualizar atividade. Nunca alterar senhas manualmente.

### 3. Tenant Health
Saúde por empresa: integrações ativas, erros recentes, consumo, atividade (ex.: "WhatsApp: online · IA: operando · última mensagem: 2 min").

### 4. Integration Management
Status por empresa e integração: conectado, expirado, erro, última sincronização, validade de token.

### 5. AI Operations
Provider, modelo, tokens, custo, latência, fallbacks, erros, ferramentas utilizadas, prompt atual e versão. Controle de versões de prompt.

### 6. Knowledge Management
Documentos por empresa, status de processamento, erros de indexação. Nunca misturar bases.

### 7. Usage & Billing
Consumo por empresa: mensagens, tokens, storage, chamadas externas → custo estimado, margem, receita. Objetivo: prever custo — nunca depender de planilhas externas. Billing completo é evolução futura.

### 8. Audit
Quem fez, o quê, quando, onde, resultado. Nunca permitir edição.

## Dashboard do administrador

Diferente do dashboard do cliente (resultado comercial): aqui é **saúde da plataforma** — empresas ativas/com erro, workflows com falha, integrações offline, mensagens hoje, tokens e custo IA hoje, fila de eventos, alertas, incidentes. Em tempo real.

## Alertas

Erro crítico · integração caída · provider indisponível · workflow parado · custo acima do esperado · limite de plano · latência · baixa atividade.

## Eventos, logs e workflows

- Acompanha o fluxo de eventos em tempo real (evento, empresa, origem, consumidores, resultado, falhas).
- Centraliza logs (backend, frontend, IA, integrações, n8n) com filtros por empresa, usuário, período, severidade.
- Workflows (pós-piloto/n8n): executados, pendentes, falhas, retentativas, tempo médio — acompanha via eventos (`system.workflow.failed`), não administra diariamente.

## Segurança

- Acesso exclusivo de Platform Administrators; permissões próprias (`platform.*`) — nem todo administrador pode tudo (preparado para múltiplos admins).
- Pode atravessar tenants, mas **toda ação é registrada**. Nenhuma ação silenciosa.
- Impersonation (futuro): sempre visível e auditado — "Administrador acessou como empresa X".
- Não deve alterar dados comerciais sem registro; nunca remove segurança do banco.

## Evolução futura

Centro de operações, suporte, billing, analytics, marketplace de integrações, histórico de deploys com rollback, versionamento visível (plataforma, banco, prompts, workflows, API).
