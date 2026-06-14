import api from './axios';

export const eventsApi = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return api.post('/events', data, config);
  },
  uploadVideo: (eventId, data, config = {}) => {
    return api.put(`/events/${eventId}/video`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    });
  },
  update: (id, data) => {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return api.put(`/events/${id}`, data, config);
  },
  delete: (id) => api.delete(`/events/${id}`),
};
