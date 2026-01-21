import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Complaints API
export const complaintsAPI = {
  create: (formData) => {
    // For FormData, the interceptor will handle Content-Type automatically
    return api.post('/complaints', formData);
  },
  getAll: () => api.get('/complaints'),
  getOne: (id) => api.get(`/complaints/${id}`),
  predict: (formData) => {
    // Get ML predictions before submitting
    return api.post('/complaints/predict', formData);
  },
};

// Admin API
export const adminAPI = {
  getAllComplaints: (filters) => api.get('/admin/complaints', { params: filters }),
  updateStatus: (id, data) => api.put(`/admin/complaints/${id}/status`, data),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
  getStats: () => api.get('/admin/stats'),
};

export default api;

