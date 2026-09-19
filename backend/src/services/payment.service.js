const crypto = require("crypto");

async function processPayment({
  amount,
  donorId,
  campaignId
}) {
  void amount;
  void donorId;
  void campaignId;

  return {
    success: true,
    paymentRef: `MOCK-${crypto.randomUUID()}`
  };
}

module.exports = {
  processPayment
};