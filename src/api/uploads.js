import api from './axios';

export const uploadsApi = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVideo: (formData) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
