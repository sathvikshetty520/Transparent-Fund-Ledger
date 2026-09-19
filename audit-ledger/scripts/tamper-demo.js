require('dotenv').config();
const { Pool } = require('pg');
const { verifyChain } = require('../src/verifier');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transparent_ledger'
});

async function main() {
  console.log('🚨 AUDIT LEDGER TAMPER DEMONSTRATION 🚨\n');

  try {
    // 1. Verify before tampering
    console.log('Step 1: Running initial integrity check...');
    let result = await verifyChain(pool);

    if (!result.valid || result.totalEntries === 0) {
      console.log('⚠️  Ledger must contain valid entries to run tamper demo. Please seed/append entries first.');
      process.exit(1);
    }
    console.log(`✅ Chain is clean across ${result.totalEntries} entries.\n`);

    // 2. Simulate DB Tampering (Modify payload/amount on entry #1)
    console.log('Step 2: Simulating illegal SQL update on entry index 1...');
    await pool.query(
      `UPDATE ledger_entries SET amount = 999999.99 WHERE entry_index = 1`
    );
    console.log('⚠️  Database updated directly via SQL without recalculating hash!\n');

    // 3. Verify after tampering
    console.log('Step 3: Re-running integrity verification...');
    result = await verifyChain(pool);

    if (!result.valid) {
      console.log('🚨 TAMPERING DETECTED AS EXPECTED:');
      console.log(`   - Tampered Index: ${result.brokenIndex}`);
      console.log(`   - Detection Rule: ${result.reason}\n`);
      console.log('🎉 Audit System successfully flagged unauthorized modification!');
    } else {
      console.error('❌ Failed to detect tampering!');
    }
  } catch (err) {
    console.error('Error during tamper demo execution:', err.message);
  } finally {
    await pool.end();
  }
}

main();
