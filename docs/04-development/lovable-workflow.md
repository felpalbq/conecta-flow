# Lovable Workflow — Conecta Flow

O Lovable é ferramenta de **descoberta de produto e prototipação** (repositório `conecta-flow-ui-prototype`). O Lovable descobre o produto; o Claude Code constrói o produto. Nunca inverter essas responsabilidades.

## Papel

**Responsável por:** explorar ideias, validar UX, wireframes, navegação, fluxos, organização de componentes, hierarquia visual, protótipos navegáveis.

**Nunca responsável por:** arquitetura, banco, autenticação, integrações, regras de negócio, APIs, segurança, persistência. Nunca gera deploy; nunca é fonte de produção.

## Fluxo oficial

```
Ideia → Discussão → Prompt → Lovable → Protótipo → Revisão → Ajustes
     → Aprovação → Documentação → Claude Code → Implementação
```

Nunca inverter. Nunca modificar código do produto para testar UX — toda experimentação ocorre primeiro no Lovable.

## Antes de prototipar uma tela

Responder: quem utilizará? qual problema resolve? qual a ação principal? quais informações realmente importam? o que pode ser removido?

## Durante a prototipação

- Priorizar: clareza, simplicidade, rapidez, legibilidade, familiaridade (WhatsApp Business). Pensar apenas na experiência — nunca em implementação.
- **Dados sempre mockados.** Nunca conectar banco, APIs, Supabase ou n8n.
- Desktop first → tablet → mobile.

## Diretrizes de UX

- **Conversation first:** o usuário abre o sistema para conversar, não para analisar gráficos. A Inbox é o coração; todo o restante existe para enriquecê-la. O Dashboard é secundário — mostra resultados, nunca compete com a Inbox.
- Informações do lead próximas da conversa — nunca obrigar navegação entre telas.
- O usuário nunca conversa com a IA — conversa com clientes; a IA auxilia.
- Menus pequenos, poucas opções, organização previsível, sem profundidade excessiva.

## Identidade visual

- **Gradiente lilás/roxo** como elemento principal.
- Verde: ações positivas · Amarelo: atenção, Lead Score · Vermelho: erros, alertas · Azul: informação · Cinza: neutros. Nunca excesso de cores.
- Tipografia: priorizar leitura, poucas variações, hierarquia clara.
- Ícones apenas quando agregam compreensão. Animações discretas e rápidas.

## Revisão

Antes de aprovar: existe informação desnecessária? clique desnecessário? duplicação? excesso de indicadores? a ação principal está evidente?

Tela concluída quando: fluxo validado, UX validada, informações organizadas, componentes coerentes, documentação atualizada.

## Handoff para implementação

Após aprovação, criar documento com: objetivo da tela, fluxo, estados, componentes, eventos, permissões, responsividade. Somente então iniciar implementação.

## Relação com o código de produção

- Componentes do Lovable representam **intenção visual**, não implementação. O Claude Code analisa, adapta, padroniza e integra — **jamais copia automaticamente**.
- Componente aprovado migra para `conecta-flow-platform` e passa a ser mantido apenas lá. Nunca editar componentes de produção no repositório do Lovable.
- Manter histórico dos protótipos e registrar decisões relevantes.
