import { Minus, Plus } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { MAX_QTY } from '../../utils/constants';

export default function QuantityStepper({ value, onChange, size = 'md', disabled }) {
  const { t } = useT();
  const s = size === 'sm' ? 'h-8 text-sm' : size === 'lg' ? 'h-12 text-base' : 'h-9 text-sm';
  const btn = size === 'lg' ? 'w-12' : size === 'sm' ? 'w-8' : 'w-9';
  return (
    <div className={`inline-flex items-center rounded-xl bg-brand-600 font-bold text-white shadow-sm ${s}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled}
        aria-label={t('item.decrease')}
        className={`grid h-full ${btn} place-items-center rounded-l-xl transition-colors hover:bg-brand-700 active:bg-brand-800`}
      >
        <Minus className="size-4" strokeWidth={3} />
      </button>
      <span className="min-w-6 text-center tabular-nums" aria-live="polite" aria-label={t('item.quantity')}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= MAX_QTY}
        aria-label={t('item.increase')}
        className={`grid h-full ${btn} place-items-center rounded-r-xl transition-colors hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50`}
      >
        <Plus className="size-4" strokeWidth={3} />
      </button>
    </div>
  );
}
