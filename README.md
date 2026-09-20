📌 Table of Contents
- [1. Executive Overview & Vision](#1-executive-overview--vision)
- [2. The Core Problem & Why Other Solutions Fail](#2-the-core-problem--why-other-solutions-fail)
- [3. Key Features of Transparent Fund Ledger](#3-key-features-of-transparent-fund-ledger)
- [4. The Cryptographic Audit Ledger & Data Integrity](#4-the-cryptographic-audit-ledger--data-integrity)
- [5. The Immutability Engine & Core Flow](#5-the-immutability-engine--core-flow)
- [6. Complete Tech Stack](#6-complete-tech-stack)
- [7. System Architecture & Data Flow](#7-system-architecture--data-flow)
- [8. Project Boundaries & Scope](#8-project-boundaries--scope)
- [9. Local Setup & Testing Guide](#9-local-setup--testing-guide)

---

### 1. Executive Overview & Vision
**Transparent Fund Ledger** is a campus and organizational platform designed to bring absolute mathematical transparency to fund management, donations, and expenses. It is built upon three foundational pillars that traditional fund management systems miss:

*    **Role-Based Accountability & Real-World Verification**: Distinct roles (Admin, Organizer, Contributor) anchor every transaction to verified identities, eliminating untracked spending, phantom funds, and low-trust financial interactions.
*    **Zero Trust via Cryptographic Forensics**: Instead of asking users to blindly trust that their donations are spent correctly, the platform automatically records every financial event (donations, allocations, and expenses) into an immutable, hash-chained ledger to construct an objective, empirically verified financial history.
*    **Incentive-Driven Transparent Economy**: A structured public dashboard allows contributors to track exactly where their money is allocated and spent in real time, replacing blind goodwill with a verifiable, mathematically sound ecosystem.

 The flagship feature of the Transparent Fund Ledger is its **Append-Only Cryptographic Audit Engine**: It acts as an autonomous digital notary. Whenever a donation is made, an allocation is approved, or an expense is verified, the system generates a unique cryptographic hash linked to the previous transaction, making it impossible to retroactively alter the financial history without breaking the entire chain.

---

### 2. The Core Problem & Why Other Solutions Fail
In charitable ecosystems, NGOs, and student bodies, tracking donations and expenses fails consistently due to structural limitations in existing platforms:

| Platform | Fundamental Weakness | Why It Fails for Transparent Funds |
| :--- | :--- | :--- |
| **Spreadsheets / Excel** | Built for static data, not security | No cryptographic trust; data can be altered retroactively without leaving a trace. |
| **Traditional Banking Portals** | Closed and opaque systems | Good for internal tracking, but has no mechanism for public contributors to verify the specific destination of their funds. |
| **Crowdfunding Sites** | Commercial, black-box networks | Take heavy commission fees and offer zero post-donation tracking on how the money is actually spent by the organizer. |

 **The Common Failure Mode**: Most existing fund platforms rely on *naive trust*: The Organizer writes "Spent $500 on supplies" ⟹ Platform assumes it is true. This leads to misappropriated funds, missing receipts, and total breakdown of donor trust.

---

### 3. Key Features of Transparent Fund Ledger

 **1. Strict Role-Based Trust Layer**
*   Authentication tied to specific capabilities: **Contributors** donate, **Organizers** create campaigns and propose spending, and a central **Admin** verifies campaigns and final expense receipts.
*   Eliminates fraud by enforcing strict peer accountability and multi-step approvals.
 
  **2. Cryptographic Audit Ledger**
*   On every financial action, the custom `audit-ledger` engine evaluates the transaction data.
*   It securely hashes the event and chains it to the previous ledger entry, eliminating any chance of retroactive tampering.

 **3. Smart Campaign & Allocation Engine**
*   **Fund Partitioning:** Organizers cannot spend raw donations. They must propose an "Allocation" (e.g., "Food Supplies" for 20% of the funds).
*   **Approval Gates:** The Admin must approve both the campaign itself and any proposed allocations before funds become accessible.
*   **Expense Verification:** Organizers upload valid receipts against approved allocations, which are again audited and verified by the Admin.

 **4. Public Dashboard & Reassurance**
*   Contributors can instantly access a real-time dashboard showing Goal vs. Collected, Total Allocated, and Total Utilized metrics.
*   Replaces unreliable periodic PDF reports with an active, live-data loop.

 **5. Ledger Verification API**
*   At any time, anyone can trigger a full ledger verification scan. The system will re-calculate the hashes from the genesis block to the head, proving mathematical integrity.

---

### 4. The Cryptographic Audit Ledger & Data Integrity
During the design phase, we identified a severe vulnerability in traditional databases that compromises platform integrity:

 **Loophole: The Database Tampering Vulnerability (Immutability)**
*   **The Vulnerability**: A rogue database administrator or compromised backend directly executes a SQL `UPDATE` statement to change a $1000 donation into a $100 donation, pocketing the difference. Traditional SQL databases have no built-in mechanism to prevent or mathematically detect this retroactive change.

 **Our Solution (Transparent Fund Ledger's Approach)**:
*   We built an isolated Node.js module (`audit-ledger`) that intercepts all financial state changes before they hit the final UI.
*   Calculates a **SHA-256 Hash**:
    ```text
    Hash = SHA-256 ( PreviousHash + TransactionType + Amount + Timestamp + EntityIDs )
    ```
*   **Result**: If any row in the PostgreSQL database is manually altered, the ledger verification loop will immediately flag the chain as "BROKEN", pinpointing the exact tampered transaction.

---

### 5. The Immutability Engine & Core Flow
Transparent Fund Ledger replaces binary database updates with an empirical, multi-layer cryptographic stack:

```text
[ Contributor Donates ]
          │
          ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 1. Transaction Validation & Normalization                             │
│    • Validate payment amounts, references, and campaigns              │
└────────────────────────────────┬──────────────────────────────────────┘
                                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 2. State & Integrity Pre-Check                                        │
│    • Fetch current ledger HEAD                                        │
│    • Verify chain integrity hasn't been compromised                   │
└────────────────────────────────┬──────────────────────────────────────┘
                                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 3. Cryptographic Hash Generation (audit-ledger)                       │
│    • Generate new block with previous hash linkage                    │
│    • Seal the transaction with a timestamp                            │
└────────────────────────────────┬──────────────────────────────────────┘
                                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 4. Atomic Database Commit                                             │
│    • Write to `donations` table and `ledger_entries` table atomically │
└───────────────────────────────────────────────────────────────────────┘
```

---

### 6. Complete Tech Stack: What We Use to Do What
| Layer | Technology | Exact Responsibility |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js / Vite / Vanilla CSS** | Interactive campaign cards, live dashboard metrics, role-specific layouts, and real-time ledger verification feedback. |
| **Backend Runtime** | **Node.js / Express.js 5** | REST API service, request middleware, Multer file uploads, JWT security, and orchestrating the database. |
| **Database** | **PostgreSQL (pg driver)** | Relational tables storing user profiles, campaigns, donations, and the serialized ledger chain. |
| **Core Logic** | **Custom `audit-ledger` Module** | Isolated Node.js package providing the mathematical hashing and chain verification algorithms. |
| **Authentication** | **JWT & Bcrypt.js** | Secure session management, password hashing, and role extraction (`optionalAuthenticate` middleware). |
| **Validation** | **Zod** | Schema-constrained JSON payload extraction to prevent bad data or injection attacks. |
| **Infrastructure** | **Docker & Docker Compose** | One-click database spin-up and initialization scripts for seamless onboarding. |

---

### 7. System Architecture & Data Flow
(Refer to the Immutability Engine diagram in Section 5 for the core data flow)

---

### 8. Project Boundaries & Scope

**In-Scope (Delivered in MVP)**
*    Role-based authentication & route protection (Admin, Organizer, Contributor).
*    Full campaign lifecycle management (Draft, Pending Approval, Active, Closed).
*    Two-step fund usage pipeline (Propose Allocation ➔ Submit Expense).
*    Fully functional, append-only cryptographic ledger (`audit-ledger`).
*    Live public dashboards calculating real-time percent funded and unspent funds.
*    Dockerized PostgreSQL environment with auto-seeding.

**Out-of-Scope (Future Production Roadmap)**
*    **Payment Gateway Integration**: Integrating Stripe or Razorpay for real fiat processing instead of simulated transactions.
*    **Smart Contracts**: Porting the `audit-ledger` to an actual Ethereum or Polygon smart contract for decentralized consensus.
*    **Automated OCR for Receipts**: Using AI vision models to automatically extract vendor and amount data from uploaded expense receipts.

---

### 9. Local Setup & Testing Guide

#### Prerequisites
*   Node.js (v18+ or v20+)
*   Docker & Docker Compose (Recommended for Database)
*   PostgreSQL v16+ (If running manually)

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/transparent-fund-ledger.git
cd transparent-fund-ledger

# Install ledger dependencies
cd audit-ledger && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```env
PORT=5000
DATABASE_URL=postgres://fund_admin:fund_password@localhost:5432/transparent_fund
JWT_SECRET=your_super_secret_jwt_key
```

#### 3. Database Setup
**Using Docker (Recommended):**
```bash
docker-compose up -d
```
*This spins up Postgres, creates the database, and runs the schema/seed files automatically.*

#### 4. Seed Demo Accounts
```bash
cd backend
npm run seed:demo
```
**Demo Accounts available:**
*   **Admin**: `admin.test@transparentfund.local` / `Admin@123`
*   **Organizer**: `organizer@example.com` / `password123`
*   **Contributor**: `bhavish@example.com` / `password123`

#### 5. Start the Application
**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
Server runs at `http://localhost:5000`. Frontend runs at `http://localhost:5173`.

-----

                                            Team Marvel
                            Sathvik.V.Shetty- Audit-Ledger, Hashing , Testing , Integration 
                            Bhavish.Rai- Core-Backend , Integration, Testing , Github Integration
                            Srijan.A.R - Database-Management

