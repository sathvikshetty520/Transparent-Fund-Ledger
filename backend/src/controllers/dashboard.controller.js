const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/response");

async function getCampaignDashboard(req, res) {
  const dashboard =
    await dashboardService.getCampaignDashboard(
      req.params.campaignId
    );

  return success(
    res,
    dashboard
  );
}

async function getPlatformDashboard(req, res) {
  const dashboard =
    await dashboardService.getPlatformDashboard();

  return success(
    res,
    dashboard
  );
}

module.exports = {
  getCampaignDashboard,
  getPlatformDashboard
};