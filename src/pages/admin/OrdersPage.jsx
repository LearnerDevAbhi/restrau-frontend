import { RefreshCw, ReceiptText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import OrderCard from '../../components/admin/OrderCard';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { Select } from '../../components/common/Field';
import { PageSpinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { usePolling } from '../../hooks/usePolling';
import { useT } from '../../hooks/useT';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import { ACTIVE_STATUSES } from '../../utils/constants';
import { errorMessage } from '../../utils/errors';

const PAGE_SIZE = 30;
const ALL_STATUSES = ['PLACED', 'ACCEPTED', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'];

export default function OrdersPage() {
  const { store } = useOutletContext();
  const { t, lang } = useT();
  const toast = useToast();
  const [tab, setTab] = useState('live');
  const [tableId, setTableId] = useState('');
  const [status, setStatus] = useState('');
  const [mobileColumn, setMobileColumn] = useState('PLACED');
  const [tables, setTables] = useState([]);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [busyId, setBusyId] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const currency = store?.currency ?? 'INR';

  useEffect(() => {
    tableService.list().then(setTables).catch(() => {});
  }, []);

  const query = useMemo(() => {
    if (tab === 'live') return { status: 'active', limit: 200, tableId };
    return { status: status || undefined, date: tab === 'today' ? 'today' : undefined, limit, tableId };
  }, [tab, status, limit, tableId]);

  const load = useCallback(() => {
    const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v));
    return orderService
      .list(params)
      .then(setData)
      .catch((e) => toast.error(errorMessage(e, t, lang)));
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);
  usePolling(load, 8_000, tab !== 'history');

  useEffect(() => {
    window.addEventListener('orders:new', load);
    return () => window.removeEventListener('orders:new', load);
  }, [load]);

  const changeStatus = async (order, next) => {
    setBusyId(order.id);
    try {
      const updated = await orderService.updateStatus(order.id, next);
      setData((d) => ({ ...d, items: d.items.map((o) => (o.id === updated.id ? updated : o)) }));
      toast.success(t('orders.statusUpdated', { number: updated.orderNumber, status: t(`status.${next}`) }));
      window.dispatchEvent(new CustomEvent('orders:changed'));
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
      load();
    } finally {
      setBusyId(null);
    }
  };

  const orders = data?.items ?? [];
  const columns = ACTIVE_STATUSES.map((s) => ({ status: s, orders: orders.filter((o) => o.status === s) }));

  const tabButton = (key) => (
    <button
      key={key}
      onClick={() => {
        setTab(key);
        setLimit(PAGE_SIZE);
        setData(null);
      }}
      aria-pressed={tab === key}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${tab === key ? 'bg-paper text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
    >
      {t(`orders.tabs.${key}`)}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={load}>
            {t('common.refresh')}
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex self-start rounded-xl bg-ink/5 p-1">{['live', 'today', 'history'].map(tabButton)}</div>
        <div className="flex gap-2 sm:ml-auto">
          <Select value={tableId} onChange={(e) => setTableId(e.target.value)} className="min-w-40">
            <option value="">{t('orders.allTables')}</option>
            {tables.map((tb) => (
              <option key={tb.id} value={tb.id}>
                {t('table.label', { number: tb.tableNumber })}
              </option>
            ))}
          </Select>
          {tab !== 'live' && (
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="min-w-40">
              <option value="">{t('orders.allStatuses')}</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {!data ? (
        <PageSpinner />
      ) : tab === 'live' ? (
        orders.length === 0 ? (
          <div className="card">
            <EmptyState icon={ReceiptText} title={t('orders.empty')} text={t('orders.emptyLive')} />
          </div>
        ) : (
          <>
            {/* Phones: one column at a time */}
            <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {columns.map((c) => (
                <button
                  key={c.status}
                  onClick={() => setMobileColumn(c.status)}
                  aria-pressed={mobileColumn === c.status}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                    mobileColumn === c.status ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink/80'
                  }`}
                >
                  {t(`orders.columns.${c.status}`)}
                  <span className={`rounded-full px-1.5 text-xs ${mobileColumn === c.status ? 'bg-white/20' : 'bg-ink/5'}`}>{c.orders.length}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-4">
              {columns.map((c) => (
                <section key={c.status} className={`${mobileColumn === c.status ? 'block' : 'hidden'} lg:block`}>
                  <h2 className="mb-3 hidden items-center gap-2 text-sm font-semibold text-muted lg:flex">
                    {t(`orders.columns.${c.status}`)}
                    <span className="rounded-full bg-ink/5 px-2 text-xs text-ink">{c.orders.length}</span>
                  </h2>
                  <div className="space-y-4">
                    {c.orders.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{t('orders.columnEmpty')}</p>
                    ) : (
                      c.orders
                        .slice()
                        .reverse()
                        .map((o) => (
                          <OrderCard
                            key={o.id}
                            order={o}
                            currency={currency}
                            busy={busyId === o.id}
                            onAdvance={changeStatus}
                            onCancel={setCancelling}
                          />
                        ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        )
      ) : orders.length === 0 ? (
        <div className="card">
          <EmptyState icon={ReceiptText} title={t('orders.empty')} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} currency={currency} busy={busyId === o.id} onAdvance={changeStatus} onCancel={setCancelling} />
            ))}
          </div>
          {data.total > orders.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                {t('orders.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(cancelling)}
        title={t('orders.cancelTitle', { number: cancelling?.orderNumber })}
        message={t('orders.cancelText')}
        confirmLabel={t('orders.cancelConfirm')}
        loading={busyId === cancelling?.id}
        onClose={() => setCancelling(null)}
        onConfirm={async () => {
          await changeStatus(cancelling, 'CANCELLED');
          setCancelling(null);
        }}
      />
    </div>
  );
}
