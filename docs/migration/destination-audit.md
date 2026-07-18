# Destination Audit — flow-connect (2026-07-17)

Auditoria do repositório destino antes da migração da fundação de `conecta-flow-platform` para `flow-connect`.

---

## 1. Stack Real (Verificada)

### Framework & Runtime
- **Framework:** TanStack Start v1.168.26 (full-stack React framework)
- **Bundler:** Vite v8.0.16
- **Router:** TanStack Router v1.170.16 (file-based routing em `src/routes/`)
- **Package Manager:** Bun (bun.lock presente)
- **Node/Runtime:** Nitro (cloudflare workers/edge functions como build target)

### Capacidade Servidor
✅ **SIM, suporta server-side nativo:**
- `src/server.ts` existe (entry point do servidor)
- `src/routeTree.gen.ts` gerado automaticamente (roteamento full-stack)
- Nitro como runtime (suporta edge functions e workers)
- TanStack Start permite Server Functions nativas (similar a Next.js server functions)
- SSR funcionando (renderiza HTML no servidor)

**Implicação:** Podemos usar **Opção A** (Server Functions nativas do framework) ou **Opção B** (Supabase Edge Functions). Recomendação: **Opção A** para lógica de aplicação, **Opção B** para webhooks.

### Frontend Stack
- **React:** v19.2.0
- **UI:** Radix UI + shadcn/ui (completo)
- **Estilos:** Tailwind CSS v4.2.1
- **Forms:** React Hook Form v7.71.2
- **Validação:** Zod v3.24.2 (presente no package.json)
- **Query:** TanStack Query v5.101.1
- **Icons:** lucide-react

### TypeScript
- **Strict Mode:** ✅ Habilitado (tsconfig.json strict: true)
- **Alias @/:** ✅ Configurado
- **Versão:** v5.8.3
- **any em uso:** Nenhum encontrado em código Lovable existente

---

## 2. Estrutura de Diretórios Existente

```
src/
├── components/          (Lovable: componentes UI + shadcn/ui)
│   ├── ui/             (shadcn/ui components)
│   └── app-shell.tsx   (layout principal)
├── routes/             (Lovable: páginas — roteamento file-based)
│   ├── __root.tsx      (root layout)
│   ├── index.tsx       (home)
│   ├── inbox.tsx       (inbox com mock data)
│   ├── contatos.tsx    (contacts)
│   ├── configuracoes.tsx (settings)
│   └── dashboard.tsx   (dashboard)
├── hooks/              (Lovable: React hooks)
├── lib/                (Lovable: utilitários — mock-data.ts, utils.ts, etc.)
├── router.tsx          (TanStack Router config)
├── routeTree.gen.ts    (auto-generated)
├── server.ts           (Nitro server entry)
├── start.ts            (TanStack Start entry)
└── styles.css          (Tailwind + design tokens)

public/                 (Lovable: assets)
```

### Conflitos de Nome (ZERO encontrados)
✅ Não há `src/core/`, `src/features/`, `src/infrastructure/` — espaço limpo para migração.

---

## 3. Diretórios a Criar

Quando a migração começar, estes diretórios serão criados (propriedade do Claude Code):

```
supabase/               (novo — migrations, seed, types, config)
docs/                   (novo — cópia de conecta-flow-platform)
tests/                  (novo — testes unitários + integração RLS)
.github/                (novo — CI/CD workflows)
src/core/               (novo — auth, tenancy, permissions, audit)
src/features/           (novo — módulos de negócio — inbox, contatos, etc.)
src/infrastructure/     (novo — adapters, Supabase clients)
docs/migration/         (novo — relatórios de migração)
```

Nenhum conflito esperado — a estrutura Lovable permanece intocada.

---

## 4. TypeScript & Code Quality

| Aspecto | Status |
|---------|--------|
| Strict mode | ✅ Sim |
| `any` permitido | ❌ Não (não encontrado) |
| Alias @/ | ✅ Presente |
| ESLint | ✅ Configurado (.eslintignore, eslint.config.js) |
| Prettier | ✅ Configurado (.prettierrc) |

**Recomendação:** Aplicar os mesmos padrões de strict TypeScript + sem `any` ao código de engenharia que será adicionado.

---

## 5. Decisão Necessária — Camada de API (ADR-015)

### Opção A: Server Functions Nativas (TanStack Start)
- **O quê:** Usar `createServerFn` do TanStack Start para funções server
- **Vantagem:** Mesmo framework, sem infraestrutura extra, type-safe client→server
- **Risco:** Tied to TanStack Start (menor risco que Next.js — TanStack é agnóstico)
- **Decisão:** ✅ Recomendado para lógica de aplicação

### Opção B: Supabase Edge Functions
- **O quê:** Webhooks, consumidores de eventos, processamento assíncrono
- **Vantagem:** Perto do banco, independente do app, pronto para webhooks
- **Risco:** Infraestrutura extra (mas necessária para webhooks)
- **Decisão:** ✅ Obrigatório para webhooks (WhatsApp, pagamentos); usar junto com A

### Recomendação Final
**Híbrida (Opção A + B):**
- **Opção A (Server Functions):** Lógica de negócio, auth, queries Supabase, operações síncronas
- **Opção B (Edge Functions):** Webhooks de entrada (WhatsApp, pagamentos), consumidores de fila (pgmq), processamento assíncrono
- **ADR-015:** Será atualizado com esta decisão antes de Fase 1

---

## 6. O que Migra, O que Permanece

### Migrate (cópia direta, framework-agnóstico)
✅ `docs/` completo (arquitetura, ADRs, plano)
✅ `supabase/` (migrations, seed, config)
✅ `tests/` (RLS isolation suite)
✅ `.github/workflows/ci.yml`

### Adapt (portado ao framework TanStack)
⚠️ `src/core/` (auth, tenancy, permissions — usar Server Functions ao invés de Next.js server actions)
⚠️ `src/infrastructure/` (Supabase clients — compatível, sem mudança)
⚠️ `src/features/**/services` (compatível, nenhuma mudança)

### Permanece (propriedade Lovable)
✅ `src/components/**` (não muda)
✅ `src/routes/**` (sem alteração visual)
✅ `public/`, `src/hooks/`, `src/lib/` (design system, utilitários)

---

## 7. Checklist de Pré-Migração

Antes de Fase 1, validar:

- [ ] Flow-connect clonado e acesso confirmado
- [ ] Stack verificada (TanStack Start, Nitro, TypeScript strict)
- [ ] Nenhum conflito de diretório
- [ ] Direção de propriedade entendida (Lovable vs Claude Code)
- [ ] **ADR-015 será atualizado com decisão A+B (Server Fns + Edge Fns)**
- [ ] Product Owner aprova prosseguimento

---

## 8. Cronograma Esperado

| Fase | Trabalho | Tempo Estimado |
|------|----------|-----------------|
| 0 | Auditoria (este doc) | ✅ Completo |
| 1 | Migrar framework-agnóstico | 2–3 horas |
| 2 | Portar código engenharia | 3–4 horas |
| 3 | Implementar camada API (A+B) | 2–3 horas |
| 4 | Conectar auth ponta-a-ponta | 1–2 horas |
| 5 | Guardrails, testes, limpeza | 1–2 horas |
| **Total** | | **10–15 horas** |

---

## Status

✅ **Fase 0 Completa — Pronto para checkpoint com Product Owner**

Recomendação: Prosseguir com Fase 1 após aprovação explícita do PO.
