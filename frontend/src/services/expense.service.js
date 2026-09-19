 import api from "./api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const submitExpense = async (expenseData) => {
  if (USE_MOCK) {
    return Promise.resolve({
      id: "exp_" + Date.now(),
      ...expenseData,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    });
  }

  const response = await api.post("/expenses", expenseData);
  return response.data;
};
