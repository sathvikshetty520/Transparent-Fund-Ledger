 require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transparent_ledger'
});

async function main() {
  console.log('📦 Exporting Audit Ledger entries...');

  try {
    const res = await pool.query(
      `SELECT entry_index AS "index", type, campaign_id AS "campaignId", ref_type AS "refType", ref_id AS "refId", amount, payload, timestamp, prev_hash AS "prevHash", hash FROM ledger_entries ORDER BY entry_index ASC`
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalEntries: res.rows.length,
      entries: res.rows
    };

    const outputPath = path.join(__dirname, '../ledger-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Audit Ledger exported successfully to ${outputPath}`);
    console.log(`   - Total records exported: ${res.rows.length}`);
  } catch (err) {
    console.error('Failed to export ledger:', err.message);
  } finally {
    await pool.end();
  }
}

main();
