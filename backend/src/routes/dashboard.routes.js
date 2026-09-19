const express = require("express");
const { z } = require("zod");

const dashboardController = require("../controllers/dashboard.controller");

const {
  validateParams
} = require("../middleware/validate");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const campaignIdSchema = z.object({
  campaignId: z.string().uuid(
    "Invalid campaign ID"
  )
});

router.get(
  "/dashboard/campaigns/:campaignId",
  validateParams(
    campaignIdSchema
  ),
  asyncHandler(
    dashboardController.getCampaignDashboard
  )
);

router.get(
  "/dashboard/summary",
  asyncHandler(
    dashboardController.getPlatformDashboard
  )
);

module.exports = router;