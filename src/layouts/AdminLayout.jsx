import { ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, QrCode, ReceiptText, Store, Tags, UtensilsCrossed, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import LanguageToggle from '../components/common/LanguageToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';
import { useT } from '../hooks/useT';
import { orderService } from '../services/orderService';
import { storeService } from '../services/storeService';
import { chime } from '../utils/feedback';

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, key: 'dashboard' },
  { to: '/admin/orders', icon: ReceiptText, key: 'orders', badge: true },
  { to: '/admin/menu', icon: UtensilsCrossed, key: 'menu' },
  { to: '/admin/categories', icon: Tags, key: 'categories' },
  { to: '/admin/tables', icon: QrCode, key: 'tables' },
  { to: '/admin/store', icon: Store, key: 'store' },
];

function Sidebar({ store, liveCount, onNavigate }) {
  const { admin, logout } = useAuth();
  const { t, pick } = useT();
  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center gap-3 px-5 pt-6 pb-8">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 font-display text-lg font-semibold">
          {[...(pick(store?.name) || 'R')][0]}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight font-semibold">{pick(store?.name) || '…'}</p>
          <p className="text-xs text-white/50">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, end, icon: Icon, key, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="size-[18px]" />
            <span className="flex-1">{t(`nav.${key}`)}</span>
            {badge && liveCount > 0 && (
              <span className="grid min-w-6 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">{liveCount}</span>
            )}
          </NavLink>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-[18px]" />
          {t('nav.customerSite')}
        </a>
      </nav>
      <div className="space-y-4 border-t border-white/10 p-4">
        <LanguageToggle tone="dark" />
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">{admin?.name?.[0] ?? 'A'}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{admin?.name}</p>
            <p className="truncate text-xs text-white/50">{admin?.email}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label={t('common.logout')} title={t('common.logout')}>
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { t, pick } = useT();
  const toast = useToast();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [store, setStore] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const seenPlaced = useRef(null);

  useEffect(() => {
    storeService.get().then(setStore).catch(() => {});
  }, []);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // Live order badge + a chime and toast whenever a table places a new order, on any admin page
  const checkOrders = useCallback(() => {
    orderService
      .list({ status: 'active', limit: 100 })
      .then(({ items, total }) => {
        setLiveCount(total);
        const placed = items.filter((o) => o.status === 'PLACED');
        if (seenPlaced.current) {
          const fresh = placed.filter((o) => !seenPlaced.current.has(o.id));
          if (fresh.length) {
            chime();
            fresh.forEach((o) => toast.info(t('orders.newOrderToast', { table: o.table.tableNumber })));
            window.dispatchEvent(new CustomEvent('orders:new'));
          }
        }
        seenPlaced.current = new Set(placed.map((o) => o.id));
      })
      .catch(() => {});
  }, [t, toast]);

  useEffect(checkOrders, []); // eslint-disable-line react-hooks/exhaustive-deps
  usePolling(checkOrders, 10_000);

  useEffect(() => {
    const onOrdersChanged = () => checkOrders();
    const onStoreChanged = (e) => setStore(e.detail);
    window.addEventListener('orders:changed', onOrdersChanged);
    window.addEventListener('store:changed', onStoreChanged);
    return () => {
      window.removeEventListener('orders:changed', onOrdersChanged);
      window.removeEventListener('store:changed', onStoreChanged);
    };
  }, [checkOrders]);

  useEffect(() => {
    document.title = `${liveCount ? `(${liveCount}) ` : ''}${pick(store?.name) || 'Admin'}`;
  }, [liveCount, store, pick]);

  return (
    <div className="min-h-dvh bg-cream lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar store={store} liveCount={liveCount} />
      </aside>

      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setDrawerOpen(true)} className="rounded-lg p-1.5 hover:bg-ink/5" aria-label={t('nav.openMenu')}>
          <MenuIcon className="size-6" />
        </button>
        <p className="flex-1 truncate font-display text-lg font-semibold">{pick(store?.name)}</p>
        {liveCount > 0 && (
          <NavLink to="/admin/orders" className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
            {liveCount} {t('orders.tabs.live')}
          </NavLink>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-[slide-in_0.25s_ease-out] shadow-lift">
            <Sidebar store={store} liveCount={liveCount} onNavigate={() => setDrawerOpen(false)} />
            <button onClick={() => setDrawerOpen(false)} className="absolute top-5 right-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10" aria-label={t('common.close')}>
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Outlet context={{ store, setStore }} />
      </main>
    </div>
  );
}
