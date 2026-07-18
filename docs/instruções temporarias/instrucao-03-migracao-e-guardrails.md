# Instrução 03 — Migração da Fundação para o `flow-connect` + Guardrails

> **Pré-requisitos:** instrução 01 concluída (correções aplicadas na platform) e instrução 02 concluída (ADR-015 e ownership documentados).
>
> **Regra absoluta desta migração:** a interface construída pelo Lovable não muda. Nenhum componente visual, rota, estilo ou fluxo de tela é alterado, movido ou "melhorado" nesta instrução. Só entra engenharia por baixo.

---

## Fase 0 — Auditoria do repositório de destino (obrigatória, antes de tudo)

Clonar/abrir o `flow-connect` e registrar em `docs/migration/destination-audit.md` (criar o diretório):

1. **Stack real**: framework (TanStack Start? Vite SPA? versão), router, bundler, gerenciador de estilo, versão de React e TypeScript. Ler `package.json`, arquivo de entrada e configs.
2. **Capacidade de servidor**: o framework suporta código server-side (server functions/SSR)? Ou é SPA puro? Isso decide onde vive a camada de API (ver Fase 3).
3. **Estrutura de diretórios existente**: mapear `src/` completo.
4. **Conflitos de nome**: já existe `src/core`, `src/features`, `src/infrastructure`, `supabase/`, `tests/`, `docs/`? Listar colisões.
5. **Estado do TypeScript**: strict habilitado? `any` em uso? Registrar — o padrão do projeto é strict sem `any`, e isso passará a valer no repo oficial para o código de engenharia (não retro-corrigir código do Lovable agora; apenas novo código).

**CHECKPOINT OBRIGATÓRIO:** apresentar o resultado da Fase 0 ao Product Owner com a recomendação de camada de API (Fase 3, opção A ou B) e **aguardar confirmação explícita** antes de executar as fases 1–5. A partir da Fase 1 há mudanças estruturais no repositório oficial.

---

## Fase 1 — Migrar o que é framework-agnóstico (cópia direta)

Do `conecta-flow-platform` para o `flow-connect`, preservando histórico relevante nos commits (um commit por bloco):

1. `docs/` completo (já atualizado pelas instruções 01–02) — commit `docs: migrate canonical documentation`.
2. `supabase/` completo: migrations (incluindo as novas da instrução 01), `config.toml`, `seed/`, `types/` — commit `chore: migrate supabase stack`.
3. `tests/integration/rls/` + `tests/fixtures/` + `vitest.config.ts` adaptado aos paths do novo repo — commit `test: migrate RLS isolation suite`. Ajustar imports (`@/` alias) conforme o tsconfig do destino; se o destino não tem alias `@/`, criar.
4. `.github/workflows/ci.yml` adaptado (mesmos jobs: typecheck, lint, unit, rls-isolation) — commit `ci: migrate pipeline`.
5. `.env.example`, `.gitattributes`, ajustes de `.gitignore` (mesclar com o existente do Lovable, não sobrescrever) — commit `chore: environment scaffolding`.
6. `CLAUDE.md` e `AGENTS.md` adaptados: atualizar comandos (`npm run dev` do novo framework), estrutura e a seção de repositórios — commit `docs: CLAUDE.md for official repository`.

Validar após a fase: `npx supabase start && npx supabase db reset && npm run seed` funcionam a partir do novo repo; suíte RLS verde.

---

## Fase 2 — Migrar a camada de engenharia de aplicação (adaptação, não cópia)

Portar de `src/` da platform para o repo oficial, **adaptando ao framework do destino** (identificado na Fase 0):

1. `src/infrastructure/supabase/` — os clients (`browser-client`, `server-client`, `service-role-client`). O pacote `@supabase/ssr` funciona fora do Next.js, mas os wrappers de cookie mudam por framework: reescrever conforme o mecanismo de request/response do destino. Se o destino for SPA puro sem servidor, ver Fase 3 antes — a decisão de API muda o que existe aqui.
2. `src/core/permissions/` — portável quase sem mudança (`role-permissions.ts`, `permission-catalog.ts`, `has-permission.ts` + testes).
3. `src/core/audit/log-action.ts` — adaptar o client import.
4. `src/core/auth/` e `src/core/tenancy/` — as **regras** (schemas Zod, semântica de require-user, active-company via cookie) são portáveis; a **mecânica** (server actions, `revalidatePath`, `next/cache`) é Next.js e precisa reescrita na convenção do destino (server functions do framework ou chamadas à camada de API da Fase 3).
5. NÃO portar: `src/app/` (páginas Next.js — a UI oficial já existe no destino, feita pelo Lovable), `src/proxy.ts` (middleware Next.js — substituir pelo mecanismo equivalente do destino para refresh de sessão, se houver; senão, refresh no client).

Commit por bloco: `feat: port permissions core`, `feat: port auth core (adapted)`, etc.

---

## Fase 3 — Decidir e implementar a camada de API

Com base na Fase 0, escolher (e registrar a escolha como adendo no ADR-015):

**Opção A — Server functions do framework do destino** (se ele tiver runtime server): route handlers/server functions no próprio repo, mesmo papel que os route handlers Next.js teriam. Menor mudança conceitual.

**Opção B — Supabase Edge Functions como camada de API**: toda lógica server-side (auth flows custom, webhooks, futuros endpoints do agente) vive em `supabase/functions/`; o frontend chama via supabase-js. Necessária de qualquer forma para webhooks de WhatsApp no Marco 2 — se o framework do destino for SPA puro, esta é a única opção.

Critério de decisão: se o framework suporta server-side de forma estável, A para lógica de aplicação + B para webhooks (híbrido, que já era o plano da platform). Se não suporta, B para tudo.

Implementar o esqueleto mínimo da escolha (auth/session funcionando ponta a ponta) — sem features novas.

---

## Fase 4 — Conectar autenticação real à UI existente (sem alterar a UI)

O protótipo do Lovable não tem telas de login (ou tem telas mock). Verificar na Fase 0:

- **Se existem telas de auth no destino**: conectar os fluxos reais (login/logout/recuperação) aos formulários existentes, mantendo o visual intocado. Apenas trocar handlers mock por chamadas reais.
- **Se não existem**: criar as rotas de auth seguindo o design system do destino (tokens de `src/styles.css`, componentes existentes) — esta é a única exceção permitida de criação de UI nesta migração, e deve visualmente pertencer à família da UI do Lovable. Marcar os arquivos com cabeçalho `/* engineering-owned: auth flow */`.

Gate de acesso: usuário não autenticado não navega nas rotas do app; usuário sem membership vê a tela de "sem empresa" (portar o conteúdo, adaptar o visual ao design system do destino).

Validar: login → home com nome da company real (vinda do banco via membership) → logout. Seed de 2 empresas + 4 usuários funcionando.

---

## Fase 5 — Guardrails e encerramento

1. Colocar o conteúdo de `docs/04-development/lovable-knowledge.md` nas instruções do projeto Lovable — **ação do Product Owner**; a instrução termina lembrando-o explicitamente disso.
2. Adicionar cabeçalho `/* data-wired */` em toda rota que a Fase 4 conectou.
3. Criar `docs/migration/migration-report.md`: o que foi migrado, o que foi adaptado, o que ficou para trás e por quê, decisão da Fase 3, estado dos testes.
4. No `conecta-flow-platform`: commit final `docs: repository archived — superseded by flow-connect (ADR-015)` atualizando o README com aviso e link; arquivar o repositório no GitHub (Settings → Archive) — **pedir confirmação do Product Owner antes de arquivar**.
5. CI verde no repo oficial: typecheck, lint, unit, rls-isolation.

---

## O que esta migração NÃO faz

- Não altera nenhum componente visual, rota, estilo ou fluxo criado pelo Lovable
- Não implementa Inbox real, contatos reais nem qualquer feature do Marco 2 — apenas fundação (auth, tenancy, RLS, auditoria, permissões)
- Não conecta dados reais às telas de Inbox/Contatos/Dashboard (permanecem com mock até o Marco 2)
- Não deleta o conecta-flow-platform — arquiva como referência histórica

## Critérios de conclusão

- [ ] `docs/migration/destination-audit.md` preenchido e checkpoint aprovado pelo Product Owner
- [ ] Supabase stack, RLS suite e CI rodando a partir do repo oficial
- [ ] Auth ponta a ponta funcionando com a UI preservada
- [ ] ADR-015 com a decisão da camada de API registrada
- [ ] repository-ownership respeitado em todos os commits (nenhum arquivo de propriedade do Lovable alterado — verificar no diff final)
- [ ] Product Owner lembrado de colar o lovable-knowledge.md no Lovable
- [ ] Platform arquivado (após confirmação)
