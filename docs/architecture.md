# Architecture & Project Overview

## 1. Problem
Contributors to student, social and community campaigns rarely know where their money went. Platforms show *how much was raised*, not *how it was allocated and spent*. We build a platform where **every rupee is traceable from collection to allocation to utilization**, and where the record cannot be silently altered.

## 2. Solution in one paragraph
Organizers create campaigns; admins approve them; contributors donate. Organizers propose **allocations** ("₹20,000 for lab equipment"); admins approve. Organizers then submit **expenses** with receipts against approved allocations; admins verify. Every important event is appended to a **hash-chained ledger**, so any edit to history is detectable. A **public dashboard** and **audit explorer** let anyone see the funds flow and verify the chain themselves.

## 3. Roles
| Role | Can do |
|---|---|
| Public visitor | Browse campaigns, dashboards, audit explorer, verify ledger |
| CONTRIBUTOR | + donate, see own donations/receipts |
| ORGANIZER | + create campaigns, propose allocations, submit expenses |
| ADMIN | + approve/reject campaigns, allocations, expenses; close campaigns |

## 4. Fund lifecycle
```
 COLLECTED             ALLOCATED                UTILIZED
 (donations CONFIRMED) (allocations APPROVED)   (expenses VERIFIED)
      Σ collected  ≥   Σ allocated         ≥    Σ utilized
 unallocated = collected − allocated      unspent = allocated − utilized
```
Ledger entries: `DONATION_CONFIRMED` → `ALLOCATION_APPROVED` → `EXPENSE_VERIFIED` (plus `CAMPAIGN_APPROVED`, `CAMPAIGN_CLOSED`).

## 5. Scope → who delivers it
| Suggested scope | Delivered by |
|---|---|
| Campaign/project creation | M2 (API) + M1 (UI) on M3's tables |
| Contributor & donation records | M2 (API, mock payment) + M1 (UI) |
| Fund allocation workflow | M2 (rules/API) + M1 (UI) |
| Public utilization dashboard | M3 (SQL views) → M2 (endpoints) → M1 (charts) |
| Tamper-evident audit trail | M4 (`audit-ledger`) + M3 (table, trigger) + M2 (calls it) |

## 6. Stack
React 18 + Vite · Node.js + Express · PostgreSQL 16 (raw SQL via `pg`) · Docker Compose · Jest/Supertest · SHA-256 hash chain.

## 7. Architecture
```
 frontend/ (React)  ──HTTP JSON──►  backend/ (Express)  ──SQL──►  PostgreSQL (database/)
                                       │  routes → controllers → services → models
                                       │
                 services call ────────┴──► audit-ledger (appendEntry, verifyChain)
                                                 └── writes/reads ledger_entries
```
Golden rule: **state change + `appendEntry` run in the same DB transaction.**

## 8. Integration contracts (the seams between members)
These three contracts let four people work in parallel. Changing one requires a PR that updates this doc + a ping to the affected member.

### Contract A — Ledger interface (M4 → M2)
```js
const { appendEntry, LEDGER_TYPES } = require('audit-ledger');
await withTransaction(async (client) => {
  await donationModel.confirm(client, id);
  await appendEntry(client, {
    type: LEDGER_TYPES.DONATION_CONFIRMED,
    campaignId, refType: 'Donation', refId: id,
    amount: '1500.00', payload: { donorDisplay: 'Anonymous', paymentRef },
  });
});
```
Returns `{ index, hash, prevHash, timestamp, ... }`. Full spec: `audit-ledger/README.md`.

### Contract B — Database (M3 → M2, M4)
Table/column names and status values in `database/schema.sql` are the contract. M2 and M4 must not assume anything not in that file. Schema changes → migration + announcement.
- DB naming: `snake_case`. API/JSON and ledger hashing: `camelCase`. Models map between them.
- Money: `NUMERIC(12,2)`; pg returns strings, keep them strings (or `decimal.js`). **Never JS floats.**
- Views (`campaign_fund_summary`, …) are the source for dashboard numbers.

### Contract C — HTTP API (M2 → M1)
`docs/api.md`. Envelope `{ data, error }`. M1 can develop against `frontend/src/services/mocks/` until endpoints exist.

## 9. Business rules (enforced in backend services; also as DB constraints where possible)
1. Donations only to `ACTIVE` campaigns; amount > 0.
2. Σ APPROVED allocations ≤ Σ CONFIRMED donations (re-checked inside the approving transaction).
3. Σ VERIFIED expenses per allocation ≤ allocation amount (re-checked when verifying).
4. Forward-only status transitions; approved/verified records are immutable.
5. Only the campaign's organizer proposes allocations / submits expenses for it.
6. Anonymous donors are masked in every public API and ledger payload.
7. Each ledger-worthy event appends exactly one ledger entry, atomically.

## 10. Ownership matrix
| Path | Owner | Notes |
|---|---|---|
| `frontend/**` | M1 | all UI, incl. dashboards and audit pages |
| `backend/**` | M2 | except the 3 ledger files below |
| `backend/src/{routes,controllers,services}/ledger.*` | M4 | thin wrapper over `audit-ledger` |
| `database/**`, `docker-compose.yml`, `.env.example`, `README.md`, `docs/architecture.md`, `docs/demo-flow.md` | M3 | |
| `audit-ledger/**` | M4 | |
| `docs/api.md` | M2 | M4 owns the Ledger section |

Every stub starts with `// OWNER: Member N`. Don't edit files you don't own — open a PR and request the owner's review.

## 11. Git workflow
`main` (always runnable) ← `dev` (integration) ← feature branches `m1/donate-page`, `m2/allocation-service`, `m3/views`, `m4/verify-chain`. Small PRs, one reviewer. Commit style: `feat(m2): confirm donation and append ledger entry`. Merge `dev → main` at each milestone.

## 12. Milestones
| Phase | Goal | Done when |
|---|---|---|
| 0. Setup (hour 1, all) | Everyone runs their part | `docker compose up`, `/api/health`, blank UI load |
| 1. Foundations | schema, auth, `appendEntry`, UI shell | login works; ledger append+verify unit tests pass |
| 2. Core flows | campaigns, donations, allocations, expenses (API + UI) | full lifecycle via API |
| 3. Integration | dashboards, audit explorer, demo seed | `seed:demo` + verify  + all pages wired |
| 4. Polish | tests, tamper demo, docs, slides | rehearsed 5-minute demo |

## 13. Stretch goals (only after the demo works)
Razorpay test mode · Merkle-root anchoring · CSV/PDF audit export · QR on receipts · anomaly flags · DB-level invariant triggers. 
