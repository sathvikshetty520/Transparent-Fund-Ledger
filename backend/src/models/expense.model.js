const selectFields = `
  id,
  allocation_id,
  submitted_by,
  amount,
  vendor,
  description,
  spent_at,
  receipt_path,
  status,
  rejection_note,
  created_at,
  verified_at
`;

function mapExpenseRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    allocationId: row.allocation_id,
    submittedBy: row.submitted_by,
    amount: row.amount,
    vendor: row.vendor,
    description: row.description,
    spentAt: row.spent_at,
    receiptPath: row.receipt_path,
    status: row.status,
    rejectionNote: row.rejection_note,
    createdAt: row.created_at,
    verifiedAt: row.verified_at
  };
}

async function findById(db, id) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM expenses
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapExpenseRow(result.rows[0]);
}

async function findByAllocation(db, allocationId) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM expenses
      WHERE allocation_id = $1
      ORDER BY created_at DESC
    `,
    [allocationId]
  );

  return result.rows.map(mapExpenseRow);
}

async function findByCampaign(db, campaignId) {
  const result = await db.query(
    `
      SELECT
        e.id,
        e.allocation_id,
        e.submitted_by,
        e.amount,
        e.vendor,
        e.description,
        e.spent_at,
        e.receipt_path,
        e.status,
        e.rejection_note,
        e.created_at,
        e.verified_at
      FROM expenses e
      INNER JOIN allocations a
        ON a.id = e.allocation_id
      WHERE a.campaign_id = $1
      ORDER BY e.created_at DESC
    `,
    [campaignId]
  );

  return result.rows.map(mapExpenseRow);
}

async function findPending(db) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM expenses
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
    `
  );

  return result.rows.map(mapExpenseRow);
}

async function create(
  db,
  {
    allocationId,
    submittedBy,
    amount,
    vendor,
    description,
    spentAt,
    receiptPath
  }
) {
  const result = await db.query(
    `
      INSERT INTO expenses (
        allocation_id,
        submitted_by,
        amount,
        vendor,
        description,
        spent_at,
        receipt_path,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'PENDING'
      )
      RETURNING ${selectFields}
    `,
    [
      allocationId,
      submittedBy,
      amount,
      vendor,
      description,
      spentAt,
      receiptPath
    ]
  );

  return mapExpenseRow(result.rows[0]);
}

async function verify(db, id) {
  const result = await db.query(
    `
      UPDATE expenses
      SET
        status = 'VERIFIED',
        rejection_note = NULL,
        verified_at = NOW()
      WHERE id = $1
      RETURNING ${selectFields}
    `,
    [id]
  );

  return mapExpenseRow(result.rows[0]);
}

async function reject(db, id, reason) {
  const result = await db.query(
    `
      UPDATE expenses
      SET
        status = 'REJECTED',
        rejection_note = $1
      WHERE id = $2
      RETURNING ${selectFields}
    `,
    [reason, id]
  );

  return mapExpenseRow(result.rows[0]);
}

async function getVerifiedExpenseTotal(db, allocationId) {
  const result = await db.query(
    `
      SELECT COALESCE(
        SUM(amount),
        0
      )::numeric(12,2) AS total
      FROM expenses
      WHERE allocation_id = $1
        AND status = 'VERIFIED'
    `,
    [allocationId]
  );

  return result.rows[0].total;
}

module.exports = {
  findById,
  findByAllocation,
  findByCampaign,
  findPending,
  create,
  verify,
  reject,
  getVerifiedExpenseTotal
};