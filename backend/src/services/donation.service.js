const db = require("../config/db");
const { withTransaction } = require("../config/db");

const ApiError = require("../utils/ApiError");
const donationModel = require("../models/donation.model");
const campaignModel = require("../models/campaign.model");
const paymentService = require("./payment.service");

const { appendEntry } = require("audit-ledger");
const {
  EVENT_TYPES,
  REF_TYPES
} = require("audit-ledger/src/types");

function getPublicDonorName(donation) {
  if (donation.isAnonymous) {
    return "Anonymous";
  }

  return donation.donorName || "Anonymous";
}

function mapPublicDonation(donation) {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    donorName: getPublicDonorName(donation),
    amount: donation.amount,
    isAnonymous: donation.isAnonymous,
    status: donation.status,
    createdAt: donation.createdAt,
    confirmedAt: donation.confirmedAt
  };
}

function mapPrivateDonation(donation) {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    donorId: donation.donorId,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    amount: donation.amount,
    isAnonymous: donation.isAnonymous,
    paymentRef: donation.paymentRef,
    status: donation.status,
    createdAt: donation.createdAt,
    confirmedAt: donation.confirmedAt
  };
}

async function createDonation(
  campaignId,
  donorId,
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

  if (campaign.status !== "ACTIVE") {
    throw ApiError.ruleViolation(
      "Donations are allowed only for ACTIVE campaigns"
    );
  }

  const payment =
    await paymentService.processPayment({
      amount: input.amount,
      donorId,
      campaignId
    });

  if (!payment.success) {
    throw ApiError.ruleViolation(
      "Payment could not be completed"
    );
  }

  return withTransaction(async (client) => {
    /*
     * Recheck and lock the campaign inside
     * the transaction.
     */
    const lockedCampaignResult =
      await client.query(
        `
          SELECT
            id,
            organizer_id,
            title,
            description,
            category,
            goal_amount,
            start_date,
            end_date,
            status,
            rejection_reason,
            created_at,
            updated_at
          FROM campaigns
          WHERE id = $1
          FOR UPDATE
        `,
        [campaignId]
      );

    if (lockedCampaignResult.rows.length === 0) {
      throw ApiError.notFound(
        "Campaign not found"
      );
    }

    const lockedCampaign =
      lockedCampaignResult.rows[0];

    if (lockedCampaign.status !== "ACTIVE") {
      throw ApiError.ruleViolation(
        "Donations are allowed only for ACTIVE campaigns"
      );
    }

    let donation;

    try {
      donation = await donationModel.create(
        client,
        {
          campaignId,
          donorId,
          donorName: input.donorName,
          donorEmail: input.donorEmail,
          amount: input.amount,
          isAnonymous: input.isAnonymous,
          paymentRef: payment.paymentRef
        }
      );
    } catch (error) {
      if (error.code === "23505") {
        throw ApiError.conflict(
          "A donation with this payment reference already exists"
        );
      }

      throw error;
    }

    /*
     * Add donation confirmation to the audit ledger.
     */
    await appendEntry(client, {
      type: EVENT_TYPES.DONATION_CONFIRMED,
      campaignId: donation.campaignId,
      refType: REF_TYPES.DONATION,
      refId: donation.id,
      amount: donation.amount,
      payload: {
        donorDisplay: donation.isAnonymous
          ? "Anonymous"
          : donation.donorName || "Anonymous",
        campaignTitle: lockedCampaign.title
      }
    });

    return mapPrivateDonation(donation);
  });
}

async function getCampaignDonations(
  campaignId,
  {
    page = 1,
    limit = 20
  } = {}
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

  const result =
    await donationModel.findByCampaign(
      db,
      campaignId,
      {
        page,
        limit
      }
    );

  return {
    donations: result.donations.map(
      mapPublicDonation
    ),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(
        result.total / result.limit
      )
    }
  };
}

async function getMyDonations(donorId) {
  const donations =
    await donationModel.findByDonor(
      db,
      donorId
    );

  return donations.map(
    mapPrivateDonation
  );
}

async function getDonationReceipt(
  donationId,
  userId
) {
  const donation =
    await donationModel.findById(
      db,
      donationId
    );

  if (!donation) {
    throw ApiError.notFound(
      "Donation not found"
    );
  }

  if (donation.donorId !== userId) {
    throw ApiError.forbidden(
      "You can only access your own donation receipt"
    );
  }

  return {
    receiptId: donation.id,
    donationId: donation.id,
    campaignId: donation.campaignId,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    amount: donation.amount,
    paymentRef: donation.paymentRef,
    status: donation.status,
    donatedAt:
      donation.confirmedAt ||
      donation.createdAt
  };
}

module.exports = {
  createDonation,
  getCampaignDonations,
  getMyDonations,
  getDonationReceipt
};