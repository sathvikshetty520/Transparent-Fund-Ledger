const { Pool } = require('pg');
const { appendEntry } = require('../src/ledger');
const { LEDGER_TYPES } = require('../src/types');
const { GENESIS_HASH } = require('../src/hash');

describe('audit-ledger: appendEntry', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transparent_ledger'
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clean ledger entries before each test
    await pool.query('TRUNCATE TABLE ledger_entries CASCADE');
  });

  test('1. Consecutive indexing (1, 2, 3...) and correct prevHash chaining', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const entry1 = await appendEntry(client, {
        type: LEDGER_TYPES.CAMPAIGN_APPROVED,
        campaignId: '11111111-1111-1111-1111-111111111111',
        refType: 'Campaign',
        refId: '11111111-1111-1111-1111-111111111111',
        amount: null,
        payload: { name: 'Test Campaign' }
      });

      expect(Number(entry1.index)).toBe(1);
      expect(entry1.prevHash).toBe(GENESIS_HASH);

      const entry2 = await appendEntry(client, {
        type: LEDGER_TYPES.DONATION_CONFIRMED,
        campaignId: '11111111-1111-1111-1111-111111111111',
        refType: 'Donation',
        refId: '22222222-2222-2222-2222-222222222222',
        amount: '100.00',
        payload: { donorDisplay: 'Anonymous' }
      });

      expect(Number(entry2.index)).toBe(2);
      expect(entry2.prevHash).toBe(entry1.hash);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  test('2. Proper transaction rollback handling (no index gaps on thrown errors)', async () => {
    const client1 = await pool.connect();
    try {
      await client1.query('BEGIN');
      await appendEntry(client1, {
        type: LEDGER_TYPES.CAMPAIGN_APPROVED,
        campaignId: '11111111-1111-1111-1111-111111111111',
        refType: 'Campaign',
        refId: '11111111-1111-1111-1111-111111111111',
        amount: null,
        payload: {}
      });
      await client1.query('COMMIT');
    } finally {
      client1.release();
    }

    // Rolled back transaction
    const client2 = await pool.connect();
    try {
      await client2.query('BEGIN');
      await appendEntry(client2, {
        type: LEDGER_TYPES.DONATION_CONFIRMED,
        campaignId: '11111111-1111-1111-1111-111111111111',
        refType: 'Donation',
        refId: '22222222-2222-2222-2222-222222222222',
        amount: '50.00',
        payload: {}
      });
      // Simulate failure & rollback
      throw new Error('Simulated failure');
    } catch (err) {
      await client2.query('ROLLBACK');
    } finally {
      client2.release();
    }

    // Next successful transaction should use index 2 (no gap)
    const client3 = await pool.connect();
    try {
      await client3.query('BEGIN');
      const entry3 = await appendEntry(client3, {
        type: LEDGER_TYPES.DONATION_CONFIRMED,
        campaignId: '11111111-1111-1111-1111-111111111111',
        refType: 'Donation',
        refId: '33333333-3333-3333-3333-333333333333',
        amount: '75.00',
        payload: {}
      });

      expect(Number(entry3.index)).toBe(2);
      await client3.query('COMMIT');
    } finally {
      client3.release();
    }
  });

  test('3. High concurrency locking (20 parallel appends)', async () => {
    const promises = Array.from({ length: 20 }, (_, i) => {
      return (async () => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const entry = await appendEntry(client, {
            type: LEDGER_TYPES.DONATION_CONFIRMED,
            campaignId: '11111111-1111-1111-1111-111111111111',
            refType: 'Donation',
            refId: `00000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`,
            amount: '10.00',
            payload: { index: i }
          });
          await client.query('COMMIT');
          return entry;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      })();
    });

    const results = await Promise.all(promises);
    expect(results).toHaveLength(20);

    // Verify all 20 entries are strictly sequential
    const res = await pool.query('SELECT entry_index FROM ledger_entries ORDER BY entry_index ASC');
    const indices = res.rows.map(r => Number(r.entry_index));
    const expected = Array.from({ length: 20 }, (_, i) => i + 1);

    expect(indices).toEqual(expected);
  });
});
