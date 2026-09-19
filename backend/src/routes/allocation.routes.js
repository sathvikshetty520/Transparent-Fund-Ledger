const express = require("express");
const { z } = require("zod");

const allocationController = require("../controllers/allocation.controller");
const {
  authenticate,
  authorize
} = require("../middleware/auth");
const {
  validateBody,
  validateParams
} = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const campaignIdSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID")
});

const allocationIdSchema = z.object({
  id: z.string().uuid("Invalid allocation ID")
});

const createAllocationSchema = z.object({
  purpose: z
    .string()
    .trim()
    .min(
      3,
      "Purpose must contain at least 3 characters"
    )
    .max(
      200,
      "Purpose must not exceed 200 characters"
    ),

  description: z
    .string()
    .trim()
    .max(
      2000,
      "Description must not exceed 2000 characters"
    )
    .optional(),

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
          "Allocation amount must be greater than 0"
      }
    )
});

const rejectAllocationSchema = z.object({
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

/*
 * Organizer proposes an allocation.
 */
router.post(
  "/campaigns/:campaignId/allocations",
  authenticate,
  authorize("ORGANIZER"),
  validateParams(campaignIdSchema),
  validateBody(createAllocationSchema),
  asyncHandler(
    allocationController.createAllocation
  )
);

/*
 * Public campaign allocation list.
 */
router.get(
  "/campaigns/:campaignId/allocations",
  validateParams(campaignIdSchema),
  asyncHandler(
    allocationController.getCampaignAllocations
  )
);

/*
 * Admin gets allocations waiting for approval.
 */
router.get(
  "/allocations/pending",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(
    allocationController.getPendingAllocations
  )
);

/*
 * Admin approves an allocation.
 */
router.post(
  "/allocations/:id/approve",
  authenticate,
  authorize("ADMIN"),
  validateParams(allocationIdSchema),
  asyncHandler(
    allocationController.approveAllocation
  )
);

/*
 * Admin rejects an allocation.
 */
router.post(
  "/allocations/:id/reject",
  authenticate,
  authorize("ADMIN"),
  validateParams(allocationIdSchema),
  validateBody(rejectAllocationSchema),
  asyncHandler(
    allocationController.rejectAllocation
  )
);

module.exports = router;