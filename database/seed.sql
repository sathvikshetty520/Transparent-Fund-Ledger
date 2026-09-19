 
-- ============================================================
-- TRANSPARENT FUND LEDGER
-- Foundational Seed Data
-- Owner: Member 3
-- ============================================================
--
-- This file contains only foundational users.
--
-- Do NOT insert donations, allocations, expenses, or ledger
-- entries here. Those lifecycle records must be created through
-- the backend transaction flow so the corresponding ledger entry
-- is created atomically.
-- ============================================================


-- ============================================================
-- DEMO USERS
-- ============================================================

INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role
)
VALUES

(
    '00000000-0000-0000-0000-000000000001',
    'Demo Admin',
    'admin@transparentfund.local',
    '$2b$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'ADMIN'
),

(
    '00000000-0000-0000-0000-000000000002',
    'Demo Organizer',
    'organizer@transparentfund.local',
    '$2b$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'ORGANIZER'
),

(
    '00000000-0000-0000-0000-000000000003',
    'Demo Contributor One',
    'contributor1@transparentfund.local',
    '$2b$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'CONTRIBUTOR'
),

(
    '00000000-0000-0000-0000-000000000004',
    'Demo Contributor Two',
    'contributor2@transparentfund.local',
    '$2b$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'CONTRIBUTOR'
)

ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- END OF FOUNDATIONAL SEED
-- ============================================================