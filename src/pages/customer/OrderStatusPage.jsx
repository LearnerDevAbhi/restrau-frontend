import { Check, ChefHat, CircleCheckBig, ClipboardList, HandPlatter, Receipt, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ButtonLink } from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LanguageToggle from '../../components/common/LanguageToggle';
import { PageSpinner } from '../../components/common/Spinner';
import VegMark from '../../components/common/VegMark';
import { useTableSession } from '../../context/TableSessionContext';
import { usePolling } from '../../hooks/usePolling';
import { useT } from '../../hooks/useT';
import { orderService } from '../../services/orderService';
import { ACTIVE_STATUSES } from '../../utils/constants';
import { formatTime } from '../../utils/format';

const STEPS = [
  { status: 'PLACED', icon: ClipboardList },
  { status: 'ACCEPTED', icon: Check },
  { status: 'PREPARING', icon: ChefHat },
  { status: 'SERVED', icon: HandPlatter },
];

function StatusTracker({ status, t }) {
  const reached = status === 'COMPLETED' ? STEPS.length - 1 : STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((step, i) => {
        const done = i <= reached;
        const current = i === reached && status !== 'COMPLETED';
        const Icon = step.icon;
        return (
          <li key={step.status} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span className={`absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2 ${i <= reached ? 'bg-leaf' : 'bg-line'}`} aria-hidden />
            )}
            <span
              className={`relative z-10 grid size-10 place-items-center rounded-full border-2 transition-colors duration-500 ${
                done ? 'border-leaf bg-leaf text-white' : 'border-line bg-paper text-muted'
              } ${current ? 'ring-4 ring-leaf/20' : ''}`}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className={`mt-2 text-xs leading-tight font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{t(`status.${step.status}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderStatusPage() {
  const { id } = useParams();
  const location = useLocation();
  const session = useTableSession();
  const { t, pick, money, lang } = useT();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const justPlaced = Boolean(location.state?.justPlaced);

  const load = useCallback(() => {
    orderService
      .get(id)
      .then((o) => {
        setOrder(o);
        setError(null);
      })
      .catch(setError);
  }, [id]);

  useEffect(load, [load]);
  usePolling(load, 10_000, Boolean(order && ACTIVE_STATUSES.includes(order.status)));

  if (error && !order) {
    return <EmptyState icon={Receipt} title={t('order.notFound')} className="min-h-dvh justify-center" />;
  }
  if (!order) return <PageSpinner />;

  const currency = session.store?.currency ?? 'INR';
  const cancelled = order.status === 'CANCELLED';
  const canOrderMore = session.status === 'ready';

  return (
    <div className="px-4 pt-5 pb-12 sm:px-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="flex flex-col items-center pt-4 text-center">
        <div
          className={`grid size-20 place-items-center rounded-full ${cancelled ? 'bg-red-50 text-chili' : 'bg-green-50 text-leaf'} ${
            justPlaced ? 'animate-pop' : ''
          }`}
        >
          {cancelled ? <XCircle className="size-11" strokeWidth={1.8} /> : <CircleCheckBig className="size-11" strokeWidth={1.8} />}
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold">{cancelled ? t('status.CANCELLED') : t('order.successTitle')}</h1>
        <p className="mt-2 max-w-xs text-muted">{cancelled ? t('order.cancelledText') : t('order.successText')}</p>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-dashed border-line px-5 py-4 text-center">
          <p className="text-xs text-muted">{t('order.number')}</p>
          <p className="mt-1 text-lg font-bold tracking-wide tabular-nums">{order.orderNumber}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line text-center">
          <div className="px-3 py-4">
            <p className="text-xs text-muted">{t('order.table')}</p>
            <p className="mt-1 font-display text-2xl leading-none font-semibold">{order.table.tableNumber}</p>
          </div>
          <div className="px-3 py-4">
            <p className="text-xs text-muted">{t('order.placedAt')}</p>
            <p className="mt-1.5 font-bold">{formatTime(order.createdAt, lang)}</p>
          </div>
        </div>
      </div>

      {!cancelled && (
        <section className="card mt-4 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">{t('order.statusTitle')}</h2>
            {ACTIVE_STATUSES.includes(order.status) && (
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span className="size-2 animate-pulse rounded-full bg-leaf" />
                {t('order.liveUpdates')}
              </span>
            )}
          </div>
          <StatusTracker status={order.status} t={t} />
        </section>
      )}

      <section className="card mt-4 p-5">
        <h2 className="font-semibold">{t('order.items')}</h2>
        <ul className="mt-3 space-y-3">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex items-start gap-2.5 text-[15px]">
              <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="mt-1 size-3.5" />
              <span className="flex-1">
                {pick(item.name)} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium tabular-nums">{money(item.lineTotal, currency)}</span>
            </li>
          ))}
        </ul>
        {order.note && (
          <p className="mt-4 rounded-xl bg-cream px-3 py-2 text-sm">
            <span className="font-semibold">{t('order.note')}:</span> {order.note}
          </p>
        )}
        <div className="mt-4 flex justify-between border-t border-dashed border-line pt-3 text-lg font-bold">
          <span>{t('order.total')}</span>
          <span className="tabular-nums">{money(order.totalAmount, currency)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">{t('order.payAtCounter')}</p>
      </section>

      {canOrderMore && (
        <ButtonLink to={session.menuPath} viewTransition size="lg" variant="secondary" className="mt-6 w-full">
          {t('order.orderMore')}
        </ButtonLink>
      )}
    </div>
  );
}
