# Knowledge para o Projeto Lovable — Conecta Flow

> Este arquivo contém o texto que o Product Owner deve colar nas instruções/knowledge do projeto Lovable.
> Copiar todo o conteúdo abaixo da linha — use ctrl+c/cmd+c nas instruções de project knowledge.

---

Você é responsável **APENAS** pela interface (UI/UX) do **repositório oficial** `flow-connect`.

## O que NUNCA editar

Estes diretórios e arquivos são propriedade do Claude Code (engenharia). Jamais edite, delete, refatore ou altere:

- `supabase/` — migrations, seed, configuração do banco
- `docs/` — toda a documentação, ADRs, planos
- `tests/` — testes unitários, integração, RLS
- `.github/` — CI/CD, workflows
- `src/core/` — auth, tenancy, permissions, audit, lógica de autorização
- `src/infrastructure/` — adapters, clients Supabase, integração com externos
- `src/features/**/services/` — lógica de negócio
- `src/features/**/schemas/` — validação Zod
- `src/features/**/actions/` — server actions e chamadas ao banco
- Arquivos de configuração raiz: `package.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.prettierrc.json`, e similares

## O que você PODE editar

Estes diretórios são seus — desenhe, estilize, componha à vontade:

- `src/components/**` — componentes de UI, layout, design system
- `src/routes/**` — apenas a camada visual (JSX, estilos, composição de componentes)
- `src/styles.css` — tokens de design, variáveis globais
- `public/**` — assets, imagens, SVGs

## Zona compartilhada: `src/routes/**`

Algumas rotas já têm dados reais conectados (veem do banco). Você pode **alterá-las visualmente**, mas não substitua as chamadas de dados.

Se uma rota tem um comentário no topo assim:
```javascript
/* data-wired: conversations — Lovable: alterar apenas apresentação */
```

Significa: os dados vêm do banco, não do mock. Você pode:
- ✅ Redesenhar o layout
- ✅ Adicionar componentes
- ✅ Mudar cores, tipografia, espaçamento
- ❌ Substituir `const conversations = await fetchConversations()` por `MOCK_CONVERSATIONS`
- ❌ Deletar ou renomear variáveis de dados

Se precisar de mudança nos dados (novo campo, estrutura diferente), **comunique** — o engenheiro alterará schema + backend, você altera apresentação.

## Se algo parecer quebrado

Se você não consegue editar um arquivo ou tudo parece estranho:

1. Puxe a versão mais recente: `git pull origin main`
2. Se o erro persistir, descreva em comentário o que tentou fazer
3. O engenheiro investigará e resolverá

## Identidade visual

- **Paleta:** gradiente lilás/roxo (tokens em `src/styles.css`)
- **Idioma da interface:** pt-BR (português brasileiro)
- **Componentes:** shadcn/ui + Tailwind CSS — use as classes do design system existente
- **Layout:** mobile-first, responsive

## Resumão

**Você desenha a UI.** O engenheiro faz a UI funcionar com dados reais e lógica segura. Cada um respeita o espaço do outro. Assim a gente entrega rápido, com qualidade e sem quebrar nada.

Qualquer dúvida: comunique.
