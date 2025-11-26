import axios from 'axios';

// Replace with your actual API URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Hot Takes endpoints
export const hotTakesAPI = {
  getAll: () => api.get('/hot-takes'),
  getById: (id: string) => api.get(`/hot-takes/${id}`),
  create: (data: FormData) => 
    api.post('/hot-takes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  like: (id: string) => api.post(`/hot-takes/${id}/like`),
  comment: (id: string, content: string) => 
    api.post(`/hot-takes/${id}/comments`, { content }),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};

export default api;

