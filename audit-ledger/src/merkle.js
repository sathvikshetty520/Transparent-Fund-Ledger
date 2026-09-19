const crypto = require('crypto');

/**
 * Computes SHA-256 hash of combined data
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Computes the Merkle Root hash from an array of entry hashes.
 * @param {Array<string>} hashes - List of SHA-256 hashes
 * @returns {string} Merkle Root hash (or empty string if no hashes)
 */
function buildMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return '';
  if (hashes.length === 1) return hashes[0];

  let currentLevel = [...hashes];

  while (currentLevel.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Pair two nodes
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(sha256(combined));
      } else {
        // Odd number of nodes: duplicate last node
        const combined = currentLevel[i] + currentLevel[i];
        nextLevel.push(sha256(combined));
      }
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

module.exports = {
  buildMerkleRoot
};
