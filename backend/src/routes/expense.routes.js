const express = require("express");
const { z } = require("zod");

const expenseController = require("../controllers/expense.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth");

const {
  validateBody,
  validateParams
} = require("../middleware/validate");

const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");

const router = express.Router();

const allocationIdSchema = z.object({
  allocationId: z.string().uuid(
    "Invalid allocation ID"
  )
});

const campaignIdSchema = z.object({
  campaignId: z.string().uuid(
    "Invalid campaign ID"
  )
});

const expenseIdSchema = z.object({
  id: z.string().uuid(
    "Invalid expense ID"
  )
});

const createExpenseSchema = z.object({
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Amount must be a valid monetary value"
    )
    .refine(
      (value) => Number(value) > 0,
      {
        message:
          "Expense amount must be greater than 0"
      }
    ),

  vendor: z
    .string()
    .trim()
    .min(
      2,
      "Vendor must contain at least 2 characters"
    )
    .max(
      200,
      "Vendor must not exceed 200 characters"
    ),

  description: z
    .string()
    .trim()
    .min(
      3,
      "Description must contain at least 3 characters"
    )
    .max(
      2000,
      "Description must not exceed 2000 characters"
    ),

  spentAt: z
    .string()
    .date(
      "Spent date must be a valid date"
    )
});

const rejectExpenseSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(
      3,
      "Rejection reason must contain at least 3 characters"
    )
    .max(
      1000,
      "Rejection reason must not exceed 1000 characters"
    )
});

router.post(
  "/allocations/:allocationId/expenses",
  authenticate,
  authorize("ORGANIZER"),
  validateParams(
    allocationIdSchema
  ),
  upload.single("receipt"),
  validateBody(
    createExpenseSchema
  ),
  asyncHandler(
    expenseController.createExpense
  )
);

router.get(
  "/allocations/:allocationId/expenses",
  validateParams(
    allocationIdSchema
  ),
  asyncHandler(
    expenseController.getAllocationExpenses
  )
);

router.get(
  "/campaigns/:campaignId/expenses",
  validateParams(
    campaignIdSchema
  ),
  asyncHandler(
    expenseController.getCampaignExpenses
  )
);

router.get(
  "/expenses/pending",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(
    expenseController.getPendingExpenses
  )
);

router.post(
  "/expenses/:id/verify",
  authenticate,
  authorize("ADMIN"),
  validateParams(
    expenseIdSchema
  ),
  asyncHandler(
    expenseController.verifyExpense
  )
);

router.post(
  "/expenses/:id/reject",
  authenticate,
  authorize("ADMIN"),
  validateParams(
    expenseIdSchema
  ),
  validateBody(
    rejectExpenseSchema
  ),
  asyncHandler(
    expenseController.rejectExpense
  )
);

module.exports = router;