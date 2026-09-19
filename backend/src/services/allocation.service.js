const db = require("../config/db");
const ApiError = require("../utils/ApiError");
const allocationModel = require("../models/allocation.model");
const campaignModel = require("../models/campaign.model");

const { withTransaction } = require("../config/db");

async function createAllocation(
  organizerId,
  campaignId,
  input
) {
  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound(
      "Campaign not found"
    );
  }

  if (campaign.organizerId !== organizerId) {
    throw ApiError.forbidden(
      "Only the campaign organizer can propose allocations"
    );
  }

  if (campaign.status !== "ACTIVE") {
    throw ApiError.ruleViolation(
      "Allocations can only be proposed for ACTIVE campaigns"
    );
  }

  return allocationModel.create(
    db,
    {
      campaignId,
      proposedBy: organizerId,
      ...input
    }
  );
}

async function getCampaignAllocations(campaignId) {
  const campaign = await campaignModel.findById(
    db,
    campaignId
  );

  if (!campaign) {
    throw ApiError.notFound(
      "Campaign not found"
    );
  }

  return allocationModel.findByCampaign(
    db,
    campaignId
  );
}

async function getPendingAllocations() {
  return allocationModel.findPending(db);
}

async function approveAllocation(
  adminId,
  allocationId
) {
  void adminId;

  return withTransaction(async (client) => {
    const allocation =
      await allocationModel.findById(
        client,
        allocationId
      );

    if (!allocation) {
      throw ApiError.notFound(
        "Allocation not found"
      );
    }

    if (allocation.status !== "PENDING") {
      throw ApiError.ruleViolation(
        "Only PENDING allocations can be approved"
      );
    }

    /*
     * Lock the campaign before checking financial limits.
     * This prevents concurrent allocation approvals from
     * exceeding the confirmed donation total.
     */
    const campaignResult = await client.query(
      `
        SELECT id
        FROM campaigns
        WHERE id = $1
        FOR UPDATE
      `,
      [allocation.campaignId]
    );

    if (campaignResult.rows.length === 0) {
      throw ApiError.notFound(
        "Campaign not found"
      );
    }

    const confirmedDonations =
      await allocationModel.getConfirmedDonationTotal(
        client,
        allocation.campaignId
      );

    const approvedAllocations =
      await allocationModel.getApprovedAllocationTotal(
        client,
        allocation.campaignId
      );

    const availableAmount =
      Number(confirmedDonations) -
      Number(approvedAllocations);

    if (
      Number(allocation.amount) >
      availableAmount
    ) {
      throw ApiError.ruleViolation(
        "Allocation amount exceeds available confirmed donation funds"
      );
    }

    return allocationModel.approve(
      client,
      allocationId
    );
  });
}

async function rejectAllocation(
  adminId,
  allocationId,
  reason
) {
  void adminId;

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

  if (allocation.status !== "PENDING") {
    throw ApiError.ruleViolation(
      "Only PENDING allocations can be rejected"
    );
  }

  return allocationModel.reject(
    db,
    allocationId,
    reason
  );
}

module.exports = {
  createAllocation,
  getCampaignAllocations,
  getPendingAllocations,
  approveAllocation,
  rejectAllocation
};