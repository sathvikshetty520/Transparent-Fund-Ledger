import api from "./api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const getPendingExpenses = async () => {
  if (USE_MOCK) {
    return Promise.resolve([
      {
        id: "exp_101",
        campaignTitle: "Clean Water Initiative",
        category: "Equipment",
        amount: 1500,
        vendor: "AquaFilters Ltd",
        description: "Bulk purchase of ceramic water filter cartridges.",
        submittedBy: "organizer@waterforall.org",
        status: "PENDING",
        submittedAt: "2026-03-18",
      },
      {
        id: "exp_102",
        campaignTitle: "Community Solar Grid",
        category: "Logistics",
        amount: 820,
        vendor: "SolarFreight Co",
        description: "Transport of solar panels to site B.",
        submittedBy: "organizer@greenenergy.org",
        status: "PENDING",
        submittedAt: "2026-03-19",
      },
    ]);
  }

  const response = await api.get("/admin/expenses/pending");
  return response.data;
};

export const updateExpenseStatus = async (expenseId, status) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, id: expenseId, status });
  }

  const response = await api.patch(`/admin/expenses/${expenseId}`, { status });
  return response.data;
};