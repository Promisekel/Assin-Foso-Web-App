import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getActivity: (id) => api.get(`/users/${id}/activity`),
};

// Projects API
export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: (id) => api.get(`/projects/${id}/stats`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getByProject: (projectId, params = {}) => api.get(`/tasks/project/${projectId}`, { params }),
  getByUser: (userId, params = {}) => api.get(`/tasks/assigned/${userId}`, { params }),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

// Albums API
export const albumsAPI = {
  getAll: (params = {}) => api.get('/albums', { params }),
  getById: (id, params = {}) => api.get(`/albums/${id}`, { params }),
  create: (data) => api.post('/albums', data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
  getStats: (id) => api.get(`/albums/${id}/stats`),
};

// Images API
export const imagesAPI = {
  getAll: (params = {}) => api.get('/images', { params }),
  getById: (id) => api.get(`/images/${id}`),
  upload: (formData) => {
    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => api.put(`/images/${id}`, data),
  delete: (id) => api.delete(`/images/${id}`),
  getByAlbum: (albumId, params = {}) => api.get(`/images/album/${albumId}`, { params }),
  getStats: () => api.get('/images/stats/overview'),
};

// Documents API
export const documentsAPI = {
  getAll: (params = {}) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  getByProject: (projectId, params = {}) => api.get(`/documents/project/${projectId}`, { params }),
  getStats: () => api.get('/documents/stats/overview'),
  download: (id) => api.get(`/documents/${id}/download`),
};

// Calendar API
export const calendarAPI = {
  getAll: (params = {}) => api.get('/calendar', { params }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
  getByProject: (projectId, params = {}) => api.get(`/calendar/project/${projectId}`, { params }),
};

// Invites API
export const invitesAPI = {
  getAll: (params = {}) => api.get('/invites', { params }),
  getById: (id) => api.get(`/invites/${id}`),
  send: (data) => api.post('/invites/send', data),
  getByToken: (token) => api.get(`/invites/token/${token}`),
  accept: (data) => api.post('/invites/accept', data),
  resend: (id) => api.post(`/invites/${id}/resend`),
  cancel: (id) => api.delete(`/invites/${id}`),
  getStats: () => api.get('/invites/stats/overview'),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    return {
      message,
      status: error.response.status,
      details: error.response.data?.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      details: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      details: null,
    };
  }
};

// Storage estimation utilities
export const storageUtils = {
  // Estimate storage usage in bytes
  calculateStorageUsage: (items) => {
    return items.reduce((total, item) => total + (item.fileSize || 0), 0);
  },

  // Format bytes to human readable
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Calculate storage percentage
  calculateStoragePercentage: (used, total) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  },

  // Cloudinary limits (25GB free tier)
  CLOUDINARY_FREE_LIMIT: 25 * 1024 * 1024 * 1024, // 25GB in bytes

  // Estimated storage per project (100MB images + 20MB docs)
  PROJECT_STORAGE_ESTIMATE: (100 + 20) * 1024 * 1024, // 120MB per project

  // Calculate how many projects can fit in storage
  calculateMaxProjects: (usedStorage) => {
    const availableStorage = storageUtils.CLOUDINARY_FREE_LIMIT - usedStorage;
    return Math.floor(availableStorage / storageUtils.PROJECT_STORAGE_ESTIMATE);
  },
};

export default api;
