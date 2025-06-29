import axios from 'axios';

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ird-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ird-token');
      localStorage.removeItem('ird-user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (id: string, data: any) => api.put(`/users/${id}/password`, data),
  getProfile: () => api.get('/profile'),
};

export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

export const requestsAPI = {
  getAll: () => api.get('/requests'),
  create: (data: any) => api.post('/requests', data),
  update: (id: string, data: any) => api.put(`/requests/${id}`, data),
};

export const issuanceAPI = {
  issueProperty: (requestId: string, model22Number?: string) =>
    api.post('/issue-property', { request_id: requestId, model22Number }),
  getIssuedProperties: () => api.get('/issued-properties'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;