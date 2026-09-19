 
require('dotenv').config();
const { Pool } = require('pg');
const { verifyChain } = require('../src/verifier');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transparent_ledger'
});

async function main() {
  console.log('🔍 Running Audit Ledger Integrity Verification...\n');
  try {
    const result = await verifyChain(pool);

    if (result.valid) {
      console.log('✅ LEDGER INTEGRITY CONFIRMED');
      console.log(`   - Total Entries: ${result.totalEntries}`);
      console.log(`   - Head Hash:     ${result.headHash}`);
      process.exit(0);
    } else {
      console.error('❌ LEDGER TAMPERING / CORRUPTION DETECTED!');
      console.error(`   - Broken Index:  ${result.brokenIndex}`);
      console.error(`   - Reason:        ${result.reason}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Verification failed with exception:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();