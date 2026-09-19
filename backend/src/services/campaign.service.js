const db = require("../config/db");
const ApiError = require("../utils/ApiError");
const campaignModel = require("../models/campaign.model");
const { withTransaction } = require("../config/db");

const {
  appendEntry
} = require("audit-ledger");

const {
  EVENT_TYPES,
  REF_TYPES
} = require("audit-ledger/src/types");

async function getCampaigns(filters) {
  return campaignModel.findPublic(db, filters);
}

async function getCampaignById(id) {
  const campaign = await campaignModel.findById(db, id);

  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }

  return campaign;
}

async function getMyCampaigns(organizerId) {
  return campaignModel.findByOrganizer(
    db,
    organizerId
  );
}

async function getPendingCampaigns() {
  return campaignModel.findPending(db);
}

async function createCampaign(organizerId, input) {
  return campaignModel.create(
    db,
    {
      organizerId,
      ...input
    }
  );
}

async function updateCampaign(
  organizerId,
  campaignId,
  input
) {
  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }

  if (campaign.organizerId !== organizerId) {
    throw ApiError.forbidden(
      "Only the campaign organizer can edit this campaign"
    );
  }

  if (
    campaign.status !== "DRAFT" &&
    campaign.status !== "REJECTED"
  ) {
    throw ApiError.ruleViolation(
      "Only DRAFT or REJECTED campaigns can be edited"
    );
  }

  return campaignModel.update(
    db,
    campaignId,
    input
  );
}

async function submitCampaign(
  organizerId,
  campaignId
) {
  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }

  if (campaign.organizerId !== organizerId) {
    throw ApiError.forbidden(
      "Only the campaign organizer can submit this campaign"
    );
  }

  if (
    campaign.status !== "DRAFT" &&
    campaign.status !== "REJECTED"
  ) {
    throw ApiError.ruleViolation(
      "Only DRAFT or REJECTED campaigns can be submitted"
    );
  }

  return campaignModel.submit(
    db,
    campaignId
  );
}

async function approveCampaign(
  adminId,
  campaignId
) {
  // adminId is intentionally accepted for service-level clarity.
  // Authorization is handled by middleware.
  void adminId;

  return withTransaction(async (client) => {
    const campaign = await campaignModel.findById(
      client,
      campaignId
    );

    if (!campaign) {
      throw ApiError.notFound("Campaign not found");
    }

    if (campaign.status !== "PENDING_APPROVAL") {
      throw ApiError.ruleViolation(
        "Only campaigns pending approval can be approved"
      );
    }

    const approvedCampaign =
      await campaignModel.approve(
        client,
        campaignId
      );

    await appendEntry(client, {
      type: EVENT_TYPES.CAMPAIGN_APPROVED,
      campaignId: approvedCampaign.id,
      refType: REF_TYPES.CAMPAIGN,
      refId: approvedCampaign.id,
      amount: null,
      payload: {
        title: approvedCampaign.title,
        category: approvedCampaign.category
      }
    });

    return approvedCampaign;
  });
}

async function rejectCampaign(
  adminId,
  campaignId,
  reason
) {
  void adminId;

  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }

  if (campaign.status !== "PENDING_APPROVAL") {
    throw ApiError.ruleViolation(
      "Only campaigns pending approval can be rejected"
    );
  }

  return campaignModel.reject(
    db,
    campaignId,
    reason
  );
}

async function closeCampaign(
  adminId,
  campaignId
) {
  void adminId;

  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }

  if (campaign.status !== "ACTIVE") {
    throw ApiError.ruleViolation(
      "Only ACTIVE campaigns can be closed"
    );
  }

  return campaignModel.close(
    db,
    campaignId
  );
}

module.exports = {
  getCampaigns,
  getCampaignById,
  getMyCampaigns,
  getPendingCampaigns,
  createCampaign,
  updateCampaign,
  submitCampaign,
  approveCampaign,
  rejectCampaign,
  closeCampaign
};