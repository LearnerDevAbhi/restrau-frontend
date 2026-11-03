import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { publicService } from '../services/publicService';

const TOKEN_KEY = 'qr.token';
const TableSessionContext = createContext(null);

/**
 * Holds the table context for the whole customer journey. The QR token is read
 * from `?table=` once, remembered for the tab, and validated by the server.
 * The browser never knows the table's database id.
 */
export function TableSessionProvider({ children }) {
  const location = useLocation();
  const urlToken = new URLSearchParams(location.search).get('table');
  const [token, setToken] = useState(() => urlToken || sessionStorage.getItem(TOKEN_KEY));
  const [state, setState] = useState({ status: token ? 'loading' : 'missing', table: null, store: null, errorCode: null });
  const [attempt, setAttempt] = useState(0);

  // A fresh scan (new ?table=) always wins over the remembered token
  useEffect(() => {
    if (urlToken && urlToken !== token) setToken(urlToken);
  }, [urlToken, token]);

  useEffect(() => {
    if (!token) {
      setState({ status: 'missing', table: null, store: null, errorCode: 'MISSING' });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    publicService.getMenu().catch(() => {}); // warm the menu in parallel with validation

    publicService
      .validateTable(token)
      .then(({ table, store }) => {
        if (cancelled) return;
        sessionStorage.setItem(TOKEN_KEY, token);
        setState({ status: 'ready', table, store, errorCode: null });
      })
      .catch((error) => {
        if (cancelled) return;
        const errorCode = ['INVALID_TABLE', 'TABLE_INACTIVE'].includes(error.code) ? error.code : 'NETWORK';
        if (errorCode !== 'NETWORK') sessionStorage.removeItem(TOKEN_KEY);
        setState({ status: 'error', table: null, store: null, errorCode });
      });
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  /** Called when the server rejects an order because the table became invalid. */
  const invalidate = useCallback((errorCode) => {
    sessionStorage.removeItem(TOKEN_KEY);
    setState({ status: 'error', table: null, store: null, errorCode });
  }, []);

  const updateStore = useCallback((store) => setState((s) => ({ ...s, store })), []);

  const value = useMemo(
    () => ({ token, ...state, retry, invalidate, updateStore, menuPath: token ? `/menu?table=${encodeURIComponent(token)}` : '/' }),
    [token, state, retry, invalidate, updateStore],
  );

  return <TableSessionContext.Provider value={value}>{children}</TableSessionContext.Provider>;
}

export const useTableSession = () => useContext(TableSessionContext);
