import api from './axios';

export const reviewsApi = {
  // Reviews now belong to contents (Content -> reviews[])
  getByContentId: (contentId) => api.get(`/contents/${contentId}/reviews`),
  create: (contentId, data) => api.post(`/contents/${contentId}/reviews`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
