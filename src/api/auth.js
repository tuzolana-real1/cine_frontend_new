import api from './axios';
import { USER_TYPE } from '../constants/enums';

const mockUsers = {
  admin: {
    token: 'mock-token-admin',
    user: {
      id: 'admin',
      name: 'Administrador Comum',
      email: 'admin@local',
      role: USER_TYPE.VIEWER,
    },
  },
  root: {
    token: 'mock-token-root',
    user: {
      id: 'root',
      name: 'Estúdio Root',
      email: 'root@local',
      role: USER_TYPE.STUDIO,
    },
  },
};

const isMockLogin = (credentials) => {
  const key = credentials.email?.toLowerCase?.();
  return key && (key === 'admin' || key === 'root') && credentials.password === key;
};

export const authApi = {
  login: (credentials) => {
    if (isMockLogin(credentials)) {
      const key = credentials.email.toLowerCase();
      return Promise.resolve({ data: mockUsers[key] });
    }
    return api.post('/auth/login', credentials);
  },
  register: (data) => api.post('/auth/register', data),
  registerStudio: (data) => api.post('/studios/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};
