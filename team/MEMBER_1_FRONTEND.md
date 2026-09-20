# Member 1 — Frontend (`frontend/`)
**You build everything users see:** public pages, donor/organizer/admin screens, dashboards with charts, and the audit explorer. You depend on the API being built in parallel, so you work against **mock data first** and switch to the real API as endpoints land.

Read first: `docs/architecture.md` (§3 roles, §4 lifecycle, §8 Contract C), `docs/api.md` (all of it — it's your spec), `frontend/README.md`.

## What you deliver
1. App shell: layouts, navbar with role-aware links, UI kit, routing, auth state.
2. Public: home, campaign list/detail, public dashboard, per-campaign dashboard, audit explorer, verify-ledger page.
3. Donor: donate flow, my donations, receipt (with ledger hash).
4. Organizer: my campaigns, create/edit campaign, propose allocation, submit expense (receipt upload).
5. Admin: approve campaigns, approve allocations, verify expenses.
6. Polish: loading/empty/error states, responsive layout.

## Files you own (everything under `frontend/`)
| Area | Files |
|---|---|
| Entry & routing | `src/main.jsx`, `src/App.jsx` |
| Layouts | `layouts/MainLayout.jsx`, `AdminLayout.jsx` |
| API layer | `services/api.js` (only axios instance), `services/*.service.js`, `services/mocks/` |
| State & helpers | `hooks/useAuth.jsx`, `hooks/useFetch.js`, `utils/format.js`, `utils/constants.js`, `styles/global.css` |
| UI kit | `components/ui/{Button,Card,Badge,Modal,Table,Spinner}.jsx`, `Navbar`, `Footer`, `ProtectedRoute` |
| Feature components | `components/campaign/*`, `donation/DonateForm`, `allocation/AllocationCard`, `expense/ExpenseForm`, `charts/*`, `audit/{LedgerTable,HashBadge,ChainVisualizer}` |
| Pages | `pages/*.jsx`, `pages/admin/*.jsx` |

You don't edit files outside `frontend/`. If the API doesn't give you what you need, request a change to `docs/api.md` (Member 2) via PR.

## Task checklist

### Phase 0–1 — Shell (do first; ~first third of the time)
- [ ] `npm install && npm run dev` works; agree on the look (plain CSS is fine; Tailwind optional if the whole team agrees — you decide).
- [ ] Design tokens in `global.css`; UI kit (`Button`, `Card`, `Badge`, `Modal`, `Table`, `Spinner`). `Badge` must map **every status** (campaign / donation / allocation / expense / ledger type) to a color via `utils/constants.js`.
- [ ] `utils/format.js`: `formatINR`, `formatDate`, `shortHash(hash)` (e.g. `a1b2…9f`).
- [ ] `services/api.js` (already scaffolded) + one `*.service.js` per domain, **one function per endpoint** in `docs/api.md`. Add a `VITE_USE_MOCK` switch returning fixtures from `services/mocks/` — mock shapes must match `docs/api.md` exactly.
- [ ] `useAuth`: `user`, `login`, `register`, `logout`, `hasRole(...)`; token in `localStorage` key `token`. `ProtectedRoute` with a `roles` prop.
- [ ] `Navbar` (role-aware), `MainLayout`, `AdminLayout`, `NotFound`; wire all routes in `App.jsx`.

### Phase 2 — Core screens
- [ ] `Login`, `Register` (role choice: Contributor / Organizer).
- [ ] `Home`: hero, live totals (dashboard summary), featured campaigns, "how transparency works" (3 steps), **"Ledger verified "** badge (from `/ledger/verify`).
- [ ] `Campaigns` (search + category filter + pagination) with `CampaignCard` + `FundProgress`.
- [ ] `CampaignDetail` with tabs: **Donations** (public list) · **Allocations** (`AllocationCard`: purpose, amount, utilized bar, status) · **Expenses** (verified list + receipt links) · **Audit trail** (`LedgerTable` filtered by campaign). Donate button opens `DonateForm`.
- [ ] `DonatePage`/`DonateForm` (presets, name, anonymous toggle) → `DonationReceipt` showing amount, campaign, ledger index and `HashBadge`; `MyDonations`.
- [ ] Organizer: `MyCampaigns` (status badges + "Submit for approval"), `CampaignCreate`/`CampaignEdit` (+`CampaignForm`), `ProposeAllocation` (show "available to allocate" from campaign dashboard data), `SubmitExpense` (+`ExpenseForm` with receipt upload + preview).
- [ ] Admin: `CampaignApprovals`, `AllocationApprovals`, `ExpenseVerification` (show receipt + allocation remaining; approve/reject with note). Friendly messages for `RULE_VIOLATION` (422) errors.

### Phase 3 — Dashboards & audit (Recharts)
- [ ] `PublicDashboard`: KPI cards (collected / allocated / utilized), top-campaigns bar chart, recent activity feed.
- [ ] `CampaignDashboard`: KPI cards, `FundFlowChart` (Sankey or a clear Collected → Allocated → Utilized stepper), `UtilizationChart` (per purpose allocated vs utilized), `TimelineChart` (cumulative collected vs utilized).
- [ ] `AuditExplorer`: paginated `LedgerTable` (index, type, campaign, amount, time, short hash, prev hash), filters, row → details panel.
- [ ] `ChainVisualizer`: blocks linked by hashes; highlight the broken entry in red after a failed verification.
- [ ] `VerifyLedger`: button **Verify entire ledger** → big / with details (`firstBrokenIndex`, `reason`) + per-campaign reconciliation table (`/campaigns/:id/reconcile`). This page is the demo's climax — make it clear and dramatic.

### Phase 4 — Polish
- [ ] Loading skeleton, empty state, error state on **every** page; mobile check; consistent currency/date formatting.
- [ ] Screenshots for `README.md` (send to Member 3).

## Dependencies
| You need | From | When |
|---|---|---|
| Stable `docs/api.md` shapes | M2 | Phase 0 (already drafted) |
| Real endpoints | M2 | Phase 2 onward (use mocks until then) |
| `/ledger/*` endpoints and entry JSON shape | M4 | Phase 2 |
| Seeded demo data (`seed:demo`) | M2 + M3 | Phase 3 |

Who needs you: nobody blocks on the UI, but the demo does — keep `dev` deployable.

## Definition of done
- Every endpoint in `docs/api.md` that has a user-facing purpose is reachable from a screen.
- A visitor with no account can see where every rupee of a campaign is from one page.
- Full lifecycle is clickable end to end (donate → propose → approve → expense → verify → dashboard updates → ledger verify ->correct → tamper → wrong).
- No page crashes on empty data or API errors.

## Tips
- Never call axios directly in components — only through `services/`.
- Amounts arrive as strings (`"1500.00"`); format for display, never do float math on them.
- Anonymous donors already arrive masked from the API; don't try to unmask.
