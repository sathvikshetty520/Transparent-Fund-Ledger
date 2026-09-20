# Demo Flow (5 minutes)
**Owner: Member 3** (finalize with exact URLs/screens once pages exist). All demo accounts use `Password@123`.

| Account | Role |
|---|---|
| admin@demo.com | ADMIN |
| organizer1@demo.com / organizer2@demo.com | ORGANIZER |
| donor1..4@demo.com | CONTRIBUTOR |

## Setup before presenting
```bash
docker compose down -v && docker compose up -d
cd backend && npm run dev &      # then in another shell:
npm run seed:demo                # lifecycle via services => valid ledger
```

## Script
1. **Problem (30s)** — "You donate, but where does it go?"
2. **Public dashboard** — totals collected / allocated / utilized across campaigns.
3. **Campaign page** — donations list, allocations, verified expenses with receipts, fund-flow chart.
4. **Live lifecycle** — donor donates (receipt shows ledger hash) → organizer proposes allocation → admin approves → organizer submits expense with receipt → admin verifies → dashboard updates.
5. **Audit explorer** — hash-linked entries; click **Verify ledger** →  valid.
6. **Tamper** — run `cd audit-ledger && npm run tamper` (edits a donation amount directly in the DB) → **Verify ledger** →  broken / reconciliation mismatch on the campaign. `npm run tamper -- --restore` to undo.
7. **Close (30s)** — what's next: Merkle anchoring, payment gateway, CSV audit reports.

## Backup plan
Record a screen capture of steps 4–6. Keep a second reset command ready: `docker compose down -v && docker compose up -d && npm run seed:demo`.
