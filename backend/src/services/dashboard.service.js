const db = require("../config/db");
const ApiError = require("../utils/ApiError");

const dashboardModel = require("../models/dashboard.model");
const campaignModel = require("../models/campaign.model");

function mapFundSummary(summary) {
  if (!summary) {
    return null;
  }

  return {
    campaignId: summary.campaign_id,
    goalAmount: summary.goal,
    totalDonations: summary.collected,
    approvedAllocations: summary.allocated,
    verifiedExpenses: summary.utilized,
    unallocatedFunds: summary.unallocated,
    unspentFunds: summary.unspent,
    percentFunded: summary.percent_funded
  };
}

function mapPurposeSummary(rows) {
  return rows.map((row) => ({
    purpose: row.purpose,
    allocatedAmount: row.allocated,
    verifiedExpenseAmount: row.utilized
  }));
}

function mapTimeline(rows) {
  return rows.map((row) => ({
    date: row.day,
    donations: row.collected,
    expenses: row.utilized
  }));
}

function mapPlatformSummary(summary) {
  if (!summary) {
    return null;
  }

  return {
    totalCampaigns: summary.total_campaigns,
    activeCampaigns: summary.active_campaigns,
    totalDonors: summary.total_donors,
    totalDonations: summary.collected,
    totalAllocated: summary.allocated,
    totalExpenses: summary.utilized
  };
}

async function getCampaignDashboard(
  campaignId
) {
  const campaign =
    await campaignModel.findById(
      db,
      campaignId
    );

  if (!campaign) {
    throw ApiError.notFound(
      "Campaign not found"
    );
  }

  const [
    fundSummary,
    purposeSummary,
    timeline
  ] = await Promise.all([
    dashboardModel.getCampaignFundSummary(
      db,
      campaignId
    ),

    dashboardModel.getCampaignPurposeSummary(
      db,
      campaignId
    ),

    dashboardModel.getCampaignDailyTimeline(
      db,
      campaignId
    )
  ]);

  return {
    campaign: {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      goalAmount: campaign.goalAmount,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status
    },

    fundSummary:
      mapFundSummary(fundSummary),

    purposeSummary:
      mapPurposeSummary(purposeSummary),

    timeline:
      mapTimeline(timeline)
  };
}

async function getPlatformDashboard() {
  const summary =
    await dashboardModel.getPlatformSummary(
      db
    );

  return {
    summary:
      mapPlatformSummary(summary)
  };
}

module.exports = {
  getCampaignDashboard,
  getPlatformDashboard
};