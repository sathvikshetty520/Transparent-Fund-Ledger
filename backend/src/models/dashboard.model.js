async function getCampaignFundSummary(
  db,
  campaignId
) {
  const result = await db.query(
    `
      SELECT *
      FROM campaign_fund_summary
      WHERE campaign_id = $1
      LIMIT 1
    `,
    [campaignId]
  );

  return result.rows[0] || null;
}

async function getCampaignPurposeSummary(
  db,
  campaignId
) {
  const result = await db.query(
    `
      SELECT *
      FROM campaign_purpose_summary
      WHERE campaign_id = $1
      ORDER BY purpose
    `,
    [campaignId]
  );

  return result.rows;
}

async function getCampaignDailyTimeline(
  db,
  campaignId
) {
  const result = await db.query(
    `
      SELECT *
      FROM campaign_daily_timeline
      WHERE campaign_id = $1
      ORDER BY day
    `,
    [campaignId]
  );

  return result.rows;
}

async function getPlatformSummary(db) {
  const result = await db.query(
    `
      SELECT *
      FROM platform_summary
      LIMIT 1
    `
  );

  return result.rows[0] || null;
}

module.exports = {
  getCampaignFundSummary,
  getCampaignPurposeSummary,
  getCampaignDailyTimeline,
  getPlatformSummary
};