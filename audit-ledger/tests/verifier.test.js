 
const { verifyChain, reconcileCampaign } = require('../src/verifier');
const { computeEntryHash, GENESIS_HASH } = require('../src/hash');

describe('audit-ledger: verifier & reconciliation', () => {
  test('verifyChain passes on valid contiguous entries', async () => {
    const entry1 = {
      index: 1,
      type: 'CAMPAIGN_APPROVED',
      campaignId: '11111111-1111-1111-1111-111111111111',
      refType: 'Campaign',
      refId: '11111111-1111-1111-1111-111111111111',
      amount: null,
      payload: {},
      timestamp: '2026-01-01T00:00:00.000Z',
      prevHash: GENESIS_HASH
    };
    entry1.hash = computeEntryHash(entry1);

    const mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [entry1] })
    };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(1);
  });

  test('verifyChain detects tampered hash', async () => {
    const entry1 = {
      index: 1,
      type: 'CAMPAIGN_APPROVED',
      campaignId: '11111111-1111-1111-1111-111111111111',
      refType: 'Campaign',
      refId: '11111111-1111-1111-1111-111111111111',
      amount: null,
      payload: {},
      timestamp: '2026-01-01T00:00:00.000Z',
      prevHash: GENESIS_HASH,
      hash: 'fake_tampered_hash_123456789'
    };

    const mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [entry1] })
    };

    const result = await verifyChain(mockDb);
    expect(result.valid).toBe(false);
    expect(result.brokenIndex).toBe(1);
  });

  test('reconcileCampaign cross-checks totals correctly', async () => {
    const mockDb = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rows: [
            { type: 'DONATION_CONFIRMED', amount: '100.00' },
            { type: 'EXPENSE_LOGGED', amount: '40.00' }
          ]
        })
        .mockResolvedValueOnce({ rows: [{ total: '100.00' }] })
        .mockResolvedValueOnce({ rows: [{ total: '40.00' }] })
    };

    const result = await reconcileCampaign(mockDb, '11111111-1111-1111-1111-111111111111');
    expect(result.matched).toBe(true);
    expect(result.ledger.donations).toBe(100.0);
    expect(result.ledger.expenses).toBe(40.0);
  });
});