const selectFields = `
  id,
  campaign_id,
  donor_id,
  donor_name,
  donor_email,
  amount,
  is_anonymous,
  payment_ref,
  status,
  created_at,
  confirmed_at
`;

function mapDonationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    campaignId: row.campaign_id,
    donorId: row.donor_id,
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    amount: row.amount,
    isAnonymous: row.is_anonymous,
    paymentRef: row.payment_ref,
    status: row.status,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at
  };
}

async function findById(db, id) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM donations
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapDonationRow(result.rows[0]);
}

async function findByPaymentRef(db, paymentRef) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM donations
      WHERE payment_ref = $1
      LIMIT 1
    `,
    [paymentRef]
  );

  return mapDonationRow(result.rows[0]);
}

async function create(
  db,
  {
    campaignId,
    donorId,
    donorName,
    donorEmail,
    amount,
    isAnonymous,
    paymentRef
  }
) {
  const result = await db.query(
    `
      INSERT INTO donations (
        campaign_id,
        donor_id,
        donor_name,
        donor_email,
        amount,
        is_anonymous,
        payment_ref,
        status,
        confirmed_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'CONFIRMED',
        NOW()
      )
      RETURNING ${selectFields}
    `,
    [
      campaignId,
      donorId || null,
      donorName || null,
      donorEmail || null,
      amount,
      isAnonymous,
      paymentRef
    ]
  );

  return mapDonationRow(result.rows[0]);
}

async function findByCampaign(
  db,
  campaignId,
  {
    page = 1,
    limit = 20
  } = {}
) {
  const offset = (page - 1) * limit;

  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM donations
      WHERE campaign_id = $1
        AND status = 'CONFIRMED'
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    [
      campaignId,
      limit,
      offset
    ]
  );

  const countResult = await db.query(
    `
      SELECT COUNT(*)::int AS total
      FROM donations
      WHERE campaign_id = $1
        AND status = 'CONFIRMED'
    `,
    [campaignId]
  );

  return {
    donations: result.rows.map(mapDonationRow),
    total: countResult.rows[0].total,
    page,
    limit
  };
}

async function findByDonor(db, donorId) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM donations
      WHERE donor_id = $1
      ORDER BY created_at DESC
    `,
    [donorId]
  );

  return result.rows.map(mapDonationRow);
}

module.exports = {
  findById,
  findByPaymentRef,
  create,
  findByCampaign,
  findByDonor
};