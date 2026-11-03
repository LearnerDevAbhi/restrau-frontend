import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }, { public: true }),
  me: () => api.get('/auth/me'),
};
