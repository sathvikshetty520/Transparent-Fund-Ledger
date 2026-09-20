# Member 2 — Backend (`backend/`)
**You own the business logic:** auth, campaigns, donations, allocations, expenses, dashboard endpoints, and the rules that keep the money honest. You sit between three others: you call **M4's `appendEntry`**, query **M3's tables/views**, and serve **M1's UI**.

Read first: `docs/architecture.md` (§8 all three contracts, §9 rules), `docs/api.md` (your spec), `audit-ledger/README.md` (ledger interface), `database/schema.sql`, `backend/README.md`.

## What you deliver
1. Foundations: DB access with transactions, auth middleware, validation, error handling.
2. Endpoints for auth, users, campaigns, donations (mock payment), allocations, expenses, dashboard — per `docs/api.md`.
3. The business rules (§ below) with tests.
4. `npm run seed:demo` that builds a full demo lifecycle **through the services**.

## Files you own
| Area | Files |
|---|---|
| Core | `src/app.js`, `server.js`, `config/{env,db}.js` |
| Middleware | `middleware/{auth,validate,upload,errorHandler}.js` |
| Utils | `utils/{asyncHandler,ApiError,response,money,seedDemo}.js` |
| Routes/controllers/services | `auth`, `user`, `campaign`, `donation`, `allocation`, `expense`, `dashboard` (each has `.routes/.controller/.service`) |
| Models (SQL) | `models/{user,campaign,donation,allocation,expense,dashboard}.model.js` |
| Payment | `services/payment.service.js` (mock) |
| Tests | `tests/{auth,campaign,donation,allocation,expense,dashboard,e2e.flow}.test.js` |
| Docs | `docs/api.md` (everything except the Ledger section) |

**Not yours (owned by M4):** `routes/ledger.routes.js`, `controllers/ledger.controller.js`, `services/ledger.service.js`, `tests/ledger.api.test.js`. `app.js` already mounts the ledger router.

## Layering rules
`routes` (path + middleware) → `controllers` (parse req, call one service, respond) → `services` (rules + transactions + `appendEntry`) → `models` (SQL only, parameterized, take a `db` argument that may be a pool **or** a transaction client). Map snake_case DB rows to camelCase in models. Money stays a string or `decimal.js`; do sums in SQL.

## Business rules (enforce all; test all)
1. Donations only to **ACTIVE** campaigns; amount > 0.
2. On allocation **approval**: `Σ APPROVED allocations + this amount ≤ Σ CONFIRMED donations` — re-check **inside the transaction** with row locking (`SELECT … FOR UPDATE` on the campaign row).
3. On expense **verification**: `Σ VERIFIED expenses on the allocation + this amount ≤ allocation.amount` — same locking approach.
4. Forward-only status transitions (`canTransition(from,to)` map); approved/verified rows never edited.
5. Only the campaign's organizer may propose allocations / submit expenses for it. Expenses only against APPROVED allocations. Receipt required.
6. Anonymous donors masked in public responses and in ledger payload (`donorDisplay: "Anonymous"`; never put emails in payload).
7. Every ledger-worthy event → **exactly one** `appendEntry(client, …)` **inside the same `withTransaction`** as the state change.

## Task checklist

### Phase 1 — Foundations (others are waiting on these)
- [ ] `npm install`; confirm `GET /api/health`; confirm DB connects (`docker compose up -d` from M3).
- [ ] `middleware/auth.js`: real `authenticate`, `optionalAuth`, `requireRole` — **keep the export names** (everyone imports them).
- [ ] `middleware/validate.js` (zod → 400 `VALIDATION_ERROR`), `errorHandler` (ApiError, zod, pg errors incl. unique violation → 409), `utils/response.js`.
- [ ] Auth: `POST /auth/register` (bcryptjs; role limited to CONTRIBUTOR/ORGANIZER), `/auth/login` (JWT), `/auth/me`; `GET /users` (ADMIN).
- [ ] Post in chat when auth is merged — M1 needs it for login.

### Phase 2 — Campaigns & donations
- [ ] Campaign endpoints incl. workflow: create (DRAFT) → submit → approve/reject → close. Approve/close call `appendEntry` (`CAMPAIGN_APPROVED` / `CAMPAIGN_CLOSED`) in the transaction. Route order: `/campaigns/mine` and `/campaigns/pending` before `/campaigns/:id`.
- [ ] `services/payment.service.js`: mock gateway (~1s delay, `paymentRef = 'PAY-'+random`; optional forced failure for a demo amount).
- [ ] Donation: create PENDING → payment → in one transaction set CONFIRMED + `appendEntry(DONATION_CONFIRMED)`. Guests allowed (`optionalAuth`). Idempotent on `payment_ref` (no double ledger entry). Return `ledgerIndex` + `ledgerHash`.
- [ ] Public donation list (masked), `/donations/me`, `/donations/:id/receipt`.
- [ ] Until M4 ships `appendEntry`, code against the documented signature and wrap the call so it's a one-line switch.

### Phase 2 — Allocations & expenses
- [ ] Allocation propose / list (with `utilized` + `remaining`) / pending queue / approve / reject — rules 2, 4, 5.
- [ ] `middleware/upload.js` (multer: jpg/png/pdf, 5 MB, random filenames). Expense submit (multipart), list (receipt URL only if VERIFIED), pending queue, verify, reject — rules 3, 4, 5, 7.
- [ ] Concurrency tests: two admins approving at once must not exceed collected funds.

### Phase 3 — Dashboard & seeding
- [ ] Dashboard endpoints (`summary`, `campaigns/:id`, `campaigns/:id/flow`, `top-campaigns`) reading M3's views (`campaign_fund_summary`, …). Ask M3 for any extra view you need instead of computing in JS.
- [ ] `utils/seedDemo.js`: using the **services** (not raw SQL) — approve the seeded pending campaigns (ids in `database/seed.sql`), add ~15 donations (some anonymous), 3–4 allocations, several expenses (some verified, some pending), one CLOSED campaign. Finish by calling `verifyChain` and printing the result.
- [ ] `tests/e2e.flow.test.js`: full lifecycle with Supertest → assert dashboard totals and `/ledger/verify` is valid.

### Phase 4 — Polish
- [ ] Tests for every rule + role guards + rollback when `appendEntry` throws.
- [ ] Update `docs/api.md` if anything drifted from the code; tell M1.
- [ ] Rate-limit login (optional), consistent error messages.

## Dependencies
| You need | From | When |
|---|---|---|
| Tables, constraints, views in `schema.sql` | M3 | Phase 0 (a draft exists — read it now) |
| `appendEntry` | M4 | Phase 1 end |
| `ledger.routes` wired (for E2E) | M4 | Phase 2 |
| Feedback on response shapes | M1 | continuous |

| Who needs you | What | When |
|---|---|---|
| M1 | auth + campaigns + donations endpoints matching `api.md` | Phase 1–2 |
| M4 | `db.pool`/`query` export for the ledger service; services that call `appendEntry` so verify has data | Phase 2 |
| M3 | `seed:demo` for the demo flow | Phase 3 |

## Definition of done
- Every endpoint in `docs/api.md` (except Ledger) works with correct role checks and envelope.
- All seven rules have passing tests; a failure in `appendEntry` rolls back the state change.
- `npm run seed:demo` on a fresh DB → ledger verifies  and dashboards show real numbers. 
