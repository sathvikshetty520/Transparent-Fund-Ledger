const donationService = require("../services/donation.service");
const { success } = require("../utils/response");

async function createDonation(req, res) {
  const donation = await donationService.createDonation(
    req.params.campaignId,
    req.user?.id || null,
    req.body
  );

  return success(res, donation, 201);
}

async function getCampaignDonations(req, res) {
  const donations =
    await donationService.getCampaignDonations(
      req.params.campaignId,
      {
        page: req.query.page,
        limit: req.query.limit
      }
    );

  return success(res, donations);
}

async function getMyDonations(req, res) {
  const donations =
    await donationService.getMyDonations(
      req.user.id
    );

  return success(res, donations);
}

async function getDonationReceipt(req, res) {
  const receipt =
    await donationService.getDonationReceipt(
      req.params.id,
      req.user.id
    );

  return success(res, receipt);
}

module.exports = {
  createDonation,
  getCampaignDonations,
  getMyDonations,
  getDonationReceipt
};