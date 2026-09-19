const allocationService = require("../services/allocation.service");
const { success } = require("../utils/response");

async function createAllocation(req, res) {
  const allocation =
    await allocationService.createAllocation(
      req.user.id,
      req.params.campaignId,
      req.body
    );

  return success(res, allocation, 201);
}

async function getCampaignAllocations(req, res) {
  const allocations =
    await allocationService.getCampaignAllocations(
      req.params.campaignId
    );

  return success(res, allocations);
}

async function getPendingAllocations(req, res) {
  const allocations =
    await allocationService.getPendingAllocations();

  return success(res, allocations);
}

async function approveAllocation(req, res) {
  const allocation =
    await allocationService.approveAllocation(
      req.user.id,
      req.params.id
    );

  return success(res, allocation);
}

async function rejectAllocation(req, res) {
  const allocation =
    await allocationService.rejectAllocation(
      req.user.id,
      req.params.id,
      req.body.reason
    );

  return success(res, allocation);
}

module.exports = {
  createAllocation,
  getCampaignAllocations,
  getPendingAllocations,
  approveAllocation,
  rejectAllocation
};