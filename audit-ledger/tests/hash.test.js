const { computeEntryHash, GENESIS_HASH } = require('../src/hash');

describe('audit-ledger: hash algorithms', () => {
  test('generates consistent SHA-256 hashes regardless of object key order', () => {
    const entryA = {
      index: 1,
      type: 'CAMPAIGN_APPROVED',
      campaignId: 'abc-123',
      refType: 'Campaign',
      refId: 'abc-123',
      amount: null,
      payload: { a: 1, b: 2 },
      timestamp: '2026-01-01T00:00:00.000Z',
      prevHash: GENESIS_HASH
    };

    const entryB = {
      prevHash: GENESIS_HASH,
      timestamp: '2026-01-01T00:00:00.000Z',
      payload: { b: 2, a: 1 }, // Reordered keys
      amount: null,
      refId: 'abc-123',
      refType: 'Campaign',
      campaignId: 'abc-123',
      type: 'CAMPAIGN_APPROVED',
      index: 1
    };

    expect(computeEntryHash(entryA)).toBe(computeEntryHash(entryB));
  });
});
