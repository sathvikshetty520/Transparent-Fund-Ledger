 
import api from './api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const loginUser = async (credentials) => {
  if (USE_MOCK) {
    // Mock user responses based on selected role
    const mockUser = {
      id: 'usr_demo_1',
      name: credentials.email.split('@')[0] || 'Demo User',
      email: credentials.email,
      role: credentials.role || 'CONTRIBUTOR',
    };
    return Promise.resolve({ user: mockUser, token: 'mock-jwt-token-123' });
  }

  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  if (USE_MOCK) {
    return Promise.resolve({
      user: { ...userData, id: 'usr_' + Date.now() },
      token: 'mock-jwt-token-456',
    });
  }

  const response = await api.post('/auth/register', userData);
  return response.data;
};