import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const retryRequest = async (error) => {
  const { config } = error;
  if (!config || config.__retryCount >= 2) {
    return Promise.reject(error);
  }

  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;

  await new Promise((resolve) => setTimeout(resolve, 500 * config.__retryCount));
  return api(config);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/entrar';
    }
    return retryRequest(error);
  }
);

export default api;
