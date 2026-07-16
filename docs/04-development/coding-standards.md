# Coding Standards — Conecta Flow

Padrão oficial de desenvolvimento para humanos e agentes de IA. A consistência do projeto é mais importante que preferências individuais. Código é ativo de longo prazo: escrevemos para ser lido, mantido e evoluído. Legibilidade tem prioridade sobre inteligência da implementação.

## Ordem de desenvolvimento

Sempre: **compreender o domínio → consultar documentação → planejar → só então codificar.** Nunca inverter. Em caso de dúvida, nunca assumir comportamento — consultar a documentação; se não existir, criar a documentação primeiro.

Sempre pensar: **Conversation first** (como isso melhora uma conversa?), **Core first** (nunca criar dependência do Core para módulos), **Event first** (qual evento aconteceu? — não "qual tabela será atualizada"), **Domain first** (implementação começa pelo domínio; nunca pelo banco ou frontend).

## Linguagem e tipos

- TypeScript strict, sempre. Nunca JavaScript. Nunca `any`.
- Tipos explícitos, interfaces pequenas, tipos reutilizáveis.
- Identificadores em inglês; textos de interface em pt-BR.

## Organização

- Feature-first (ver `project-structure.md`). Nunca organizar por tipo de arquivo (`controllers/`, `models/`...).
- Imports com alias `@/...`; nunca caminhos relativos profundos.
- Nunca valores mágicos — toda constante tem nome.

## Funções e componentes

- Nomes explícitos: `assignConversation()`, nunca `process()`.
- Funções: uma responsabilidade, poucas linhas, poucos parâmetros, retornos claros, sem efeitos colaterais.
- Componentes React: uma responsabilidade; preferir composição; nunca componentes gigantes.
- Hooks representam comportamento (`useConversation`, `useLeadScore`) — nunca mero agrupamento de funções.
- Toda lógica de negócio reutilizável pertence a serviços. Nunca duplicar regras — refatorar antes de duplicar.

## Validação e erros

- Toda entrada validada com Zod. Frontend melhora UX; backend garante segurança. Nunca confiar no frontend.
- Nunca ignorar erros: tratamento explícito, mensagens claras, log quando necessário.
- `async/await`; evitar promise chains.

## Segurança (em toda implementação)

Considerar sempre: autenticação, autorização, RLS, auditoria, multi-tenancy. Nunca SQL no frontend; nunca misturar acesso a dados com UI; acesso a dados centralizado (nunca SQL espalhado).

## Eventos

Toda alteração importante gera evento — nunca atualizar estados silenciosamente. Nunca criar dependências ocultas entre features.

## IA

A IA nunca implementa regras do domínio. Sempre validar respostas do modelo; nunca confiar cegamente. Regra determinística antes de LLM.

## UI

- Tailwind; sem CSS espalhado; evitar estilos inline.
- Desktop first; responsividade obrigatória.
- Acessibilidade: labels, focus, atalhos, contraste, navegação por teclado.
- `shared/` somente para componentes realmente reutilizáveis.

## Estado e performance

- Estado local primeiro; global apenas com justificativa.
- Nunca otimizar prematuramente — otimizar após medir. Antes de otimizar, perguntar: existe processamento/consulta/chamada de IA desnecessária? pode ser cacheado? pode ser assíncrono?

## Comentários

Código autoexplicativo. Comentários apenas para contexto de negócio que o código não consegue mostrar. Nunca explicar sintaxe. Nunca `TODO`/`FIXME`/`HACK` sem contexto — dívida técnica é documentada (descrição, motivo, impacto, prioridade, estratégia).

## Testes

Toda regra crítica deve ser testável. Prioridade: 1. regras de negócio, 2. segurança/isolamento, 3. integrações, 4. interface. Evitar acoplamento que impeça testes.

## Logs

Úteis, nunca excessivos, nunca com informações sensíveis.

## Multiempresa

Assumir sempre centenas de empresas: nunca lógica para uma empresa específica, nunca IDs fixos, nunca configurações globais.

## Checklist final

Antes de concluir qualquer implementação: está simples? está consistente? segue a arquitetura? o domínio continua consistente? existe acoplamento ou duplicação? outro desenvolvedor entende daqui a um ano?

O objetivo nunca é escrever mais código — é escrever menos código, mais simples, mais claro, mais sustentável.
