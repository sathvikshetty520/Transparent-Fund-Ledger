/**
 * Supported Ledger Event Types
 */
const EVENT_TYPES = {
  CAMPAIGN_APPROVED: 'CAMPAIGN_APPROVED',
  DONATION_CONFIRMED: 'DONATION_CONFIRMED',
  EXPENSE_LOGGED: 'EXPENSE_LOGGED',
  MILESTONE_COMPLETED: 'MILESTONE_COMPLETED',
  REFUND_ISSUED: 'REFUND_ISSUED'
};

/**
 * Supported Entity Reference Types
 */
const REF_TYPES = {
  CAMPAIGN: 'Campaign',
  DONATION: 'Donation',
  EXPENSE: 'Expense',
  MILESTONE: 'Milestone'
};

module.exports = {
  EVENT_TYPES,
  REF_TYPES
};
