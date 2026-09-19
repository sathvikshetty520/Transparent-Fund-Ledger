const { computeEntryHash, GENESIS_HASH } = require('./hash');

/**
 * Validates contiguous indexing, prevHash links, and recomputed SHA-256 hashes across all entries.
 * @param {Object} db - PostgreSQL client/pool
 */
async function verifyChain(db) {
  const res = await db.query(
    'SELECT entry_index AS "index", type, campaign_id AS "campaignId", ref_type AS "refType", ref_id AS "refId", amount, payload, timestamp, prev_hash AS "prevHash", hash FROM ledger_entries ORDER BY entry_index ASC'
  );

  const entries = res.rows;
  let prevHash = GENESIS_HASH;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedIndex = i + 1;

    // 1. Index continuity check
    if (Number(entry.index) !== expectedIndex) {
      return {
        valid: false,
        brokenIndex: Number(entry.index),
        reason: `Index gap/mismatch. Expected ${expectedIndex}, got ${entry.index}`
      };
    }

    // 2. Hash chaining check
    if (entry.prevHash !== prevHash) {
      return {
        valid: false,
        brokenIndex: Number(entry.index),
        reason: `PrevHash mismatch at index ${entry.index}`
      };
    }

    // 3. Hash computation check
    const recomputed = computeEntryHash({
      index: entry.index,
      type: entry.type,
      campaignId: entry.campaignId,
      refType: entry.refType,
      refId: entry.refId,
      amount: entry.amount,
      payload: entry.payload,
      timestamp: new Date(entry.timestamp).toISOString(),
      prevHash: entry.prevHash
    });

    if (recomputed !== entry.hash) {
      return {
        valid: false,
        brokenIndex: Number(entry.index),
        reason: `Data tampering detected at index ${entry.index}. Expected ${recomputed}, got ${entry.hash}`
      };
    }

    prevHash = entry.hash;
  }

  return {
    valid: true,
    totalEntries: entries.length,
    headHash: prevHash
  };
}

/**
 * Cross-checks ledger entries for a specific campaign against app database tables.
 */
async function reconcileCampaign(db, campaignId) {
  const ledgerRes = await db.query(
    `SELECT type, amount FROM ledger_entries WHERE campaign_id = $1`,
    [campaignId]
  );

  let totalLedgerDonations = 0;
  let totalLedgerExpenses = 0;

  for (const row of ledgerRes.rows) {
    const amt = parseFloat(row.amount || 0);
    if (row.type === 'DONATION_CONFIRMED') totalLedgerDonations += amt;
    if (row.type === 'EXPENSE_LOGGED') totalLedgerExpenses += amt;
  }

  const donRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE campaign_id = $1 AND status = 'CONFIRMED'`,
    [campaignId]
  );
  const expRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE campaign_id = $1 AND status = 'APPROVED'`,
    [campaignId]
  );

  const totalAppDonations = parseFloat(donRes.rows[0].total);
  const totalAppExpenses = parseFloat(expRes.rows[0].total);

  const matched =
    totalLedgerDonations === totalAppDonations &&
    totalLedgerExpenses === totalAppExpenses;

  return {
    matched,
    campaignId,
    ledger: { donations: totalLedgerDonations, expenses: totalLedgerExpenses },
    app: { donations: totalAppDonations, expenses: totalAppExpenses }
  };
}

module.exports = {
  verifyChain,
  reconcileCampaign
};