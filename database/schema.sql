 
-- ============================================================
-- TRANSPARENT FUND LEDGER
-- Database Schema v1
-- Owner: Member 3
-- PostgreSQL 16
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('CONTRIBUTOR', 'ORGANIZER', 'ADMIN')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CAMPAIGNS
-- ============================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organizer_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(100) NOT NULL,

    goal_amount NUMERIC(12,2) NOT NULL
        CHECK (goal_amount > 0),

    start_date DATE,

    end_date DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_APPROVAL',
                'ACTIVE',
                'REJECTED',
                'CLOSED'
            )
        ),

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        end_date IS NULL
        OR start_date IS NULL
        OR end_date >= start_date
    )
);


-- ============================================================
-- DONATIONS
-- ============================================================

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    campaign_id UUID NOT NULL
        REFERENCES campaigns(id)
        ON DELETE RESTRICT,

    donor_id UUID
        REFERENCES users(id)
        ON DELETE RESTRICT,

    donor_name VARCHAR(120),

    donor_email VARCHAR(255),

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,

    payment_ref VARCHAR(255) UNIQUE,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'CONFIRMED',
                'FAILED'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    confirmed_at TIMESTAMPTZ
);


-- ============================================================
-- ALLOCATIONS
-- ============================================================

CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    campaign_id UUID NOT NULL
        REFERENCES campaigns(id)
        ON DELETE RESTRICT,

    proposed_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    purpose VARCHAR(200) NOT NULL,

    description TEXT,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED'
            )
        ),

    rejection_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    approved_at TIMESTAMPTZ
);


-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    allocation_id UUID NOT NULL
        REFERENCES allocations(id)
        ON DELETE RESTRICT,

    submitted_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    vendor VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    spent_at DATE NOT NULL,

    receipt_path TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        ),

    rejection_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    verified_at TIMESTAMPTZ
);


-- ============================================================
-- LEDGER ENTRIES
-- ============================================================

CREATE TABLE ledger_entries (
    entry_index BIGINT PRIMARY KEY,

    type VARCHAR(50) NOT NULL,

    campaign_id UUID
        REFERENCES campaigns(id)
        ON DELETE RESTRICT,

    ref_type VARCHAR(50),

    ref_id UUID,

    amount NUMERIC(12,2),

    payload JSONB NOT NULL DEFAULT '{}'::jsonb,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    prev_hash TEXT,

    hash TEXT NOT NULL UNIQUE
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_campaigns_status
    ON campaigns(status);

CREATE INDEX idx_campaigns_organizer
    ON campaigns(organizer_id);

CREATE INDEX idx_donations_campaign_status
    ON donations(campaign_id, status);

CREATE INDEX idx_donations_donor
    ON donations(donor_id);

CREATE INDEX idx_allocations_campaign_status
    ON allocations(campaign_id, status);

CREATE INDEX idx_expenses_allocation_status
    ON expenses(allocation_id, status);

CREATE INDEX idx_expenses_status
    ON expenses(status);

CREATE INDEX idx_ledger_campaign
    ON ledger_entries(campaign_id);

CREATE INDEX idx_ledger_type
    ON ledger_entries(type);

CREATE INDEX idx_ledger_timestamp
    ON ledger_entries(timestamp);
    -- ============================================================
-- DASHBOARD VIEWS
-- ============================================================


-- ============================================================
-- CAMPAIGN FUND SUMMARY
-- ============================================================
-- One row per campaign.
--
-- collected  = confirmed donations
-- allocated  = approved allocations
-- utilized   = verified expenses
-- unallocated = collected - allocated
-- unspent    = allocated - utilized
-- ============================================================

CREATE OR REPLACE VIEW campaign_fund_summary AS
SELECT
    c.id AS campaign_id,
    c.goal_amount AS goal,

    COALESCE(
        (
            SELECT SUM(d.amount)
            FROM donations d
            WHERE d.campaign_id = c.id
              AND d.status = 'CONFIRMED'
        ),
        0
    )::NUMERIC(12,2) AS collected,

    COALESCE(
        (
            SELECT SUM(a.amount)
            FROM allocations a
            WHERE a.campaign_id = c.id
              AND a.status = 'APPROVED'
        ),
        0
    )::NUMERIC(12,2) AS allocated,

    COALESCE(
        (
            SELECT SUM(e.amount)
            FROM expenses e
            JOIN allocations a
                ON a.id = e.allocation_id
            WHERE a.campaign_id = c.id
              AND e.status = 'VERIFIED'
        ),
        0
    )::NUMERIC(12,2) AS utilized,

    (
        COALESCE(
            (
                SELECT SUM(d.amount)
                FROM donations d
                WHERE d.campaign_id = c.id
                  AND d.status = 'CONFIRMED'
            ),
            0
        )
        -
        COALESCE(
            (
                SELECT SUM(a.amount)
                FROM allocations a
                WHERE a.campaign_id = c.id
                  AND a.status = 'APPROVED'
            ),
            0
        )
    )::NUMERIC(12,2) AS unallocated,

    (
        COALESCE(
            (
                SELECT SUM(a.amount)
                FROM allocations a
                WHERE a.campaign_id = c.id
                  AND a.status = 'APPROVED'
            ),
            0
        )
        -
        COALESCE(
            (
                SELECT SUM(e.amount)
                FROM expenses e
                JOIN allocations a
                    ON a.id = e.allocation_id
                WHERE a.campaign_id = c.id
                  AND e.status = 'VERIFIED'
            ),
            0
        )
    )::NUMERIC(12,2) AS unspent,

    CASE
        WHEN c.goal_amount > 0 THEN
            ROUND(
                (
                    COALESCE(
                        (
                            SELECT SUM(d.amount)
                            FROM donations d
                            WHERE d.campaign_id = c.id
                              AND d.status = 'CONFIRMED'
                        ),
                        0
                    ) / c.goal_amount
                ) * 100,
                2
            )
        ELSE 0
    END AS percent_funded

FROM campaigns c;


-- ============================================================
-- CAMPAIGN PURPOSE SUMMARY
-- ============================================================
-- Used for:
-- "₹20,000 for Lab Equipment"
-- "₹10,000 for Food"
-- etc.
-- ============================================================
CREATE OR REPLACE VIEW campaign_purpose_summary AS
WITH approved_allocations AS (
    SELECT
        campaign_id,
        purpose,
        SUM(amount) AS allocated
    FROM allocations
    WHERE status = 'APPROVED'
    GROUP BY campaign_id, purpose
),
verified_expenses AS (
    SELECT
        a.campaign_id,
        a.purpose,
        SUM(e.amount) AS utilized
    FROM expenses e
    JOIN allocations a
        ON a.id = e.allocation_id
    WHERE e.status = 'VERIFIED'
    GROUP BY a.campaign_id, a.purpose
)
SELECT
    aa.campaign_id,
    aa.purpose,
    aa.allocated,
    COALESCE(ve.utilized, 0) AS utilized
FROM approved_allocations aa
LEFT JOIN verified_expenses ve
    ON ve.campaign_id = aa.campaign_id
    AND ve.purpose = aa.purpose;


-- ============================================================
-- CAMPAIGN DAILY TIMELINE
-- ============================================================
-- Combines confirmed donations and verified expenses by day.
-- Used by the frontend timeline chart.
-- ============================================================

CREATE OR REPLACE VIEW campaign_daily_timeline AS

WITH donation_days AS (
    SELECT
        campaign_id,
        DATE(confirmed_at) AS day,
        SUM(amount) AS collected
    FROM donations
    WHERE status = 'CONFIRMED'
      AND confirmed_at IS NOT NULL
    GROUP BY
        campaign_id,
        DATE(confirmed_at)
),

expense_days AS (
    SELECT
        a.campaign_id,
        DATE(e.verified_at) AS day,
        SUM(e.amount) AS utilized
    FROM expenses e
    JOIN allocations a
        ON a.id = e.allocation_id
    WHERE e.status = 'VERIFIED'
      AND e.verified_at IS NOT NULL
    GROUP BY
        a.campaign_id,
        DATE(e.verified_at)
)

SELECT
    COALESCE(d.campaign_id, e.campaign_id) AS campaign_id,

    COALESCE(d.day, e.day) AS day,

    COALESCE(d.collected, 0)::NUMERIC(12,2) AS collected,

    COALESCE(e.utilized, 0)::NUMERIC(12,2) AS utilized

FROM donation_days d

FULL OUTER JOIN expense_days e
    ON d.campaign_id = e.campaign_id
   AND d.day = e.day;


-- ============================================================
-- PLATFORM SUMMARY
-- ============================================================
-- Used by:
-- GET /api/dashboard/summary
-- ============================================================

CREATE OR REPLACE VIEW platform_summary AS
SELECT

    (
        SELECT COUNT(*)
        FROM campaigns
    ) AS total_campaigns,

    (
        SELECT COUNT(*)
        FROM campaigns
        WHERE status = 'ACTIVE'
    ) AS active_campaigns,

    (
        SELECT COUNT(DISTINCT donor_id)
        FROM donations
        WHERE status = 'CONFIRMED'
          AND donor_id IS NOT NULL
    ) AS total_donors,

    (
        SELECT COALESCE(SUM(amount), 0)
        FROM donations
        WHERE status = 'CONFIRMED'
    )::NUMERIC(12,2) AS collected,

    (
        SELECT COALESCE(SUM(amount), 0)
        FROM allocations
        WHERE status = 'APPROVED'
    )::NUMERIC(12,2) AS allocated,

    (
        SELECT COALESCE(SUM(e.amount), 0)
        FROM expenses e
        WHERE e.status = 'VERIFIED'
    )::NUMERIC(12,2) AS utilized;
    -- ============================================================
-- LEDGER IMMUTABILITY
-- ============================================================
-- Ledger entries are append-only.
--
-- UPDATE  → blocked
-- DELETE  → blocked
-- TRUNCATE → blocked
--
-- INSERT is allowed because the ledger must be append-only.
-- ============================================================


-- ------------------------------------------------------------
-- Function: prevent UPDATE / DELETE
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'ledger_entries is append-only: UPDATE and DELETE are not allowed';

    RETURN NULL;
END;
$$;


-- ------------------------------------------------------------
-- Trigger: prevent UPDATE / DELETE
-- ------------------------------------------------------------

CREATE TRIGGER ledger_no_update_delete
BEFORE UPDATE OR DELETE
ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_modification();


-- ------------------------------------------------------------
-- Function: prevent TRUNCATE
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION prevent_ledger_truncate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'ledger_entries is append-only: TRUNCATE is not allowed';

    RETURN NULL;
END;
$$;


-- ------------------------------------------------------------
-- Trigger: prevent TRUNCATE
-- ------------------------------------------------------------

CREATE TRIGGER ledger_no_truncate
BEFORE TRUNCATE
ON ledger_entries
FOR EACH STATEMENT
EXECUTE FUNCTION prevent_ledger_truncate();