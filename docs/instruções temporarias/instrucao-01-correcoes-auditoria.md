# Instrução 01 — Correções da Auditoria (conecta-flow-platform)

Auditoria por leitura direta do código (2026-07-17). Achados ordenados por severidade. Corrigir todos neste repositório antes de qualquer migração — o código migra já corrigido.

Para cada achado: revalidar que ainda existe no código atual antes de corrigir.

---

## A1 — CRÍTICO: Regra Inviolável 6 violada — nenhuma escrita em `audit_logs`

**Achado:** `src/features/settings/services/update-company.ts` e `update-profile.ts` alteram dados sem gerar registro de auditoria. `grep -rn "audit_logs" src/` retorna zero resultados. A infraestrutura existe e está correta (tabela imutável, `audit_logs_insert` policy com `actor_id = auth.uid()`, grants revogados para update/delete) — o código simplesmente nunca a usa. O CLAUDE.md declara: "toda funcionalidade nasce com autenticação, autorização, **auditoria**".

**Correção:**

1. Criar `src/core/audit/log-action.ts`:

```typescript
import 'server-only';

import { createClient } from '@/infrastructure/supabase/server-client';

interface AuditEntry {
  companyId: string | null;
  action: string; // formato dominio.acao — ex.: 'company.updated'
  entity: string; // ex.: 'companies:<id>'
  metadata?: Record<string, unknown>;
}

/**
 * Grava trilha de auditoria como o usuário autenticado (a insert policy
 * exige actor_id = auth.uid()). Falha de auditoria NÃO deve derrubar a
 * operação de negócio — logar no console e seguir; a operação principal
 * já foi commitada. Trocar por transação conjunta quando o event bus
 * (Marco 2) existir.
 */
export async function logAction(entry: AuditEntry): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: user.id,
    company_id: entry.companyId,
    action: entry.action,
    entity: entry.entity,
    metadata: entry.metadata ?? {},
  });

  if (error) {
    console.error('[audit] failed to write audit log:', error.message, entry.action);
  }
}
```

2. Chamar em `update-company.ts` após o update bem-sucedido:

```typescript
await logAction({
  companyId: membership.companyId,
  action: 'company.updated',
  entity: `companies:${membership.companyId}`,
  metadata: { fields: ['name', 'timezone', 'locale'] },
});
```

3. Chamar em `update-profile.ts` com `action: 'profile.updated'`, `companyId: null` (perfil não pertence a uma company), `entity: profiles:<user.id>`.

4. Adicionar teste unitário para `logAction` (mock do client) e atualizar `docs/02-architecture/security-model.md` se ele não documentar o helper.

**Regra daqui em diante:** toda server action que altera estado chama `logAction`. Sem exceção. Registrar isso no CLAUDE.md na seção de convenções.

---

## A2 — ALTO: `ROLE_PERMISSIONS` diverge da matriz do permission-model.md

**Achado:** `src/core/permissions/role-permissions.ts` define `owner: ['user.manage', 'dashboard.read', 'audit.read']` e `attendant: ['dashboard.read']`. A matriz oficial em `docs/02-architecture/permission-model.md` atribui ao Owner `conversation.read/reply/assign`, `contact.read/edit` etc., e ao Attendant `conversation.read/reply`, `contact.read`. Nenhuma permissão `conversation.*` ou `contact.*` existe no código. Se a redução é intencional (Marco 1 não tem Inbox), isso não está escrito em lugar nenhum — e no Marco 2 alguém vai implementar a Inbox contra um mapa incompleto sem saber.

**Correção (escolher A, salvo objeção fundamentada):**

**Opção A (recomendada):** completar o mapa agora com a matriz integral do permission-model.md. Permissões de features inexistentes não causam dano — `hasPermission` só é consultado por código que existe. Elimina o risco de esquecimento no Marco 2.

**Opção B:** manter mínimo e adicionar comentário no arquivo + nota no permission-model.md: "mapa em código reflete apenas os domínios implementados; expandir a cada marco". Menos seguro — depende de disciplina futura.

Implementar a opção A:

```typescript
export const ROLE_PERMISSIONS = {
  owner: [
    'conversation.read',
    'conversation.reply',
    'conversation.assign',
    'conversation.handoff',
    'contact.read',
    'contact.edit',
    'user.manage',
    'dashboard.read',
    'audit.read',
    'module.read',
  ],
  attendant: [
    'conversation.read',
    'conversation.reply',
    'conversation.handoff',
    'contact.read',
    'dashboard.read',
  ],
} as const satisfies Record<string, readonly string[]>;
```

Conferir a lista final contra a matriz do permission-model.md linha a linha — o doc é a fonte de verdade; se houver conflito entre esta instrução e o doc, o doc vence e esta lista se ajusta.

---

## A3 — ALTO: tabela `permissions` existe mas é órfã — duas fontes de verdade

**Achado:** a migration cria `permissions` (catálogo global `dominio.acao`) mas: (a) nenhum seed a popula; (b) nenhum código a lê; (c) `hasPermission` usa apenas o mapa estático + override JSONB do membership. Duas fontes de verdade sem reconciliação = deriva silenciosa garantida.

**Correção:**

1. Popular o catálogo no seed (`supabase/seed/seed.ts`) com todas as chaves usadas em `ROLE_PERMISSIONS` + as da matriz do permission-model.md, com descrição.
2. Criar teste de consistência em `tests/unit/core/permissions/catalog-consistency.test.ts`: toda chave em `ROLE_PERMISSIONS` deve existir no catálogo de fixtures do seed. O teste importa a lista do seed (extrair as chaves para um módulo compartilhado, ex. `src/core/permissions/permission-catalog.ts`, que tanto o seed quanto o teste importam).
3. Documentar no permission-model.md qual é a autoridade: **o catálogo em código (`permission-catalog.ts`) é a fonte de verdade; a tabela `permissions` é projeção para consulta administrativa (Mission Control) e é semeada a partir dele.**

---

## A4 — MÉDIO: `shares_active_company_with` — nome mente sobre a semântica

**Achado:** o nome sugere "compartilha a company *ativa* comigo", mas a implementação verifica se os dois perfis compartilham **qualquer** company (o "active" refere-se ao `status` do membership, não à company ativa da sessão — que nem existe no banco, é conceito de aplicação via cookie). Um dev futuro que confie no nome vai escrever policy errada.

**Correção:** renomear para `shares_company_with` em nova migration (`create or replace` + atualizar a policy `profiles_select` que a referencia; dropar a função antiga). Atualizar o comentário da função explicando que "membership ativo" ≠ "company ativa da sessão". Rodar `npm run db:types` e a suíte RLS após a mudança.

---

## A5 — MÉDIO: tensão de produto não documentada — multi-membership vs "usuário contido na company"

**Achado:** ADR-001 + `CompanySwitcher` + seed com usuário em 2 empresas estabelecem multi-membership como capacidade real. O Product Owner declarou em sessão de produto que "o usuário está contido na company e subordinado a ela" — sem switcher na visão de produto da UI. Não é contradição técnica (o switcher se oculta com membership único), mas a postura nunca foi escrita, e o protótipo Lovable foi construído sem switcher. Sem registro, alguém vai "corrigir" um dos lados no futuro.

**Correção:** adicionar nota ao ADR-001 (seção "Clarificação 2026-07"):

> Multi-membership é capacidade **arquitetural** (um profile pode ter vínculos com várias companies — necessário para o operador da plataforma e casos excepcionais administrados via Mission Control). **Não é feature de produto**: o usuário típico pertence a uma única company e a UI não promove alternância. O `CompanySwitcher` permanece no código como mecanismo de suporte, renderizado apenas quando existem múltiplos memberships — o que, por política de produto, só ocorre em contas administradas pela plataforma. O protótipo de UI não exibe switcher, e isso está correto.

---

## A6 — BAIXO: rota `/sem-empresa` viola convenção de identificadores em inglês

**Achado:** convenção do CLAUDE.md: "código e identificadores em inglês; interface em pt-BR". Todas as rotas são inglesas (`/login`, `/settings`, `/admin`) exceto `/sem-empresa`. URL é identificador (aparece em código, redirects, testes), não interface.

**Correção:** renomear diretório para `src/app/no-company/`, atualizar todos os redirects que apontam para `/sem-empresa` (buscar com grep), manter o conteúdo da página em pt-BR. Alternativa aceitável: decidir que URLs são interface voltada ao usuário e documentar a exceção no coding-standards.md — mas decidir e escrever, não deixar ambíguo.

---

## A7 — BAIXO: regra de eventos (Regra 3) sem deferral documentado

**Achado:** a Regra Inviolável 3 exige evento imutável para toda alteração importante, mas a tabela `events` só chega no Marco 2 — e `company.updated` hoje não gera evento. O deferral é razoável, mas não está escrito; a regra parece simplesmente ignorada.

**Correção:** adicionar ao `implementation-plan.md` (Etapa B) uma nota: "Eventos (Regra 3) deferidos até a criação do event store no Marco 2; ao criar a tabela `events`, retrofitar publicação em `update-company`/`update-profile` e em todo write path existente." Adicionar `TODO(marco-2): publish company.updated event` como comentário no código dos dois services.

---

## A8 — BAIXO: cobertura de teste unitário desproporcional ao risco

**Achado:** único teste unitário é `button.test.tsx` (componente de UI trivial). `hasPermission` e `getMemberships` — exatamente as funções de autorização — não têm testes. A suíte RLS cobre o banco, mas a camada de aplicação de permissões está nua.

**Correção:** criar `tests/unit/core/permissions/has-permission.test.ts` cobrindo: permissão do role, permissão de override, permissão inexistente, override vazio/undefined. Criar teste para o teste de consistência do A3. `getMemberships` pode aguardar (exige mock do Supabase; valor menor), mas registrar como pendência no plano.

---

## A9 — REGISTRO: pendências conhecidas que permanecem abertas (não corrigir agora)

Apenas confirmar que continuam rastreadas no `implementation-plan.md`:
- Validação do Product Owner da Etapa A (checkbox aberto).
- Criação do projeto Supabase cloud de development (checkpoint de decisão do usuário).

---

## Critérios de conclusão

- [ ] `logAction` criado, chamado em ambos os services, com teste
- [ ] `ROLE_PERMISSIONS` alinhado com permission-model.md (matriz completa)
- [ ] `permission-catalog.ts` criado; seed popula `permissions`; teste de consistência passa
- [ ] Função renomeada para `shares_company_with` (migration + policy + types regenerados)
- [ ] Nota de clarificação no ADR-001
- [ ] Rota `/sem-empresa` renomeada ou exceção documentada
- [ ] Deferral de eventos documentado + TODOs no código
- [ ] Testes de `hasPermission` passando
- [ ] `npm run typecheck && npm run lint && npm run test` verdes; `npm run test:rls` verde com stack local
- [ ] Commits separados por tipo de mudança (migration em commit próprio, conforme convenção)
