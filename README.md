# Transparent Fund Ledger

Transparent Fund Ledger is a full-stack application designed to bring complete transparency to fund management, donations, and expenses. It features a cryptographic, append-only ledger that guarantees the immutability of every financial transaction (donations, allocations, and expenses).

##  Features

*   **Role-Based Access Control**:
    *   **Admin**: Approves campaigns and verifies expense receipts.
    *   **Organizer**: Creates campaigns, proposes fund allocations, and submits expense receipts.
    *   **Contributor**: Browses campaigns, makes donations, and views their donation history and receipts.
*   **Cryptographic Audit Ledger**: An append-only hash-chained ledger system that tracks every financial event, ensuring absolute transparency and integrity of funds.
*   **Campaign Management**: Create campaigns, track funding goals, and manage the lifecycle from draft to closed.
*   **Donation & Expense Tracking**: End-to-end tracking of where every rupee comes from and where it is spent.
*   **Public Dashboard & Verification**: Publicly accessible dashboards and a ledger verification tool to mathematically prove the integrity of the database.

## Tech Stack

*   **Frontend**: React 18, Vite, React Router DOM, Custom Vanilla CSS.
*   **Backend**: Node.js, Express.js, PostgreSQL (with `pg` driver), Zod (Validation), JWT (Authentication), Multer (File Uploads).
*   **Core Logic**: A custom `audit-ledger` Node.js package providing the cryptographic immutability layer.

## Project Structure

*   `/frontend` - React application providing the UI for all roles and public dashboards.
*   `/backend` - Express API serving the frontend, handling business logic and file uploads.
*   `/audit-ledger` - An isolated, local Node.js module that securely manages the append-only ledger chain.
*   `/database` - PostgreSQL schema definitions, initialization scripts, and seed files.
*   `/docs` - Technical documentation detailing the API, architecture, and demo flows.
*   `/team` - Individual role responsibilities and documentation.

##  Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   PostgreSQL (v16+)

### 1. Database Setup (Docker Recommended)
The easiest way to set up the database is using Docker. We have provided a `docker-compose.yml` file that will spin up PostgreSQL and automatically run the schema and seed scripts for you.

Simply run:
```bash
docker-compose up -d
```
*Note: This will create a database named `transparent_fund` with user `fund_admin` and password `fund_password` on port `5432`.*

**Manual Setup (without Docker):**
If you prefer not to use Docker, ensure PostgreSQL is running and you have created a database. Navigate to the `database` folder and run the initialization scripts:
```bash
cd database
psql -U postgres -d transparent_fund -f schema.sql
psql -U postgres -d transparent_fund -f seed.sql
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root folder (or inside the `/backend` folder) and update the values:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/transparent_fund
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Install Dependencies
You need to install dependencies for the local `audit-ledger` package, the `backend`, and the `frontend`.
```bash
# Install ledger dependencies
cd audit-ledger
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Seed Demo Accounts
To easily test the platform, seed the demo accounts using the backend utility:
```bash
cd backend
npm run seed:demo
```

### 5. Run the Application
Start both the backend and frontend development servers.

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

The frontend will typically be accessible at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Demo Accounts

If you ran the `seed:demo` script, you can log in with the following accounts to test different roles:

*   **Admin**: `admin.test@transparentfund.local` / `Admin@123`
*   **Organizer**: `organizer@example.com` / `password123`
*   **Contributor**: `bhavish@example.com` / `password123`


