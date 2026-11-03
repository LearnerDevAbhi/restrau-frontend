import api from './api';

export const storeService = {
  get: () => api.get('/store'),
  update: (payload) => api.put('/store', payload),
};

export const dashboardService = {
  summary: () => api.get('/dashboard/summary'),
};
