import api from "./api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const getLedger = async (campaignId) => {
  if (USE_MOCK) {
    return Promise.resolve([
      {
        id: "tx_101",
        campaignId: campaignId || "camp_1",
        category: "Equipment",
        amount: 1500,
        vendor: "AquaFilters Ltd",
        status: "APPROVED",
        hash: "0x8f3a...b49e",
        date: "2026-03-10",
      },
      {
        id: "tx_102",
        campaignId: campaignId || "camp_1",
        category: "Logistics",
        amount: 450,
        vendor: "FastTrack Freight",
        status: "PENDING",
        hash: "0x3c2b...f12a",
        date: "2026-03-12",
      },
    ]);
  }

  const response = await api.get(`/ledger/${campaignId}`);
  return response.data;
}; 
