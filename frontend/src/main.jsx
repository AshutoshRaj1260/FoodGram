import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'

// Configure axios FIRST - before any other imports use it
axios.defaults.withCredentials = true;

// Add debug interceptor
axios.interceptors.request.use((config) => {
  console.log('[Axios] Request to:', config.url, 'with credentials:', config.withCredentials);
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh-token');
        isRefreshing = false;
        processQueue(null);
        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // If refresh fails, you might want to redirect to login
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.log('[Axios] Error from:', error.config?.url, 'status:', error.response?.status);
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
    <App />
)
