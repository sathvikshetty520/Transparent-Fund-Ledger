const expenseService = require("../services/expense.service");
const { success } = require("../utils/response");

async function createExpense(req, res) {
  const receiptPath = req.file
    ? req.file.path
    : null;

  const expense =
    await expenseService.createExpense(
      req.user.id,
      req.params.allocationId,
      req.body,
      receiptPath
    );

  return success(
    res,
    expense,
    201
  );
}

async function getAllocationExpenses(
  req,
  res
) {
  const expenses =
    await expenseService.getAllocationExpenses(
      req.params.allocationId
    );

  return success(
    res,
    expenses
  );
}

async function getCampaignExpenses(
  req,
  res
) {
  const expenses =
    await expenseService.getCampaignExpenses(
      req.params.campaignId
    );

  return success(
    res,
    expenses
  );
}

async function getPendingExpenses(
  req,
  res
) {
  const expenses =
    await expenseService.getPendingExpenses();

  return success(
    res,
    expenses
  );
}

async function verifyExpense(
  req,
  res
) {
  const expense =
    await expenseService.verifyExpense(
      req.user.id,
      req.params.id
    );

  return success(
    res,
    expense
  );
}

async function rejectExpense(
  req,
  res
) {
  const expense =
    await expenseService.rejectExpense(
      req.user.id,
      req.params.id,
      req.body.reason
    );

  return success(
    res,
    expense
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