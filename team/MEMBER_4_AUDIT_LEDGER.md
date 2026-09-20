# Member 4 — Audit Ledger (`audit-ledger/`)
**You own the project's differentiator.** The tamper-evident ledger is what makes this "transparent" rather than "a crowdfunding site with a dashboard." It's a small codebase — correctness and a dramatic, reliable demo matter more than volume.

Read first: `audit-ledger/README.md` (your spec — read it carefully), `docs/architecture.md` (§8 Contract A), `database/schema.sql` (`ledger_entries` table + trigger).

## What you deliver
1. `appendEntry` — called by M2 on every ledger-worthy event. **Ship this first; M2 is waiting.**
2. `verifyChain` and `reconcileCampaign` (the two detection mechanisms).
3. Read APIs: ledger list/entry/head/verify/reconcile endpoints in the backend.
4. Scripts: independent verify, live tamper demo, export.
5. A thorough test suite proving detection works.

## Files you own
| Area | Files |
|---|---|
| Library | `audit-ledger/src/{ledger,hash,verifier,types,merkle}.js` |
| Tests | `audit-ledger/tests/*` |
| Scripts | `audit-ledger/scripts/{verify,tamper-demo,export-ledger}.js` |
| Docs | `audit-ledger/README.md` (spec), the **Ledger section** of `docs/api.md` |
| Backend (exception, thin layer) | `backend/src/routes/ledger.routes.js`, `controllers/ledger.controller.js`, `services/ledger.service.js`, `backend/tests/ledger.api.test.js` |

`hash.js` and `types.js` are already written (they define the spec) — review and test them, change only with the team's agreement, because M2's data is hashed with them.

## Task checklist

### Phase 1 — `appendEntry` (blocks M2)
- [ ] Implement `appendEntry(client, input)` in `ledger.js`:
  1. `SELECT pg_advisory_xact_lock(42)` (serializes appends; released at commit/rollback)
  2. read the latest row → `prevHash` (or `GENESIS_HASH`), `index = last + 1`
  3. `timestamp = new Date()` (ms precision), compute hash via `computeEntryHash`
  4. `INSERT INTO ledger_entries (...)`; return the entry in camelCase.
  Validate input (`type` ∈ `LEDGER_TYPES`, `refType`/`refId` present, `amount` string with 2 decimals or null).
- [ ] Watch the traps: `entry_index` is not a sequence; pg returns `NUMERIC` as string and `TIMESTAMPTZ` as `Date`; JSONB may reorder keys (hashing canonicalizes, so that's fine — prove it in a test); hash **what you read back** the same way you hash **what you wrote**.
- [ ] Unit tests (Jest, real Postgres from docker): append 5 → verify OK; concurrent 20 appends via `Promise.all` → chain still valid; rollback (throw after append) leaves no gap.
- [ ] **Announce in chat when merged** — M2 switches from the stub.

### Phase 1–2 — Verification
- [ ] `verifyChain(db)`: walk in order; check contiguous indexes, `prevHash` links, recomputed hash. Return `{ valid, checkedEntries, headHash, firstBrokenIndex, reason }` (`reason`: `HASH_MISMATCH` | `BROKEN_LINK` | `INDEX_GAP`). Stream/paginate so it handles large ledgers.
- [ ] `reconcileCampaign(db, campaignId)`: compare Σ ledger amounts by type with SQL sums over `donations` (CONFIRMED), `allocations` (APPROVED), `expenses` (VERIFIED). Return per-line `{ ledger, database, match }` + overall `match`.
- [ ] `getHead(db)`, `listEntries(db, { campaignId, type, page, limit })`.

### Phase 2 — Backend endpoints (your 3 backend files)
- [ ] `ledger.service.js` wraps the library with the shared pool from `config/db`.
- [ ] Routes per `docs/api.md` Ledger section: `GET /ledger`, `/ledger/head`, `/ledger/verify`, `/ledger/:index`, `/campaigns/:campaignId/ledger`, `/campaigns/:campaignId/reconcile`. **Register `/ledger/head` and `/ledger/verify` before `/ledger/:index`.**
- [ ] Keep the response envelope `{ data, error }` (use M2's `asyncHandler`/`ApiError`).
- [ ] Give M1 a sample JSON for each endpoint the moment they work.

### Phase 3 — Scripts & demo (this is what judges remember)
- [ ] `scripts/verify.js`: independent CLI (uses only `hash.js` + `pg`) → prints VALID / first broken index; exit code 1 if invalid. Also runs reconcile for every campaign.
- [ ] `scripts/tamper-demo.js`: bypass the API — `ALTER TABLE ledger_entries DISABLE TRIGGER ledger_no_update_delete` (or tamper with the `donations` table instead), change an amount, re-enable trigger. Support modes: `--ledger` (edit a ledger row → hash mismatch), `--table` (edit a donation row → reconciliation mismatch), `--restore`. Print exactly what to click in the UI next.
- [ ] `scripts/export-ledger.js`: `ledger-export.json` with `headHash` + entries — supports the explanation "independent parties can verify without trusting our server."
- [ ] Explain the **recompute-all-hashes** attack honestly in the README and how comparing against an exported/published head hash defeats it.

### Phase 4 — Tests & stretch
- [ ] Tests: tamper amount → fails at that index; delete middle row → fails; edit prevHash → fails; edit donation only → reconcile fails while chain still valid.
- [ ] (Stretch) `merkle.js`: `merkleRoot(hashes[])`, anchor every N entries, expose `GET /ledger/anchors`. (Stretch) daily head-hash snapshot file.
- [ ] Help M3 present the ledger section in the slides (explain hash chain in 60 seconds with a diagram).

## Dependencies
| You need | From | When |
|---|---|---|
| Final `ledger_entries` table + trigger | M3 | Phase 1 (draft exists) |
| Shared `pool` + `asyncHandler`/`ApiError` | M2 | Phase 2 |
| Services that call `appendEntry` (so there's data to verify) | M2 | Phase 2–3 |

| Who needs you | What | When |
|---|---|---|
| M2 | `appendEntry` | **Phase 1 (blocking, do first)** |
| M1 | Ledger endpoints + JSON samples | Phase 2 |
| M3 | Tamper demo instructions for `demo-flow.md` | Phase 3 |

## Definition of done
- Every ledger-worthy event across the app yields one entry, and `verifyChain` returns valid on the seeded demo.
- Editing a ledger row, deleting a row, or editing a donation row directly is detected, and the UI shows it.
- 20 parallel appends never break the chain; a rolled-back transaction leaves no gap.
- You can explain in one minute what the ledger proves and what it doesn't.
