const selectFields = `
  id,
  campaign_id,
  proposed_by,
  purpose,
  description,
  amount,
  status,
  rejection_note,
  created_at,
  approved_at
`;

function mapAllocationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    campaignId: row.campaign_id,
    proposedBy: row.proposed_by,
    purpose: row.purpose,
    description: row.description,
    amount: row.amount,
    status: row.status,
    rejectionNote: row.rejection_note,
    createdAt: row.created_at,
    approvedAt: row.approved_at
  };
}

async function findById(db, id) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM allocations
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapAllocationRow(result.rows[0]);
}

async function findByCampaign(db, campaignId) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM allocations
      WHERE campaign_id = $1
      ORDER BY created_at DESC
    `,
    [campaignId]
  );

  return result.rows.map(mapAllocationRow);
}

async function findPending(db) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM allocations
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
    `
  );

  return result.rows.map(mapAllocationRow);
}

async function create(
  db,
  {
    campaignId,
    proposedBy,
    purpose,
    description,
    amount
  }
) {
  const result = await db.query(
    `
      INSERT INTO allocations (
        campaign_id,
        proposed_by,
        purpose,
        description,
        amount,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING ${selectFields}
    `,
    [
      campaignId,
      proposedBy,
      purpose,
      description || null,
      amount
    ]
  );

  return mapAllocationRow(result.rows[0]);
}

async function approve(db, id) {
  const result = await db.query(
    `
      UPDATE allocations
      SET
        status = 'APPROVED',
        rejection_note = NULL,
        approved_at = NOW()
      WHERE id = $1
      RETURNING ${selectFields}
    `,
    [id]
  );

  return mapAllocationRow(result.rows[0]);
}

async function reject(db, id, reason) {
  const result = await db.query(
    `
      UPDATE allocations
      SET
        status = 'REJECTED',
        rejection_note = $1
      WHERE id = $2
      RETURNING ${selectFields}
    `,
    [reason, id]
  );

  return mapAllocationRow(result.rows[0]);
}

async function getConfirmedDonationTotal(db, campaignId) {
  const result = await db.query(
    `
      SELECT COALESCE(
        SUM(amount),
        0
      )::numeric(12,2) AS total
      FROM donations
      WHERE campaign_id = $1
        AND status = 'CONFIRMED'
    `,
    [campaignId]
  );

  return result.rows[0].total;
}

async function getApprovedAllocationTotal(db, campaignId) {
  const result = await db.query(
    `
      SELECT COALESCE(
        SUM(amount),
        0
      )::numeric(12,2) AS total
      FROM allocations
      WHERE campaign_id = $1
        AND status = 'APPROVED'
    `,
    [campaignId]
  );

  return result.rows[0].total;
}

module.exports = {
  findById,
  findByCampaign,
  findPending,
  create,
  approve,
  reject,
  getConfirmedDonationTotal,
  getApprovedAllocationTotal
};