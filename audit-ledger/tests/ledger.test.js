const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const { Pool } = require('pg');
const { appendEntry } = require('../src/ledger');
const { EVENT_TYPES } = require('../src/types');
const { GENESIS_HASH } = require('../src/hash');

const connectionString =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://fund_admin:fund_password@localhost:5432/transparent_fund';

const ORGANIZER_ID = '00000000-0000-0000-0000-0000000000a1';
const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';

describe('audit-ledger: appendEntry', () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString });
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ($1, 'Ledger Test', 'ledger-test@example.com', 'x', 'ORGANIZER')
       ON CONFLICT DO NOTHING`,
      [ORGANIZER_ID]
    );
    await pool.query(
      `INSERT INTO campaigns (id, title, description, category, goal_amount, organizer_id)
       VALUES ($1, 'Ledger Test', 'Fixture', 'Test', 1000, $2)
       ON CONFLICT DO NOTHING`,
      [CAMPAIGN_ID, ORGANIZER_ID]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Bypass Member 3's append-only trigger for clean test runs
    await pool.query("SET session_replication_role = 'replica'");
    await pool.query('TRUNCATE TABLE ledger_entries CASCADE');
    await pool.query("SET session_replication_role = 'origin'");
  });

  test('1. Consecutive indexing (1, 2, 3...) and correct prevHash chaining', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const entry1 = await appendEntry(client, {
        type: EVENT_TYPES.CAMPAIGN_APPROVED || 'CAMPAIGN_APPROVED',
        campaignId: CAMPAIGN_ID,
        refType: 'Campaign',
        refId: CAMPAIGN_ID,
        payload: { title: 'Test Campaign' }
      });
      await client.query('COMMIT');

      expect(Number(entry1.index)).toBe(1);
      expect(entry1.prevHash).toBe(GENESIS_HASH);

      await client.query('BEGIN');
      const entry2 = await appendEntry(client, {
        type: EVENT_TYPES.DONATION_CONFIRMED || 'DONATION_CONFIRMED',
        campaignId: CAMPAIGN_ID,
        refType: 'Donation',
        refId: '00000000-0000-0000-0000-000000000002',
        payload: { amount: 100 }
      });
      await client.query('COMMIT');

      expect(Number(entry2.index)).toBe(2);
      expect(entry2.prevHash).toBe(entry1.hash);
    } finally {
      client.release();
    }
  });

  test('2. Proper transaction rollback handling (no index gaps on thrown errors)', async () => {
    const client1 = await pool.connect();
    try {
      await client1.query('BEGIN');
      await appendEntry(client1, {
        type: EVENT_TYPES.CAMPAIGN_APPROVED || 'CAMPAIGN_APPROVED',
        campaignId: CAMPAIGN_ID,
        refType: 'Campaign',
        refId: CAMPAIGN_ID,
        payload: { test: 'rollback' }
      });
      await client1.query('ROLLBACK');
    } finally {
      client1.release();
    }

    const client2 = await pool.connect();
    try {
      await client2.query('BEGIN');
      const entry = await appendEntry(client2, {
        type: EVENT_TYPES.CAMPAIGN_APPROVED || 'CAMPAIGN_APPROVED',
        campaignId: CAMPAIGN_ID,
        refType: 'Campaign',
        refId: CAMPAIGN_ID,
        payload: { test: 'after_rollback' }
      });
      await client2.query('COMMIT');

      expect(Number(entry.index)).toBe(1);
      expect(entry.prevHash).toBe(GENESIS_HASH);
    } finally {
      client2.release();
    }
  });

  test('3. High concurrency locking (20 parallel appends)', async () => {
    const count = 20;
    const appends = Array.from({ length: count }, (_, i) => async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const entry = await appendEntry(client, {
          type: EVENT_TYPES.DONATION_CONFIRMED || 'DONATION_CONFIRMED',
          campaignId: CAMPAIGN_ID,
          refType: 'Donation',
          refId: `00000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`,
          payload: { seq: i }
        });
        await client.query('COMMIT');
        return entry;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });

    const results = await Promise.all(appends.map(fn => fn()));
    expect(results).toHaveLength(count);

    const indices = results.map(r => Number(r.index)).sort((a, b) => a - b);
    expect(indices).toEqual(Array.from({ length: count }, (_, i) => i + 1));
  });
});