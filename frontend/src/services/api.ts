import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: { firstName: string; lastName: string }) =>
    api.put('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  getStats: () => api.get('/auth/stats'),
};

// Cases API
export const casesAPI = {
  createCase: (caseData: {
    title: string;
    description: string;
    category: string;
    amount?: number;
    currency?: string;
    opposingPartyEmail: string;
    deadline: string;
  }) => api.post('/cases', caseData),

  getCases: (params?: { page?: number; limit?: number; status?: string; category?: string }) =>
    api.get('/cases', { params }),

  getCase: (caseId: string) => api.get(`/cases/${caseId}`),

  updateCase: (caseId: string, data: any) => api.put(`/cases/${caseId}`, data),

  cancelCase: (caseId: string) => api.delete(`/cases/${caseId}`),

  joinCase: (token: string) => api.post(`/cases/join/${token}`),

  submitClaim: (caseId: string, data: { claim: string; evidence?: any[] }) =>
    api.post(`/cases/${caseId}/submit`, data),

  appealVerdict: (caseId: string, data: { reason: string }) =>
    api.post(`/cases/${caseId}/appeal`, data),

  retryVerdict: (caseId: string) => api.post(`/cases/${caseId}/retry-verdict`),
};

// Verdicts API
export const verdictsAPI = {
  getVerdicts: (params?: { page?: number; limit?: number }) =>
    api.get('/verdicts', { params }),

  getStats: () => api.get('/verdicts/stats'),

  getVerdictByCase: (caseId: string) => api.get(`/verdicts/case/${caseId}`),

  getVerdictDetails: (verdictId: string) => api.get(`/verdicts/${verdictId}`),

  finalizeVerdict: (verdictId: string) => api.put(`/verdicts/${verdictId}/finalize`),
};

export default api;
