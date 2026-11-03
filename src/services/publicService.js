import api from './api';

const MENU_TTL_MS = 60_000;
let menuCache = null; // { promise, at }

export const publicService = {
  validateTable: (qrToken) => api.get(`/public/tables/validate/${encodeURIComponent(qrToken)}`, { public: true }),

  /**
   * The menu is fetched once and shared across pages, so moving between the
   * menu and cart never waits on the network. Started in parallel with the
   * QR validation as soon as the app boots.
   */
  getMenu: ({ force = false } = {}) => {
    if (!force && menuCache && Date.now() - menuCache.at < MENU_TTL_MS) return menuCache.promise;
    const promise = api.get('/public/menu', { public: true });
    menuCache = { promise, at: Date.now() };
    promise.catch(() => {
      menuCache = null;
    });
    return promise;
  },
};
