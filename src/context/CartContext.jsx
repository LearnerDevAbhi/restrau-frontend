import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MAX_QTY } from '../utils/constants';
import { useTableSession } from './TableSessionContext';

const CartContext = createContext(null);
const TTL_MS = 6 * 60 * 60 * 1000; // a forgotten cart from yesterday should not reappear
const keyFor = (token) => `cart:${token}`;

function loadCart(token) {
  if (!token) return { items: [], note: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(token)));
    if (saved && Date.now() - saved.savedAt < TTL_MS) return { items: saved.items || [], note: saved.note || '' };
  } catch {
    /* corrupted entry */
  }
  return { items: [], note: '' };
}

/**
 * Cart lives in localStorage per table token, so a refresh, a back swipe or
 * the browser being killed in the background never loses the order.
 * Prices here are for display only; the server recalculates everything.
 */
export function CartProvider({ children }) {
  const { token } = useTableSession();
  const [cart, setCart] = useState(() => loadCart(token));

  useEffect(() => setCart(loadCart(token)), [token]);

  useEffect(() => {
    if (!token) return;
    if (cart.items.length || cart.note) {
      localStorage.setItem(keyFor(token), JSON.stringify({ ...cart, savedAt: Date.now() }));
    } else {
      localStorage.removeItem(keyFor(token));
    }
  }, [cart, token]);

  const setQuantity = useCallback((menuItem, quantity) => {
    setCart((c) => {
      const q = Math.max(0, Math.min(MAX_QTY, quantity));
      const exists = c.items.some((i) => i.id === menuItem.id);
      let items;
      if (q === 0) items = c.items.filter((i) => i.id !== menuItem.id);
      else if (exists) items = c.items.map((i) => (i.id === menuItem.id ? { ...i, quantity: q } : i));
      else {
        const { id, name, price, imageUrl, isVeg } = menuItem;
        items = [...c.items, { id, name, price, imageUrl, isVeg, quantity: q }];
      }
      return { ...c, items };
    });
  }, []);

  const quantityOf = useCallback((id) => cart.items.find((i) => i.id === id)?.quantity ?? 0, [cart.items]);

  /** Keep cart prices/names in sync with the latest menu and drop items that disappeared. */
  const reconcile = useCallback((menuItems) => {
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    setCart((c) => {
      let changed = false;
      const items = c.items.flatMap((i) => {
        const fresh = byId.get(i.id);
        if (!fresh) {
          changed = true;
          return [];
        }
        if (fresh.price !== i.price || fresh.imageUrl !== i.imageUrl || fresh.name.en !== i.name.en || fresh.name.hi !== i.name.hi) {
          changed = true;
          return [{ ...i, price: fresh.price, imageUrl: fresh.imageUrl, name: fresh.name, isVeg: fresh.isVeg }];
        }
        return [i];
      });
      return changed ? { ...c, items } : c;
    });
  }, []);

  const removeMany = useCallback((ids) => setCart((c) => ({ ...c, items: c.items.filter((i) => !ids.includes(i.id)) })), []);
  const setNote = useCallback((note) => setCart((c) => ({ ...c, note })), []);
  const clear = useCallback(() => setCart({ items: [], note: '' }), []);

  const value = useMemo(() => {
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100;
    return { items: cart.items, note: cart.note, count, subtotal, setQuantity, quantityOf, reconcile, removeMany, setNote, clear };
  }, [cart, setQuantity, quantityOf, reconcile, removeMany, setNote, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
