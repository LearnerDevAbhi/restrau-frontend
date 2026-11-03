import { MessageSquareText } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { CANCELLABLE, NEXT_STATUS } from '../../utils/constants';
import { formatTime, timeAgo } from '../../utils/format';
import { StatusBadge } from '../common/Badge';
import Button from '../common/Button';
import VegMark from '../common/VegMark';

export default function OrderCard({ order, currency, onAdvance, onCancel, busy }) {
  const { t, pick, money, lang } = useT();
  const next = NEXT_STATUS[order.status];
  const isNew = order.status === 'PLACED';

  return (
    <article className={`card flex flex-col overflow-hidden ${isNew ? 'ring-2 ring-amber-400/70' : ''}`}>
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <span className="font-display text-xl leading-none font-semibold">{order.table.tableNumber}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {t('orders.table')} {order.table.tableNumber}
              {order.table.tableName && <span className="font-normal text-muted"> · {order.table.tableName}</span>}
            </p>
            <p className="text-xs text-muted">
              {order.orderNumber} · <time title={formatTime(order.createdAt, lang)}>{timeAgo(order.createdAt, lang)}</time>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isNew && <span className="size-2 animate-pulse rounded-full bg-amber-500" />}
          <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
        </div>
      </header>

      <ul className="flex-1 space-y-1.5 px-4 py-3 text-sm">
        {order.items.map((item) => (
          <li key={item.menuItemId} className="flex items-start gap-2">
            <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="mt-1 size-3" />
            <span className="w-6 shrink-0 font-bold tabular-nums">{item.quantity}×</span>
            <span className="flex-1">{pick(item.name)}</span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mx-4 mb-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <MessageSquareText className="mt-0.5 size-4 shrink-0" />
          {order.note}
        </p>
      )}

      <footer className="flex items-center gap-2 border-t border-line bg-cream/50 px-4 py-3">
        <span className="mr-auto font-bold tabular-nums">{money(order.totalAmount, currency)}</span>
        {onCancel && CANCELLABLE.includes(order.status) && (
          <Button size="sm" variant="ghost" className="text-chili hover:bg-red-50" onClick={() => onCancel(order)} disabled={busy}>
            {t('orders.actions.CANCELLED')}
          </Button>
        )}
        {onAdvance && next && (
          <Button size="sm" variant={isNew ? 'primary' : 'dark'} onClick={() => onAdvance(order, next)} loading={busy}>
            {t(`orders.actions.${next}`)}
          </Button>
        )}
      </footer>
    </article>
  );
}
