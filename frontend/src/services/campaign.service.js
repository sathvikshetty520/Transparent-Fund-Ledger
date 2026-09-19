import api from './api';
import mockCampaigns from './mocks/campaigns.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const getCampaigns = async () => {
  if (USE_MOCK) {
    return Promise.resolve(mockCampaigns);
  }
  const response = await api.get('/campaigns');
  return response.data;
};