import { ArrowRight, Flame, IndianRupee, Plus, QrCode, ReceiptText, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { ButtonLink } from '../../components/common/Button';
import { PageSpinner } from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { useT } from '../../hooks/useT';
import { dashboardService } from '../../services/storeService';
import { timeAgo } from '../../utils/format';

export default function DashboardPage() {
  const { admin } = useAuth();
  const { store } = useOutletContext();
  const { t, money, lang } = useT();
  const [summary, setSummary] = useState(null);
  const currency = store?.currency ?? 'INR';

  const load = useCallback(() => dashboardService.summary().then(setSummary).catch(() => {}), []);
  useEffect(() => {
    load();
  }, [load]);
  usePolling(load, 15_000);

  if (!summary) return <PageSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('dashboard.greeting', { name: admin?.name?.split(' ')[0] ?? '' })} subtitle={t('dashboard.subtitle')} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={ReceiptText} label={t('dashboard.todayOrders')} value={summary.today.orders} />
        <StatCard icon={IndianRupee} tone="green" label={t('dashboard.todayRevenue')} value={money(summary.today.revenue, currency)} />
        <StatCard icon={Flame} tone="amber" label={t('dashboard.activeOrders')} value={summary.activeOrders} />
        <StatCard icon={TrendingUp} tone="violet" label={t('dashboard.avgOrder')} value={money(summary.today.averageOrderValue, currency)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">{t('dashboard.recentOrders')}</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              {t('dashboard.viewAll')} <ArrowRight className="size-4" />
            </Link>
          </div>
          {summary.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">{t('dashboard.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {summary.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink font-display font-semibold text-white">
                    {o.table.tableNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {t('orders.items', { count: o.items.reduce((s, i) => s + i.quantity, 0) })} · {timeAgo(o.createdAt, lang)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} label={t(`status.${o.status}`)} />
                  <span className="hidden w-20 text-right text-sm font-semibold tabular-nums sm:block">{money(o.totalAmount, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="card space-y-3 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UtensilsCrossed className="size-[18px]" />
              </span>
              <div className="text-sm">
                <p className="font-semibold">{t('dashboard.menuItems', summary.menu)}</p>
                <p className="text-muted">{t('dashboard.recommendedItems', { count: summary.menu.recommended })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <QrCode className="size-[18px]" />
              </span>
              <p className="text-sm font-semibold">{t('dashboard.tablesActive', summary.tables)}</p>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted">{t('dashboard.quickActions')}</h2>
            <div className="grid gap-2">
              <ButtonLink to="/admin/orders" icon={Flame}>
                {t('dashboard.liveOrders')}
              </ButtonLink>
              <ButtonLink to="/admin/menu?new=1" variant="secondary" icon={Plus}>
                {t('dashboard.addItem')}
              </ButtonLink>
              <ButtonLink to="/admin/tables?new=1" variant="secondary" icon={Plus}>
                {t('dashboard.addTable')}
              </ButtonLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
