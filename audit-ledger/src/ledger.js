 // audit-ledger/src/ledger.js

const { computeEntryHash, GENESIS_HASH } = require('./hash');
const { LEDGER_TYPES } = require('./types');

/**
 * Appends a new entry to the tamper-evident ledger inside an active database transaction.
 * @param {Object} client - PostgreSQL transaction client (pg.Client or pg.PoolClient)
 * @param {Object} input - { type, campaignId, refType, refId, amount, payload }
 */
async function appendEntry(client, input) {
  // 1. Serialize appends using PostgreSQL transaction advisory lock
  await client.query('SELECT pg_advisory_xact_lock(42)');

  // 2. Fetch current head entry to compute prevHash and next index
  const lastRes = await client.query(
    'SELECT entry_index, hash FROM ledger_entries ORDER BY entry_index DESC LIMIT 1'
  );
  
  const lastEntry = lastRes.rows[0];
  const index = lastEntry ? Number(lastEntry.entry_index) + 1 : 1;
  const prevHash = lastEntry ? lastEntry.hash : GENESIS_HASH;
  const timestamp = new Date().toISOString();

  // 3. Construct entry payload and recompute SHA-256 hash
  const entryData = {
    index,
    type: input.type,
    campaignId: input.campaignId,
    refType: input.refType,
    refId: input.refId,
    amount: input.amount || null,
    payload: input.payload || {},
    timestamp,
    prevHash
  };

  const hash = computeEntryHash(entryData);

  // 4. Insert into database
  const insertQuery = `
    INSERT INTO ledger_entries 
      (entry_index, type, campaign_id, ref_type, ref_id, amount, payload, timestamp, prev_hash, hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
      entry_index AS "index",
      type,
      campaign_id AS "campaignId",
      ref_type AS "refType",
      ref_id AS "refId",
      amount,
      payload,
      timestamp,
      prev_hash AS "prevHash",
      hash;
  `;

  const values = [
    index,
    input.type,
    input.campaignId,
    input.refType,
    input.refId,
    input.amount || null,
    JSON.stringify(input.payload || {}),
    timestamp,
    prevHash,
    hash
  ];

  const result = await client.query(insertQuery, values);
  return result.rows[0];
}

module.exports = { appendEntry };
