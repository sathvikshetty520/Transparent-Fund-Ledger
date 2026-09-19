const { verifyChain, reconcileCampaign } = require('../../../audit-ledger/src/verifier');

/**
 * Service wrapper for Audit Ledger read and verification operations.
 */
class LedgerService {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async getEntries({ page = 1, limit = 20, type, campaignId }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (campaignId) {
      params.push(campaignId);
      conditions.push(`campaign_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM ledger_entries ${whereClause}`;
    const dataQuery = `
      SELECT 
        entry_index AS "index", 
        type, 
        campaign_id AS "campaignId", 
        ref_type AS "refType", 
        ref_id AS "refId", 
        amount, 
        payload, 
        timestamp, 
        prev_hash AS "prevHash", 
        hash 
      FROM ledger_entries 
      ${whereClause} 
      ORDER BY entry_index DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countRes = await this.pool.query(countQuery, params);
    const dataRes = await this.pool.query(dataQuery, [...params, limit, offset]);

    const total = parseInt(countRes.rows[0].count, 10);

    return {
      entries: dataRes.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getHead() {
    const res = await this.pool.query(
      `SELECT entry_index AS "index", hash, timestamp 
       FROM ledger_entries 
       ORDER BY entry_index DESC 
       LIMIT 1`
    );
    return res.rows[0] || null;
  }

  async getEntryByIndex(index) {
    const res = await this.pool.query(
      `SELECT entry_index AS "index", type, campaign_id AS "campaignId", ref_type AS "refType", ref_id AS "refId", amount, payload, timestamp, prev_hash AS "prevHash", hash 
       FROM ledger_entries 
       WHERE entry_index = $1`,
      [index]
    );
    return res.rows[0] || null;
  }

  async verifyIntegrity() {
    return await verifyChain(this.pool);
  }

  async reconcile(campaignId) {
    return await reconcileCampaign(this.pool, campaignId);
  }
}

module.exports = LedgerService;