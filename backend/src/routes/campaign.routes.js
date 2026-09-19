const express = require("express");
const { z } = require("zod");

const campaignController = require("../controllers/campaign.controller");
const {
  authenticate,
  authorize
} = require("../middleware/auth");
const {
  validateBody,
  validateParams,
  validateQuery
} = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const uuidSchema = z.object({
  id: z.string().uuid("Invalid campaign ID")
});

const createCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  goalAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Goal amount must be a valid monetary value"
    ),

  startDate: z
    .string()
    .date()
    .optional()
    .nullable(),

  endDate: z
    .string()
    .date()
    .optional()
    .nullable()
});

const updateCampaignSchema = createCampaignSchema;

const rejectCampaignSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Rejection reason must contain at least 3 characters")
    .max(1000, "Rejection reason must not exceed 1000 characters")
});

const campaignQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .optional(),

  q: z
    .string()
    .trim()
    .optional(),

  status: z
    .enum([
      "ACTIVE",
      "CLOSED"
    ])
    .optional()
});

// Public campaign list
router.get(
  "/",
  validateQuery(campaignQuerySchema),
  asyncHandler(campaignController.getCampaigns)
);

// Organizer's campaigns
router.get(
  "/mine",
  authenticate,
  authorize("ORGANIZER"),
  asyncHandler(campaignController.getMyCampaigns)
);

// Admin pending campaigns
router.get(
  "/pending",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(campaignController.getPendingCampaigns)
);

// Public campaign details
router.get(
  "/:id",
  validateParams(uuidSchema),
  asyncHandler(campaignController.getCampaignById)
);

// Organizer creates campaign
router.post(
  "/",
  authenticate,
  authorize("ORGANIZER"),
  validateBody(createCampaignSchema),
  asyncHandler(campaignController.createCampaign)
);

// Organizer edits campaign
router.patch(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  validateParams(uuidSchema),
  validateBody(updateCampaignSchema),
  asyncHandler(campaignController.updateCampaign)
);

// Organizer submits campaign
router.post(
  "/:id/submit",
  authenticate,
  authorize("ORGANIZER"),
  validateParams(uuidSchema),
  asyncHandler(campaignController.submitCampaign)
);

// Admin approves campaign
router.post(
  "/:id/approve",
  authenticate,
  authorize("ADMIN"),
  validateParams(uuidSchema),
  asyncHandler(campaignController.approveCampaign)
);

// Admin rejects campaign
router.post(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  validateParams(uuidSchema),
  validateBody(rejectCampaignSchema),
  asyncHandler(campaignController.rejectCampaign)
);

// Admin closes campaign
router.post(
  "/:id/close",
  authenticate,
  authorize("ADMIN"),
  validateParams(uuidSchema),
  asyncHandler(campaignController.closeCampaign)
);

module.exports = router;