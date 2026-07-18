# Repository Ownership — Conecta Flow

Repositório único, dois agentes de desenvolvimento. Cada diretório tem UM dono. O que não é seu, você não edita — sem exceção.

## Propriedade do Lovable (UI/UX)

- `src/components/**` — componentes visuais e de layout
- `src/routes/**` — SOMENTE a camada de apresentação (JSX, estilos, composição)
- `src/styles.css` e tokens de design
- `public/**` — assets visuais

O Lovable desenha telas, constrói componentes, aplica design system — tudo que torna a interface bonita e usável.

## Propriedade do Claude Code (engenharia)

- `supabase/**` — migrations, seed, types, config
- `docs/**` — toda a documentação e ADRs
- `src/core/**` — auth, tenancy, permissions, audit, autorização
- `src/features/**/services`, `src/features/**/schemas`, `src/features/**/actions` — lógica de negócio, validação, camada de dados
- `src/infrastructure/**` — adapters, clients, integração com externos
- `tests/**` — testes unitários e integração
- `.github/**` — CI/CD
- Arquivos de configuração raiz (`tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `package.json`, etc.)

O Claude Code constrói os alicerces: banco seguro, auth confiável, lógica correta, testes que cobrem.

## Zona compartilhada (exige coordenação)

### `src/routes/**` — camada de dados

Lovable desenha a tela com dados mock; Claude Code substitui o mock por dados reais SEM alterar a estrutura visual.

**Protocolo:**
1. Lovable comita rota com dados mock: `<component name="Inbox" conversations={MOCK_CONVERSATIONS} />`
2. Claude Code conecta dados reais em nova commit:
   - Substitui `MOCK_CONVERSATIONS` por `const conversations = await fetchConversations()`
   - Mantém estrutura visual intocada
   - Adiciona cabeçalho de aviso na rota: `/* data-wired: conversations — Lovable: alterar apenas apresentação */`
3. Após data-wired, o mock da entidade é **congelado** — fonte única é o banco

### `src/lib/mock-data.ts`

Lovable pode editar enquanto a rota não está conectada.
Após conexão, o mock da entidade é congelado — apenas o Claude Code altera dados em production.

## Regras de sincronização

1. **Antes de qualquer sessão de trabalho** (Lovable ou Claude Code): pull da `main` — sempre trabalhar com a versão mais recente.
2. **Lovable comita direto na `main`** (comportamento nativo da ferramenta; não há fluxo de PR).
3. **Claude Code sempre roda antes de comitar:**
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - Nenhum commit entra em `main` com erros.
4. **Conflitos de propriedade:**
   - Se o Lovable quebra código de engenharia (importação removida, arquivo de `/core/` deletado, migration alterada), Claude Code restaura silenciosamente e **reforça a instrução de knowledge do Lovable** — nunca "conserta por cima" sem comunicar.
   - Se o Claude Code altera `/src/routes/**` (apresentação), é uma violação — não fazer.

## Exemplo de fluxo correto

**Dia 1 — Lovable:**
```
Comita: feat: add Inbox route with mock conversations
- Cria src/routes/inbox/page.tsx com MOCK_CONVERSATIONS
- src/routes/inbox/ui.tsx com componentes de UI
- src/lib/mock-data.ts com dados de teste
```

**Dia 2 — Claude Code:**
```
Comita: feat: wire Inbox conversations to database
- src/routes/inbox/page.tsx: substitui mock por await fetchConversations()
- Adiciona cabeçalho: /* data-wired: conversations */
- Sem alteração visual; nenhum componente movido
```

**Dia 3 — Lovable:**
```
Comita: design: refine Inbox UI
- Modifica apenas src/routes/inbox/ui.tsx (estrutura de componentes)
- CSS e layout aprimorados
- data-wired comentário intacto — sabe que conversations vêm do banco
```

## Checklist para novos features

Antes de começar trabalho em feature nova:

- [ ] Lovable: desenha o fluxo de telas (mockadas)
- [ ] Claude Code: implementa backend e banco
- [ ] Claude Code: cria serviços/actions que retornam os dados
- [ ] Claude Code: conecta dados reais às telas (data-wired)
- [ ] Lovable: refina design visual se necessário (respeitando data-wired)
- [ ] Claude Code: valida testes, typecheck, lint
- [ ] Feature pronta para ir à produção

## Overflow: quando proprietários discordam

Se o Lovable quer adicionar campo novo em formulário e o Claude Code diz "esse campo quebra validação Zod", a solução é discussão — não assume-se que um está errado. O Product Owner pode ser acionado para quebra de empate.

Mas a regra geral fica: proprietário é autoridade. Lovable em UI, Claude Code em backend. Respeitar limites acelera.
