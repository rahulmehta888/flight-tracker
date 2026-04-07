import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Deals API
export const dealsAPI = {
  getDeals: (params) => api.get('/deals', { params }),
  getDeal: (id) => api.get(`/deals/${id}`),
  trackClick: (id) => api.post(`/deals/${id}/click`),
  getStats: () => api.get('/deals/stats'),
};

// Subscriptions API
export const subscriptionsAPI = {
  getSubscriptions: () => api.get('/subscriptions'),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  deleteSubscription: (id) => api.delete(`/subscriptions/${id}`),
};

export default api;
