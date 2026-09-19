const campaignService = require("../services/campaign.service");
const { success } = require("../utils/response");

async function getCampaigns(req, res) {
  const campaigns = await campaignService.getCampaigns(
    req.query
  );

  return success(res, campaigns);
}

async function getCampaignById(req, res) {
  const campaign =
    await campaignService.getCampaignById(
      req.params.id
    );

  return success(res, campaign);
}

async function getMyCampaigns(req, res) {
  const campaigns =
    await campaignService.getMyCampaigns(
      req.user.id
    );

  return success(res, campaigns);
}

async function getPendingCampaigns(req, res) {
  const campaigns =
    await campaignService.getPendingCampaigns();

  return success(res, campaigns);
}

async function createCampaign(req, res) {
  const campaign =
    await campaignService.createCampaign(
      req.user.id,
      req.body
    );

  return success(res, campaign, 201);
}

async function updateCampaign(req, res) {
  const campaign =
    await campaignService.updateCampaign(
      req.user.id,
      req.params.id,
      req.body
    );

  return success(res, campaign);
}

async function submitCampaign(req, res) {
  const campaign =
    await campaignService.submitCampaign(
      req.user.id,
      req.params.id
    );

  return success(res, campaign);
}

async function approveCampaign(req, res) {
  const campaign =
    await campaignService.approveCampaign(
      req.user.id,
      req.params.id
    );

  return success(res, campaign);
}

async function rejectCampaign(req, res) {
  const campaign =
    await campaignService.rejectCampaign(
      req.user.id,
      req.params.id,
      req.body.reason
    );

  return success(res, campaign);
}

async function closeCampaign(req, res) {
  const campaign =
    await campaignService.closeCampaign(
      req.user.id,
      req.params.id
    );

  return success(res, campaign);
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