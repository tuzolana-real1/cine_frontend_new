import api from './axios';

const mockContents = [];

const fallback = (data) => Promise.resolve({ data });

export const contentsApi = {
  getAll: (params) => api.get('/contents', { params }).catch(() => fallback({ contents: mockContents })),
  getById: (id) => api.get(`/contents/${id}`).catch(() => {
    const item = mockContents.find((c) => c.id === id) || mockContents[0] || null;
    return fallback(item);
  }),
  create: (data) => {
    // Backend expects only JSON with URLs (no multipart)
    return api.post('/contents', data);
  },
  update: (id, data) => api.put(`/contents/${id}`, data),
  delete: (id) => api.delete(`/contents/${id}`),
};

export default contentsApi;
