import api from './client';

// Every function returns response.data
const get = (url, config) => api.get(url, config).then((r) => r.data);
const post = (url, body, config) => api.post(url, body, config).then((r) => r.data);
const patch = (url, body) => api.patch(url, body).then((r) => r.data);

// Auth
export const register = (body) => post('/auth/register', body);
export const login = (body) => post('/auth/login', body);
export const getMe = () => get('/users/me');

// Campaigns
export const getCampaigns = (params) => get('/campaigns', { params });
export const getMyCampaigns = () => get('/campaigns/mine');
export const getPendingCampaigns = () => get('/campaigns/pending');
export const getCampaign = (id) => get(`/campaigns/${id}`);
export const createCampaign = (body) => post('/campaigns', body);
export const updateCampaign = (id, body) => patch(`/campaigns/${id}`, body);
export const submitCampaign = (id) => post(`/campaigns/${id}/submit`);
export const approveCampaign = (id) => post(`/campaigns/${id}/approve`);
export const rejectCampaign = (id, reason) => post(`/campaigns/${id}/reject`, { reason });
export const closeCampaign = (id) => post(`/campaigns/${id}/close`);

// Ledger
export const getLedgerEntries = (params) => get('/ledger', { params });
export const getLedgerHead = () => get('/ledger/head');
export const verifyLedgerIntegrity = () => get('/ledger/verify');
export const getLedgerEntryByIndex = (index) => get(`/ledger/${index}`);
export const reconcileCampaignLedger = (campaignId) => get(`/campaigns/${campaignId}/reconcile`);

// Donations
export const donate = (campaignId, body) => post(`/campaigns/${campaignId}/donations`, body);
export const getCampaignDonations = (campaignId) => get(`/campaigns/${campaignId}/donations`);
export const getMyDonations = () => get('/donations/me');
export const getReceipt = (id) => get(`/donations/${id}/receipt`);

// Allocations
export const proposeAllocation = (campaignId, body) => post(`/campaigns/${campaignId}/allocations`, body);
export const getCampaignAllocations = (campaignId) => get(`/campaigns/${campaignId}/allocations`);
export const getPendingAllocations = () => get('/allocations/pending');
export const approveAllocation = (id) => post(`/allocations/${id}/approve`);
export const rejectAllocation = (id, reason) => post(`/allocations/${id}/reject`, { reason });

// Expenses (submitExpense takes a FormData object)
export const submitExpense = (allocationId, formData) => post(`/allocations/${allocationId}/expenses`, formData);
export const getAllocationExpenses = (allocationId) => get(`/allocations/${allocationId}/expenses`);
export const getCampaignExpenses = (campaignId) => get(`/campaigns/${campaignId}/expenses`);
export const getPendingExpenses = () => get('/expenses/pending');
export const verifyExpense = (id) => post(`/expenses/${id}/verify`);
export const rejectExpense = (id, reason) => post(`/expenses/${id}/reject`, { reason });

// Dashboard
export const getCampaignDashboard = (campaignId) => get(`/dashboard/campaigns/${campaignId}`);
export const getSummary = () => get('/dashboard/summary');
