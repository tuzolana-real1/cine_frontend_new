import api from './axios';

export const reviewsApi = {
  getByEventId: (eventId) => api.get(`/events/${eventId}/reviews`),
  create: (eventId, data) => api.post(`/events/${eventId}/reviews`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
