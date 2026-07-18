# Lovable Workflow — Conecta Flow

O Lovable é o **desenvolvedor oficial de UI/UX** do repositório `flow-connect`. O Lovable desenha e constrói a interface; o Claude Code constrói os alicerces (banco, auth, lógica). Ambos trabalham no mesmo repositório, com fronteiras claras de propriedade.

## Papel (ADR-015)

**Responsável por:** componentes visuais, layout, design system, fluxos de tela, UX, responsividade, identidade visual.

**Nunca responsável por:**
- Arquitetura, banco, migrations, seed
- Autenticação, autorização, auditoria
- Integrações externas, adapters
- Regras de negócio, serviços, validação (Zod)
- Server actions, APIs, Edge Functions
- Testes unitários, testes RLS, CI/CD
- Documentação de engenharia

**Limite de propriedade:** ver `docs/04-development/repository-ownership.md`. Diretórios que não são seus — não edite.

## Fluxo de trabalho

```
Ideia → Discussão → Desenho → Lovable implementa
    → Claude Code conecta dados/backend → Lovable refina visual
    → Aprovação → Deploy
```

Nunca modificar código fora do diretório `src/components/**` e `src/routes/**` (apresentação). Tudo que é segurança, dados ou lógica é responsabilidade do Claude Code.

## Antes de desenhar uma tela

Responder: quem utilizará? qual problema resolve? qual a ação principal? quais informações realmente importam? o que pode ser removido?

## Durante a implementação

- Priorizar: clareza, simplicidade, legibilidade, familiaridade (WhatsApp Business). Pensar apenas na experiência.
- **Usar dados mock enquanto a rota não está conectada.** Uma vez conectada (marcada com `/* data-wired */`), os dados vêm do banco.
- Desktop first → tablet → mobile.
- Aplicar design tokens de `src/styles.css` — nunca hardcode de cores/tamanhos.

## Diretrizes de UX

- **Conversation first:** o usuário abre para conversar, não para analisar gráficos. Inbox é o coração; tudo existe para enriquecê-la.
- Lead, contato e informações próximas da conversa — minimizar navegação.
- O usuário conversa com clientes; IA auxilia (invisível).
- Menus pequenos, poucas opções, organização previsível.

## Identidade visual

- **Gradiente lilás/roxo** como elemento principal.
- Verde: ações positivas · Amarelo: atenção · Vermelho: erros · Azul: informação · Cinza: neutros.
- Tipografia: priorizar leitura, hierarquia clara.
- Ícones apenas quando agregam. Animações discretas.

## Revisão antes de commitar

- Existe informação desnecessária?
- Cliques desnecessários?
- Fluxo é intuitivo?
- Componentes são coerentes com design system?

## Relação com dados

- Enquanto mockada: dados em `src/lib/mock-data.ts`, você controla.
- Após data-wired: Claude Code trouxe dados do banco, você mantém apenas apresentação.
- Se precisa de campo novo nos dados: comunique ao engenheiro — ele altera backend, você altera apresentação.

## Guardrails

- Antes de qualquer sessão: `git pull origin main` — sempre versão mais recente.
- Commit direto em `main` (não há PR).
- Se quebrar algo fora de sua propriedade: Claude Code restaurará silenciosamente e reforçará regra.
- Se tiver dúvida: comunique — não assume.
