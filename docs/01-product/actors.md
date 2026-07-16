# Actors and Responsibilities — Conecta Flow

Define os atores da plataforma. Esses papéis são referência para arquitetura, autenticação, autorização, interface, fluxos de atendimento, Mission Control e políticas de segurança.

## Visão geral

| Ator | Ambiente | Objetivo |
|------|----------|----------|
| Administrador da Plataforma | Mission Control | Operar o SaaS |
| Usuário da Empresa | Aplicação cliente | Atender clientes |
| Agente Inteligente | Serviços internos | Reduzir trabalho humano |
| Cliente Externo | Canais (WhatsApp etc.) | Obter atendimento |

## Administrador da Plataforma

Operador da plataforma. Não pertence a nenhuma empresa; trabalha exclusivamente no Mission Control, com acesso auditado.

**Responsabilidades:** criar empresas, alterar planos, habilitar módulos, cadastrar usuários, configurar integrações e agentes, configurar RAG, acompanhar custos e uso de IA, monitorar workflows, visualizar auditorias, suporte, atualizar prompts, acompanhar saúde do sistema.

**Nunca faz:** atendimento ao cliente final, operação comercial da empresa, uso diário do sistema do cliente.

## Usuário da Empresa

Qualquer colaborador da empresa cliente. **Não existem tipos diferentes de usuários — existem permissões diferentes.** O proprietário também é um Usuário da Empresa (role `Company Owner`); o que muda são as permissões concedidas (ver `docs/02-architecture/permission-model.md`).

Um usuário pode pertencer a mais de uma empresa via memberships (ADR-001).

**Responsabilidades:** responder conversas, assumir atendimento, devolver para IA, transferir, consultar histórico, editar contatos, adicionar observações, consultar agenda, confirmar agendamentos, acompanhar indicadores, pesquisar contatos.

**Nunca administra:** prompts, banco vetorial, modelos, integrações, workflows, infraestrutura, segurança — pertencem ao Mission Control.

## Agente Inteligente

Não é uma LLM: é um serviço composto por modelos, RAG, memória, ferramentas, regras, workflows e contexto. Atua como membro da equipe. Não possui login; opera através de serviços internos com permissões técnicas próprias.

**Responsabilidades:** responder mensagens, triagem, identificar intenção, classificar contatos, calcular Lead Score, resumir conversas, criar follow-ups, recuperar clientes, sugerir ações, solicitar handoff, devolver atendimento.

**Nunca faz:** alterar configurações do sistema, alterar permissões, modificar arquitetura, acessar empresas sem autorização, persistir dados diretamente.

## Cliente Externo

Pessoa que interage pelos canais. Nunca acessa a plataforma nem realiza login. Interage por WhatsApp, Instagram, Landing Pages e canais futuros.

**Pode:** enviar/responder mensagens, enviar arquivos, realizar agendamentos, efetuar pagamentos, interagir com IA e humanos.

## Transferência de responsabilidade

Durante uma conversa o responsável pode mudar diversas vezes (IA → usuário → IA → outro usuário...). O responsável atual sempre deve estar claramente identificado na interface. Toda conversa possui exatamente **um** responsável operacional por vez: `ai`, `user` ou `queue`.

## Política de Handoff

O momento do handoff não pertence ao Core — cada empresa configura sua política operacional. Exemplos: transferir apenas quando solicitado; transferir após qualificação; transferir ao identificar intenção de compra; IA agenda sozinha.

## Permissões

A plataforma utiliza permissões granulares (`dominio.acao`). O Core nunca depende de cargos fixos — depende apenas de permissões. Roles existem como pacotes iniciais de permissões.

## Princípio

O usuário administra seu negócio. O administrador administra a plataforma. O agente administra a operação inteligente. O cliente apenas conversa. Essas responsabilidades nunca se sobrepõem.
