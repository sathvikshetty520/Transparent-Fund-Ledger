/**
 * Express Controller handling ledger API endpoints.
 */
function createLedgerController(ledgerService) {
  return {
    async getEntries(req, res, next) {
      try {
        const { page = 1, limit = 20, type, campaignId } = req.query;
        const result = await ledgerService.getEntries({
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          type,
          campaignId
        });
        res.json({ success: true, ...result });
      } catch (err) {
        next(err);
      }
    },

    async getHead(req, res, next) {
      try {
        const head = await ledgerService.getHead();
        res.json({ success: true, head });
      } catch (err) {
        next(err);
      }
    },

    async getEntryByIndex(req, res, next) {
      try {
        const { index } = req.params;
        const entry = await ledgerService.getEntryByIndex(parseInt(index, 10));
        if (!entry) {
          return res.status(404).json({ success: false, error: 'Ledger entry not found' });
        }
        res.json({ success: true, entry });
      } catch (err) {
        next(err);
      }
    },

    async verifyLedger(req, res, next) {
      try {
        const auditResult = await ledgerService.verifyIntegrity();
        res.json({ success: true, audit: auditResult });
      } catch (err) {
        next(err);
      }
    },

    async reconcileCampaign(req, res, next) {
      try {
        const { campaignId } = req.params;
        const reconciliation = await ledgerService.reconcile(campaignId);
        res.json({ success: true, reconciliation });
      } catch (err) {
        next(err);
      }
    }
  };
}

module.exports = createLedgerController;