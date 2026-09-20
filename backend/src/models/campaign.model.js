const selectFields = `
  id,
  organizer_id,
  title,
  description,
  category,
  goal_amount,
  start_date,
  end_date,
  status,
  rejection_reason,
  created_at,
  updated_at
`;

function mapCampaignRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    organizerId: row.organizer_id,
    title: row.title,
    description: row.description,
    category: row.category,
    goalAmount: row.goal_amount,
    collectedAmount: row.collected,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findById(db, id) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapCampaignRow(result.rows[0]);
}

async function findPublic(db, {
  category,
  q,
  status
} = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  } else {
    conditions.push(`status IN ('ACTIVE', 'CLOSED')`);
  }

  if (category) {
    params.push(category);
    conditions.push(`LOWER(category) = LOWER($${params.length})`);
  }

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`
      (
        title ILIKE $${params.length}
        OR description ILIKE $${params.length}
        OR category ILIKE $${params.length}
      )
    `);
  }

  const result = await db.query(
    `
      SELECT c.id, c.organizer_id, c.title, c.description, c.category, c.goal_amount, c.start_date, c.end_date, c.status, c.rejection_reason, c.created_at, c.updated_at, cfs.collected
      FROM campaigns c
      LEFT JOIN campaign_fund_summary cfs ON c.id = cfs.campaign_id
      WHERE ${conditions.map(c => c.replace(/([a-zA-Z_]+)(?=\s*(?:=|IN|ILIKE))/g, 'c.$1')).join(" AND ")}
      ORDER BY c.created_at DESC
    `,
    params
  );

  return result.rows.map(mapCampaignRow);
}

async function findByOrganizer(db, organizerId) {
  const result = await db.query(
    `
      SELECT c.id, c.organizer_id, c.title, c.description, c.category, c.goal_amount, c.start_date, c.end_date, c.status, c.rejection_reason, c.created_at, c.updated_at, cfs.collected
      FROM campaigns c
      LEFT JOIN campaign_fund_summary cfs ON c.id = cfs.campaign_id
      WHERE c.organizer_id = $1
      ORDER BY c.created_at DESC
    `,
    [organizerId]
  );

  return result.rows.map(mapCampaignRow);
}

async function findPending(db) {
  const result = await db.query(
    `
      SELECT c.id, c.organizer_id, c.title, c.description, c.category, c.goal_amount, c.start_date, c.end_date, c.status, c.rejection_reason, c.created_at, c.updated_at, cfs.collected
      FROM campaigns c
      LEFT JOIN campaign_fund_summary cfs ON c.id = cfs.campaign_id
      WHERE c.status = 'PENDING_APPROVAL'
      ORDER BY c.created_at ASC
    `
  );

  return result.rows.map(mapCampaignRow);
}

async function create(db, {
  organizerId,
  title,
  description,
  category,
  goalAmount,
  startDate,
  endDate
}) {
  const result = await db.query(
    `
      INSERT INTO campaigns (
        organizer_id,
        title,
        description,
        category,
        goal_amount,
        start_date,
        end_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT')
      RETURNING ${selectFields}
    `,
    [
      organizerId,
      title,
      description,
      category,
      goalAmount,
      startDate || null,
      endDate || null
    ]
  );

  return mapCampaignRow(result.rows[0]);
}

async function update(db, id, {
  title,
  description,
  category,
  goalAmount,
  startDate,
  endDate
}) {
  const result = await db.query(
    `
      UPDATE campaigns
      SET
        title = $1,
        description = $2,
        category = $3,
        goal_amount = $4,
        start_date = $5,
        end_date = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING ${selectFields}
    `,
    [
      title,
      description,
      category,
      goalAmount,
      startDate || null,
      endDate || null,
      id
    ]
  );

  return mapCampaignRow(result.rows[0]);
}

async function submit(db, id) {
  const result = await db.query(
    `
      UPDATE campaigns
      SET
        status = 'PENDING_APPROVAL',
        rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${selectFields}
    `,
    [id]
  );

  return mapCampaignRow(result.rows[0]);
}

async function approve(db, id) {
  const result = await db.query(
    `
      UPDATE campaigns
      SET
        status = 'ACTIVE',
        rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${selectFields}
    `,
    [id]
  );

  return mapCampaignRow(result.rows[0]);
}

async function reject(db, id, reason) {
  const result = await db.query(
    `
      UPDATE campaigns
      SET
        status = 'REJECTED',
        rejection_reason = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING ${selectFields}
    `,
    [reason, id]
  );

  return mapCampaignRow(result.rows[0]);
}

async function close(db, id) {
  const result = await db.query(
    `
      UPDATE campaigns
      SET
        status = 'CLOSED',
        updated_at = NOW()
      WHERE id = $1
      RETURNING ${selectFields}
    `,
    [id]
  );

  return mapCampaignRow(result.rows[0]);
}

module.exports = {
  findById,
  findPublic,
  findByOrganizer,
  findPending,
  create,
  update,
  submit,
  approve,
  reject,
  close
};