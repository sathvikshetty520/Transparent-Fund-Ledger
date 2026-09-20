# Member 3 — Database, Infrastructure & Docs (`database/`)
**You own the data foundation and the glue.** The schema is a contract for M2 and M4, so you ship a solid version early. You also make setup one-command for everyone, and you own the docs and the final demo.

Read first: `docs/architecture.md` (§4, §8 Contract B, §9), `audit-ledger/README.md` (ledger table needs), `database/schema.sql` (a working draft is already there — review it, improve it, don't restart).

## What you deliver
1. Production-quality `schema.sql`: constraints, indexes, views, ledger-immutability trigger.
2. `seed.sql`, migration system, reset tooling.
3. Dashboard SQL views/queries for M2.
4. Infra: `docker-compose.yml`, `.env.example`, root `README.md`, optional CI.
5. Docs: `architecture.md`, `demo-flow.md`, ER diagram; you run the final demo rehearsal.

## Files you own
| Area | Files |
|---|---|
| Database | `database/schema.sql`, `seed.sql`, `migrations/*`, `migrate.js`, `reset.sh`, `README.md` |
| Infra | `docker-compose.yml`, `.env.example`, `.gitignore`, `LICENSE`, root `README.md` |
| Docs | `docs/architecture.md`, `docs/demo-flow.md` (+ optional `docs/er-diagram.md`) |
| CI (optional) | `.github/workflows/ci.yml` |

## Task checklist

### Phase 0 — Setup (first hour, help everyone)
- [ ] Create the GitHub repo; push scaffold; create `main` + `dev`; protect `main`.
- [ ] Verify on a **clean clone**: `docker compose up -d` → tables exist → backend connects. Fix README until every step works. Everyone's first hour depends on this.
- [ ] Add a pgAdmin/Adminer service to `docker-compose.yml` (optional but handy for debugging and the tamper demo).

### Phase 1 — Schema (contract! ship early, then announce)
- [ ] Review `schema.sql` with M2 (rules & queries) and M4 (ledger table, column names, types). Freeze v1 and announce in chat.
- [ ] Constraints: `CHECK (amount > 0)`, valid status values, FKs, uniqueness (`payment_ref`, `email`), `ON DELETE` behavior (default: no deletes of financial rows).
- [ ] Indexes for the queries M2 will run (campaign+status, allocation+status, ledger by campaign).
- [ ] Ledger table: confirm `entry_index` is a plain PK (**not SERIAL**), `hash UNIQUE`, and the trigger blocks UPDATE/DELETE. Add a statement-level trigger to block `TRUNCATE` too.
- [ ] Explain in `database/README.md` how to temporarily disable the trigger for the tamper demo: `ALTER TABLE ledger_entries DISABLE TRIGGER ledger_no_update_delete;` (needs table owner) — coordinate with M4.

### Phase 2 — Views, seed, migrations
- [ ] Views used by the dashboard (M2 reads them; agree on column names): `campaign_fund_summary` (exists), plus:
  - `campaign_purpose_summary` (campaign_id, purpose, allocated, utilized)
  - `campaign_daily_timeline` (campaign_id, day, collected, utilized)
  - `platform_summary` (totals, donor count, active campaigns)
- [ ] `seed.sql`: users + campaigns **only rows that don't need ledger entries** (see rule at the top of the file). Demo lifecycle data comes from M2's `seed:demo`. Keep the fixed UUIDs — M2's script references them.
- [ ] `migrate.js`: `schema_migrations` table, apply pending `migrations/NNN_*.sql` in order inside transactions; fold every migration back into `schema.sql`.
- [ ] `reset.sh` (or npm script): wipe + recreate + optionally run `seed:demo`.

### Phase 3 — Integrity & performance (stretch that makes the project stand out)
- [ ] DB-level invariants as triggers (defense in depth; backend still checks): reject approving an allocation if `Σ approved > Σ confirmed donations`; reject verifying an expense past its allocation. Test with plain SQL scripts in `database/tests/`.
- [ ] `EXPLAIN` the dashboard queries on ~10k generated donations; add indexes if slow.
- [ ] Prevent updates on APPROVED/VERIFIED rows (trigger) so the "immutable once approved" rule is enforced in the database too.

### Phase 3–4 — Docs & demo
- [ ] Keep `architecture.md` accurate as decisions change; add an ER diagram (Mermaid `erDiagram` in `docs/er-diagram.md` renders on GitHub).
- [ ] Finalize `demo-flow.md` with exact URLs/accounts/click path once M1's pages exist. Run a **full rehearsal** on a clean machine, time it (target 5 min), fix breakages by pinging owners.
- [ ] README: features, architecture diagram, setup, demo, screenshots (get from M1), team table.
- [ ] Slides: problem → lifecycle → ledger (M4 explains) → demo → future scope.
- [ ] Owner of the **integration check** at each milestone: merge `dev`, reset DB, `seed:demo`, click through the demo, report issues.

## Dependencies
| You need | From | When |
|---|---|---|
| Query patterns / extra columns | M2 | Phase 1 |
| Ledger table requirements | M4 | Phase 1 |
| Screenshots / final routes | M1 | Phase 3–4 |

| Who needs you | What | When |
|---|---|---|
| M2, M4 | Frozen schema v1 | **End of Phase 1 (blocking)** |
| M2 | Dashboard views | Phase 2 |
| Everyone | Working `docker compose up` | Phase 0 |

## Definition of done
- Fresh clone → follow README → app runs, DB seeded, all in a few minutes.
- Schema contains every table/column the API needs; invalid data is rejected by the DB itself.
- Ledger table cannot be casually modified (trigger), and the demo can bypass it deliberately.
- `demo-flow.md` rehearsed end to end at least once.
