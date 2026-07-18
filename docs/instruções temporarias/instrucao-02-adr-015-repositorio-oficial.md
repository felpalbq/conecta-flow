# Instrução 02 — ADR-015: `flow-connect` passa a ser o repositório oficial

Esta etapa é **somente decisão e documentação** — nenhum código muda aqui. A migração física acontece na instrução 03.

---

## Contexto da decisão (registrar fielmente no ADR)

O Product Owner decidiu inverter o ADR-004: o repositório `flow-connect` (criado pelo Lovable) passa a ser o **repositório oficial do projeto — arquitetura e design**. Racional declarado:

- O Lovable seguirá atuando exclusivamente como desenvolvedor de UI/UX dentro do repositório oficial — nunca mais como protótipo descartável em repositório paralelo.
- O Claude Code atua como arquiteto e engenheiro no mesmo repositório: backend, banco, segurança, integrações, testes, documentação.
- Nada do que o Lovable construiu na interface até aqui será alterado na migração.

## O que fazer

### 1. Criar `docs/decisions/ADR-015-official-repository-inversion.md`

Conteúdo obrigatório do ADR (adaptar redação, manter substância):

```markdown
# ADR-015 — flow-connect como repositório oficial; supersede ADR-004

**Status:** Aceito · 2026-07-17 · Supersede parcialmente ADR-004; impacta ADR-009

## Contexto
ADR-004 definia conecta-flow-platform como produto oficial e flow-connect
como protótipo de referência. O fluxo real de trabalho consolidou o Lovable
como par permanente de desenvolvimento de UI, não como fase de descoberta
descartável. Manter dois repositórios passou a significar reimplementar em
Next.js tudo que o Lovable já entrega pronto — custo sem benefício para o
tamanho da equipe.

## Decisão
1. flow-connect é o repositório oficial único: produto, docs/, migrations,
   testes e CI vivem nele.
2. Divisão de papéis por responsabilidade, não por repositório:
   Lovable = UI/UX (componentes visuais, layout, estilo, fluxos de tela).
   Claude Code = arquitetura, backend, banco, segurança, integrações, testes,
   documentação.
3. A interface construída pelo Lovable até esta data é preservada como está.
4. conecta-flow-platform é arquivado (read-only) após a migração da fundação
   — permanece como referência histórica; releases só saem do repo oficial.

## Consequências
- ADR-009 (backend = Next.js route handlers) precisa de revisão: o repo
  oficial usa a stack gerada pelo Lovable [REGISTRAR AQUI a stack real
  verificada na instrução 03 — framework, bundler, router]. Camada de API
  passa para [server functions do framework / Supabase Edge Functions —
  decidir na instrução 03 com base no que o framework suporta].
- Risco assumido: Lovable e Claude Code comitam no mesmo repositório.
  Mitigação: fronteiras de propriedade por diretório (ver
  docs/04-development/repository-ownership.md, criado nesta decisão) +
  instruções de knowledge no projeto Lovable proibindo-o de tocar em
  diretórios de engenharia.
- Migrations, suíte RLS, seed e docs/ são framework-agnósticos e migram
  sem adaptação. Auth, middleware e server actions exigem reescrita
  adaptada ao framework do repo oficial.
```

### 2. Criar `docs/04-development/repository-ownership.md`

Mapa de propriedade por diretório — o contrato de convivência:

```markdown
# Repository Ownership — Conecta Flow

Repositório único, dois agentes de desenvolvimento. Cada diretório tem UM dono.
O que não é seu, você não edita — sem exceção.

## Propriedade do Lovable (UI/UX)
- src/components/** (componentes visuais e de layout)
- src/routes/** — SOMENTE a camada de apresentação (JSX, estilos, composição)
- src/styles.css e tokens de design
- public/** (assets visuais)

## Propriedade do Claude Code (engenharia)
- supabase/** (migrations, seed, types, config)
- docs/** (toda a documentação e ADRs)
- src/core/** (auth, tenancy, permissions, audit)
- src/features/**/services|schemas|actions (lógica, validação, dados)
- src/infrastructure/** (adapters, clients)
- tests/**
- .github/** (CI)
- Arquivos de configuração raiz (tsconfig, eslint, vitest, package.json)

## Zona compartilhada (exige coordenação)
- src/routes/**: Lovable desenha a tela com dados mock; Claude Code substitui
  o mock por dados reais SEM alterar estrutura visual. Quando o Claude Code
  conectar dados em uma rota, registra no arquivo um comentário de cabeçalho:
  `/* data-wired: <data> — Lovable: alterar apenas apresentação */`.
- src/lib/mock-data.ts: Lovable pode editar enquanto a rota não está
  conectada; após conexão, o mock da entidade é congelado e a fonte é o banco.

## Regras de sincronização
1. Antes de qualquer sessão de trabalho (Lovable ou Claude Code): pull da main.
2. Lovable comita direto na main (comportamento nativo da ferramenta).
3. Claude Code sempre roda typecheck + lint + testes antes de comitar.
4. Se o Lovable quebrar código de engenharia (importação removida, arquivo
   deletado): Claude Code restaura e reforça a instrução de knowledge do
   Lovable — nunca "conserta por cima" silenciosamente.
```

### 3. Atualizar documentos afetados (mesmo commit do ADR)

- `docs/decisions/ADR-004-two-repositories.md`: adicionar no topo `**Status:** Superseded por ADR-015 · 2026-07-17`.
- `docs/decisions/ADR-009-*.md`: adicionar nota "Em revisão pelo ADR-015 — camada de API a redefinir na migração".
- `docs/04-development/lovable-workflow.md`: reescrever o papel do Lovable — deixa de ser "protótipo de referência, nunca produção" e passa a ser "desenvolvedor de UI/UX do repositório oficial, restrito aos diretórios de sua propriedade (ver repository-ownership.md)". Manter as diretrizes de UX (conversation first, identidade visual) — elas continuam válidas.
- `CLAUDE.md` (seção Convenções): substituir a linha sobre os dois repositórios pela nova realidade + link para repository-ownership.md.

### 4. Texto de knowledge para o projeto Lovable

Gerar o arquivo `docs/04-development/lovable-knowledge.md` com o texto que o Product Owner colará nas instruções/knowledge do projeto Lovable:

```
Você é responsável APENAS pela interface (UI/UX) deste projeto.

NUNCA edite, delete ou refatore arquivos nos diretórios:
supabase/, docs/, tests/, .github/, src/core/, src/infrastructure/,
src/features/**/services, src/features/**/schemas, src/features/**/actions,
nem os arquivos de configuração da raiz (package.json, tsconfig.json,
eslint, vitest, prettier).

Se uma mudança visual parecer exigir alteração nesses diretórios, PARE e
descreva a necessidade em um comentário — o engenheiro fará a alteração.

Em src/routes/: altere apenas apresentação (JSX, classes, composição).
Arquivos com cabeçalho "data-wired" têm dados reais conectados — nunca
substitua os hooks/chamadas de dados por mock.

Idioma da interface: pt-BR. Identidade visual: gradiente lilás/roxo,
conforme o design system existente em src/styles.css.
```

---

## Critérios de conclusão

- [ ] ADR-015 criado com a stack real do repo oficial registrada (ou placeholder explícito a preencher na instrução 03)
- [ ] repository-ownership.md criado
- [ ] ADR-004 marcado como superseded; ADR-009 anotado
- [ ] lovable-workflow.md e CLAUDE.md atualizados
- [ ] lovable-knowledge.md gerado para o Product Owner colar no Lovable
- [ ] Tudo em um único commit `docs: ADR-015 official repository inversion`
