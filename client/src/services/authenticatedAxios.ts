import axios from 'axios';

// Create a centralized axios instance with JWT authentication for all API calls
const authenticatedAxios = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
authenticatedAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No JWT token found in localStorage for API request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
authenticatedAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('JWT token authentication failed for:', error.config?.url);
      
      // Don't auto-redirect during login attempts
      if (!error.config?.url?.includes('/auth/login')) {
        console.log('Clearing invalid tokens and redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authState');
        
        // Redirect to appropriate login page based on current location
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        } else if (window.location.pathname.includes('/mobile')) {
          window.location.href = '/mobile/login';
        } else {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default authenticatedAxios;