const db = require("../config/db");
const ApiError = require("../utils/ApiError");

const expenseModel = require("../models/expense.model");
const allocationModel = require("../models/allocation.model");
const campaignModel = require("../models/campaign.model");

const { withTransaction } = require("../config/db");

const {
  appendEntry
} = require("audit-ledger");

const {
  EVENT_TYPES,
  REF_TYPES
} = require("audit-ledger/src/types");

async function createExpense(
  organizerId,
  allocationId,
  input,
  receiptPath
) {
  const allocation =
    await allocationModel.findById(
      db,
      allocationId
    );

  if (!allocation) {
    throw ApiError.notFound(
      "Allocation not found"
    );
  }

  if (allocation.status !== "APPROVED") {
    throw ApiError.ruleViolation(
      "Expenses can only be submitted against APPROVED allocations"
    );
  }

  const campaign =
    await campaignModel.findById(
      db,
      allocation.campaignId
    );

  if (!campaign) {
    throw ApiError.notFound(
      "Campaign not found"
    );
  }

  if (campaign.organizerId !== organizerId) {
    throw ApiError.forbidden(
      "Only the campaign organizer can submit expenses"
    );
  }

  if (!receiptPath) {
    throw ApiError.badRequest(
      "Receipt is required"
    );
  }

  return expenseModel.create(
    db,
    {
      allocationId,
      submittedBy: organizerId,
      amount: input.amount,
      vendor: input.vendor,
      description: input.description,
      spentAt: input.spentAt,
      receiptPath
    }
  );
}

async function getAllocationExpenses(
  allocationId
) {
  const allocation =
    await allocationModel.findById(
      db,
      allocationId
    );

  if (!allocation) {
    throw ApiError.notFound(
      "Allocation not found"
    );
  }

  return expenseModel.findByAllocation(
    db,
    allocationId
  );
}

async function getCampaignExpenses(
  campaignId
) {
  const campaign =
    await campaignModel.findById(
      db,
      campaignId
    );

  if (!campaign) {
    throw ApiError.notFound(
      "Campaign not found"
    );
  }

  return expenseModel.findByCampaign(
    db,
    campaignId
  );
}

async function getPendingExpenses() {
  return expenseModel.findPending(db);
}

async function verifyExpense(
  adminId,
  expenseId
) {
  void adminId;

  return withTransaction(async (client) => {
    const expense =
      await expenseModel.findById(
        client,
        expenseId
      );

    if (!expense) {
      throw ApiError.notFound(
        "Expense not found"
      );
    }

    if (expense.status !== "PENDING") {
      throw ApiError.ruleViolation(
        "Only PENDING expenses can be verified"
      );
    }

    const allocationResult =
      await client.query(
        `
          SELECT
            id,
            campaign_id,
            proposed_by,
            purpose,
            description,
            amount,
            status,
            rejection_note,
            created_at,
            approved_at
          FROM allocations
          WHERE id = $1
          FOR UPDATE
        `,
        [expense.allocationId]
      );

    if (
      allocationResult.rows.length === 0
    ) {
      throw ApiError.notFound(
        "Allocation not found"
      );
    }

    const allocation =
      allocationResult.rows[0];

    if (allocation.status !== "APPROVED") {
      throw ApiError.ruleViolation(
        "Expenses can only be verified against APPROVED allocations"
      );
    }

    const verifiedTotal =
      await expenseModel.getVerifiedExpenseTotal(
        client,
        expense.allocationId
      );

    const availableAmount =
      Number(allocation.amount) -
      Number(verifiedTotal);

    if (
      Number(expense.amount) >
      availableAmount
    ) {
      throw ApiError.ruleViolation(
        "Expense amount exceeds the remaining allocation amount"
      );
    }

    const verifiedExpense =
      await expenseModel.verify(
        client,
        expenseId
      );

    await appendEntry(client, {
      type: EVENT_TYPES.EXPENSE_LOGGED,
      campaignId: allocation.campaign_id,
      refType: REF_TYPES.EXPENSE,
      refId: verifiedExpense.id,
      amount: verifiedExpense.amount,
      payload: {
        vendor: verifiedExpense.vendor,
        description: verifiedExpense.description,
        spentAt: verifiedExpense.spentAt
      }
    });

    return verifiedExpense;
  });
}

async function rejectExpense(
  adminId,
  expenseId,
  reason
) {
  void adminId;

  const expense =
    await expenseModel.findById(
      db,
      expenseId
    );

  if (!expense) {
    throw ApiError.notFound(
      "Expense not found"
    );
  }

  if (expense.status !== "PENDING") {
    throw ApiError.ruleViolation(
      "Only PENDING expenses can be rejected"
    );
  }

  return expenseModel.reject(
    db,
    expenseId,
    reason
  );
}

module.exports = {
  createExpense,
  getAllocationExpenses,
  getCampaignExpenses,
  getPendingExpenses,
  verifyExpense,
  rejectExpense
};