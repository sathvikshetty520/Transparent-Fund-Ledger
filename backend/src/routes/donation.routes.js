const express = require("express");
const { z } = require("zod");

const donationController = require("../controllers/donation.controller");
const {
  authenticate,
  optionalAuthenticate
} = require("../middleware/auth");
const {
  validateBody,
  validateParams,
  validateQuery
} = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const campaignIdSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID")
});

const donationIdSchema = z.object({
  id: z.string().uuid("Invalid donation ID")
});

const createDonationSchema = z.object({
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Amount must be a valid monetary value"
    )
    .refine(
      (value) => Number(value) > 0,
      {
        message: "Donation amount must be greater than 0"
      }
    ),

  donorName: z
    .string()
    .trim()
    .min(2, "Donor name must contain at least 2 characters")
    .max(120, "Donor name must not exceed 120 characters")
    .optional(),

  donorEmail: z
    .string()
    .trim()
    .email("Invalid donor email address")
    .max(255, "Donor email must not exceed 255 characters")
    .optional(),

  isAnonymous: z
    .boolean()
    .default(false)
});

const donationQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
});

router.post(
  "/campaigns/:campaignId/donations",
  optionalAuthenticate,
  validateParams(campaignIdSchema),
  validateBody(createDonationSchema),
  asyncHandler(donationController.createDonation)
);

router.get(
  "/campaigns/:campaignId/donations",
  validateParams(campaignIdSchema),
  validateQuery(donationQuerySchema),
  asyncHandler(
    donationController.getCampaignDonations
  )
);

router.get(
  "/donations/me",
  authenticate,
  asyncHandler(donationController.getMyDonations)
);

router.get(
  "/donations/:id/receipt",
  authenticate,
  validateParams(donationIdSchema),
  asyncHandler(donationController.getDonationReceipt)
);

module.exports = router;