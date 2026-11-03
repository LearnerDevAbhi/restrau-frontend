import api from './api';

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export const menuService = {
  list: (filters = {}) => api.get('/menu', { params: clean(filters) }),
  get: (id) => api.get(`/menu/${id}`),
  create: (payload) => api.post('/menu', payload),
  update: (id, payload) => api.put(`/menu/${id}`, payload),
  remove: (id) => api.delete(`/menu/${id}`),
};
