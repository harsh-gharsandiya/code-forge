import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const documentService = {
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  create: async (title) => {
    const response = await api.post('/documents', { title });
    return response.data;
  },

  updateContent: async (id, content) => {
    const response = await api.put(`/documents/${id}/content`, { content });
    return response.data;
  },

  updateTitle: async (id, title) => {
    const response = await api.put(`/documents/${id}/title`, { title });
    return response.data;
  },

  share: async (id, email, permission) => {
    const response = await api.post(`/documents/${id}/share`, { email, permission });
    return response.data;
  },

  removeCollaborator: async (id, email) => {
    const response = await api.delete(`/documents/${id}/share/${email}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

export default api;
