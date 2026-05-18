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

axios.interceptors.response.use(
  (response) => {
    console.log('[Axios] Response from:', response.config.url, 'status:', response.status);
    return response;
  },
  (error) => {
    console.log('[Axios] Error from:', error.config?.url, 'status:', error.response?.status);
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
    <App />
)
