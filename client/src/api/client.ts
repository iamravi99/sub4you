import axios from 'axios';
import { auth } from '../config/firebase';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to inject Auth Bearer Token and Admin Key
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const adminKey = localStorage.getItem('sub4you_admin_key');
      const devToken = localStorage.getItem('sub4you_dev_token');
      const currentUser = auth.currentUser;

      if (adminKey) {
        config.headers['x-admin-key'] = adminKey;
      }

      // If explicit dev/admin token is present in localStorage, prioritize it for admin actions
      if (devToken && (devToken.includes('admin') || adminKey)) {
        config.headers.Authorization = `Bearer ${devToken}`;
      } else if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else if (devToken) {
        config.headers.Authorization = `Bearer ${devToken}`;
      }
    } catch (err) {
      console.warn('[API Client] Error attaching auth token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected server error occurred',
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);
