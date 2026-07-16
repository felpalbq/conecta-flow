# Security Model — Conecta Flow

Segurança faz parte da arquitetura desde a primeira linha de código — nunca adicionada depois. O sistema assume que toda requisição pode ser maliciosa: nenhum cliente é confiável, nenhum frontend é confiável, toda validação ocorre no backend.

## Princípios

Security by Design · Least Privilege · Zero Trust · Defense in Depth · Fail Secure · Audit Everything

**Defense in Depth:** Frontend → API → Domínio → Banco → RLS. Cada camada valida.

**Zero Trust:** toda ação valida — quem? qual empresa? qual permissão? qual contexto?

## Autenticação

Centralizada no Supabase Auth. Nunca implementar autenticação própria, armazenar senhas ou manipular tokens manualmente. Suporta: login, sessão, recuperação, expiração, revogação. Toda sessão possui: usuário, empresa ativa, permissões, expiração, refresh token.

## Autorização

Autenticação responde "quem é?"; autorização responde "o que pode fazer?". Nunca confundir.

- Permissões granulares `dominio.acao` (ver `permission-model.md`). Nunca cargos genéricos (`admin`, `superuser`) quando não forem necessários.
- Toda API valida, nesta ordem: autenticação → empresa → permissão → recurso → ação → regra de domínio.
- O frontend apenas oculta elementos de interface — a decisão real pertence sempre ao backend.

## Row Level Security

RLS obrigatório em toda tabela de negócio. A ausência de política significa acesso negado. Regras:

- Usuário comum: acessa somente empresas de seus memberships.
- Administrador da plataforma: escopo platform, com políticas próprias e auditoria.
- Service role: somente em operações controladas do servidor (webhooks, filas) — nunca exposta.
- Nunca confiar em: filtro do frontend, parâmetro do usuário, ID informado na URL. O banco garante o isolamento.
- Todo RLS coberto por testes de isolamento no CI.

## Dados sensíveis

Considerar sensíveis: mensagens, documentos, telefones, e-mails, tokens, credenciais, conhecimento da empresa.

**Nunca armazenar:** senhas, tokens em texto puro, chaves privadas, segredos — nem em código, nem em Git, nem no banco. Usar environment variables, secret manager e Credentials do n8n. Cada ambiente (development/staging/production) possui credenciais próprias — nunca compartilhadas.

## Auditoria

Toda ação crítica gera registro imutável em `audit_logs` (nunca apagado, nunca alterado): login/logout, alteração de permissões e usuários, integrações, módulos, configurações, exclusões, exportações, toda ação administrativa do Mission Control, alteração de prompts. Exportação de dados é operação privilegiada e sempre auditada.

Todo log contém: timestamp, usuário, empresa, origem, evento, resultado. **Nunca registrar:** senhas, tokens, conteúdo privado completo, dados financeiros sensíveis.

## Soft delete e imutabilidade

Registros importantes nunca são removidos fisicamente (`deleted_at`). Imutáveis: `messages`, `timeline_events`, `audit_logs`, `events`, `payments`.

## LGPD (ADR — papel de operadora)

- Empresa cliente = **controladora** dos dados de seus clientes finais; plataforma = **operadora**. Deve constar no contrato de serviço (DPA) antes do primeiro piloto externo.
- Direito de eliminação atendido por **anonimização**: remove PII, preserva registros e métricas — reconcilia com a imutabilidade das mensagens.
- Política de retenção configurável por empresa.
- Exportação de dados por empresa disponível.
- Nunca usar dados reais em desenvolvimento.

## Superfícies de entrada

**Webhooks:** validar origem, assinatura (quando existir), integridade, timestamp. Nunca aceitar chamadas anônimas. Mensagens WhatsApp validam: empresa, canal, conversation, provider_message_id.

**Uploads:** validar tipo, tamanho, extensão, origem e permissão — nunca confiar apenas na extensão. Arquivos privados; nunca URLs públicas permanentes.

**Rate limiting:** login, APIs públicas, webhooks, envio de mensagens, uploads, chamadas de IA.

## IA

- Context isolation: todo contexto enviado ao modelo pertence exclusivamente à empresa ativa. Nunca misturar empresas, clientes, bases vetoriais ou memórias.
- Prompts versionados (versão, autor, data, histórico).
- Ferramentas do agente possuem permissões próprias (`agent.can_schedule`...). A IA nunca: executa ações administrativas, acessa dados fora do contexto, altera configurações, executa código, acessa segredos.

## Integrações

Credenciais próprias por empresa e por integração — nunca compartilhar tokens. Armazenar: status, última sincronização, erro, validade da credencial. Renovação de token auditada.

## Mission Control

Autenticação e permissões próprias (`admin_users`), escopo platform, sem compartilhar sessão com clientes. Nenhuma ação silenciosa — tudo auditado.

## Testes obrigatórios

Isolamento entre empresas · permissões · acesso negado · expiração de sessão · ações administrativas.

## Regra final

Nenhuma funcionalidade está pronta até responder: quem pode usar? quem pode ver? quem pode alterar? como será auditado? como evitar vazamento?
