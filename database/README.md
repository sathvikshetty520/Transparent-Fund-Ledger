 
# Transparent Fund Ledger

A transparent crowdfunding and fund-tracking platform for social, student, and community projects.

The system allows contributors to donate to campaigns and provides an auditable view of how collected funds are allocated and utilized.

## Project Structure

```text
Transparent-Fund-Ledger/
├── backend/
├── frontend/
├── audit-ledger/
├── database/
│   ├── migrations/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrate.js
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
## Database Components

The database is implemented using PostgreSQL 16 and contains the following core tables:

- `users` — contributors, organizers, and administrators
- `campaigns` — crowdfunding campaigns and their lifecycle status
- `donations` — contributor donation records
- `allocations` — approved or proposed fund allocations
- `expenses` — spending records associated with allocations
- `ledger_entries` — append-only audit ledger

The database also contains the `schema_migrations` table for tracking applied migrations.

## Financial Flow

```text
Campaign
   ↓
Confirmed Donations
   ↓
Collected Funds
   ↓
Approved Allocations
   ↓
Verified Expenses
   ↓
Utilized Funds