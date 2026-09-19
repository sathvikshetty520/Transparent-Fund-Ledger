const { verifyChain } = require('../src/verifier');
const { computeEntryHash, GENESIS_HASH } = require('../src/hash');

describe('audit-ledger: tamper detection test suite', () => {
  function createValidChain() {
    const entry1 = {
      index: 1,
      type: 'CAMPAIGN_APPROVED',
      campaignId: '11111111-1111-1111-1111-111111111111',
      refType: 'Campaign',
      refId: '11111111-1111-1111-1111-111111111111',
      amount: null,
      payload: { name: 'Clean Water Project' },
      timestamp: '2026-01-01T00:00:00.000Z',
      prevHash: GENESIS_HASH
    };
    entry1.hash = computeEntryHash(entry1);

    const entry2 = {
      index: 2,
      type: 'DONATION_CONFIRMED',
      campaignId: '11111111-1111-1111-1111-111111111111',
      refType: 'Donation',
      refId: '22222222-2222-2222-2222-222222222222',
      amount: '500.00',
      payload: { donor: 'Alice' },
      timestamp: '2026-01-02T00:00:00.000Z',
      prevHash: entry1.hash
    };
    entry2.hash = computeEntryHash(entry2);

    return [entry1, entry2];
  }

  test('passes on unmodified valid chain', async () => {
    const chain = createValidChain();
    const mockDb = { query: jest.fn().mockResolvedValue({ rows: chain }) };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(2);
  });

  test('flags payload field tampering at index 2', async () => {
    const chain = createValidChain();
    // Tamper with amount in entry 2 without updating its hash
    chain[1].amount = '9999.00';

    const mockDb = { query: jest.fn().mockResolvedValue({ rows: chain }) };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(false);
    expect(result.brokenIndex).toBe(2);
    expect(result.reason).toContain('Data tampering detected');
  });

  test('flags index gap (e.g. index jumped from 1 to 3)', async () => {
    const chain = createValidChain();
    chain[1].index = 3; // Index gap

    const mockDb = { query: jest.fn().mockResolvedValue({ rows: chain }) };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(false);
    expect(result.brokenIndex).toBe(3);
    expect(result.reason).toContain('Index gap/mismatch');
  });

  test('flags invalid prevHash chaining', async () => {
    const chain = createValidChain();
    chain[1].prevHash = 'bad_hash_12345'; // Corrupt link

    const mockDb = { query: jest.fn().mockResolvedValue({ rows: chain }) };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(false);
    expect(result.brokenIndex).toBe(2);
  });
});
