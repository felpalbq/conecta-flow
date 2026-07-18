# ⚠️ Conecta Flow Platform — ARCHIVED

**Status:** Read-Only Archive · Superseded by [`flow-connect`](https://github.com/felpalbq/flow-connect)  
**Date:** 2026-07-17  
**Reason:** [ADR-015](./docs/decisions/ADR-015-official-repository-inversion.md) — Repository consolidation

---

## ⬅️ Go to Official Repository

**Active development** has moved to **[`flow-connect`](https://github.com/felpalbq/flow-connect)**.

This repository is archived for **historical reference only**. All new features, bug fixes, and releases are published from `flow-connect`.

---

## What Happened

- ✅ Auditoria e correções completadas (8 achados)
- ✅ Fundação (Supabase, RLS, permissões, auditoria) migrada para flow-connect
- ✅ Server Functions adaptadas ao TanStack Start
- ✅ Banco, testes, CI/CD duplicados com sucesso
- ✅ flow-connect é agora o repositório oficial único

---

## Migration Details

See:
- [`docs/decisions/ADR-015-official-repository-inversion.md`](./docs/decisions/ADR-015-official-repository-inversion.md) — Decision record
- [`docs/migration/destination-audit.md`](./docs/migration/destination-audit.md) — Stack verification (flow-connect)
- [`docs/migration/migration-checkpoint.md`](./docs/migration/migration-checkpoint.md) — Phases 0–3 status
- [`docs/instructions/`](./docs/instructions%20temporarias/) — Migration instructions (Portuguese)

---

## If You Need This Code

### To see the current state before migration:
Browse git history on the `main` branch up to commit `829b587` (destination audit).

### To continue development:
Clone [`flow-connect`](https://github.com/felpalbq/flow-connect) instead.

### To understand the architecture:
See `docs/02-architecture/` — it applies to both repos (framework-agnostic).

---

## License

Same as flow-connect. See LICENSE file.

---

**This repository is no longer maintained. Go to [flow-connect](https://github.com/felpalbq/flow-connect).**
