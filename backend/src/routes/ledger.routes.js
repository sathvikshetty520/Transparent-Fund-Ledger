const express = require('express');
const createLedgerController = require('../controllers/ledger.controller');

function ledgerRoutes(ledgerService) {
  const router = express.Router();
  const controller = createLedgerController(ledgerService);

  // Standard Ledger endpoints
  router.get('/ledger', controller.getEntries);
  router.get('/ledger/head', controller.getHead);
  router.get('/ledger/verify', controller.verifyLedger);
  router.get('/ledger/:index', controller.getEntryByIndex);

  // Campaign-specific audit endpoints
  router.get('/campaigns/:campaignId/reconcile', controller.reconcileCampaign);

  return router;
}

module.exports = ledgerRoutes;