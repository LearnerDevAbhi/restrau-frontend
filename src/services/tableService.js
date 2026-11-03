import api from './api';

export const tableService = {
  list: () => api.get('/tables'),
  create: (payload) => api.post('/tables', payload),
  update: (id, payload) => api.put(`/tables/${id}`, payload),
  remove: (id) => api.delete(`/tables/${id}`),
  getQr: (id) => api.get(`/tables/${id}/qr`),
  regenerateQr: (id) => api.post(`/tables/${id}/regenerate-qr`),
};
