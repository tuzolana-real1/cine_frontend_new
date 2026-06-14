import api from './axios';

const mockEvents = [
  {
    id: 'mock-event-1',
    title: 'Festival de Cinema Luanda 2026',
    synopsis: 'Um grande festival que reúne cinema, documentários e sessões de streaming ao vivo de produções angolanas.',
    date: new Date(Date.now() - 3600 * 1000).toISOString(),
    location: 'Cinema Angola - Luanda',
    price: '1500',
    category: 'Cinema',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    streamUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'published',
  },
  {
    id: 'mock-event-2',
    title: 'Teatro ao Vivo: Contos de Luanda',
    synopsis: 'Uma noite de teatro ao vivo com atores angolanos e uma narrativa inspiradora sobre a cidade.',
    date: new Date(Date.now() + 86400 * 1000).toISOString(),
    location: 'Teatro Nacional de Luanda',
    price: '2500',
    category: 'Teatro',
    posterUrl: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=800&auto=format&fit=crop',
    status: 'published',
  },
];

const fallback = (data) => Promise.resolve({ data });

export const eventsApi = {
  getAll: (params) => api.get('/events', { params }).catch(() => fallback(mockEvents)),
  getById: (id) => api.get(`/events/${id}`).catch(() => {
    const event = mockEvents.find((item) => item.id === id) || mockEvents[0];
    return fallback(event);
  }),
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
