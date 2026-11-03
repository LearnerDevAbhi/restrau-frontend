import api from './api';

export const orderService = {
  /** Customer: only the QR token and item ids/quantities. Table and prices are resolved on the server. */
  place: ({ qrToken, items, note }) =>
    api.post(
      '/orders',
      { qrToken, items: items.map(({ id, quantity }) => ({ menuItemId: id, quantity })), ...(note && { note }) },
      { public: true },
    ),
  get: (id) => api.get(`/orders/${id}`, { public: true }),

  // Admin
  list: (params = {}) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};
