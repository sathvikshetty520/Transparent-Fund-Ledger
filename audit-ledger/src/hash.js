const crypto = require('crypto');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Recursively canonicalizes JS objects so key order does not affect the SHA-256 hash.
 */
function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(canonicalize);
  }
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = canonicalize(obj[key]);
  }
  return sortedObj;
}

/**
 * Computes a deterministic SHA-256 hash for a ledger entry.
 */
function computeEntryHash(entry) {
  const canonicalData = {
    index: Number(entry.index),
    type: entry.type,
    campaignId: entry.campaignId,
    refType: entry.refType,
    refId: entry.refId,
    amount: entry.amount !== undefined ? entry.amount : null,
    payload: canonicalize(entry.payload || {}),
    timestamp: entry.timestamp,
    prevHash: entry.prevHash
  };

  const jsonString = JSON.stringify(canonicalData);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

module.exports = {
  computeEntryHash,
  GENESIS_HASH,
  
  canonicalize
}; 
