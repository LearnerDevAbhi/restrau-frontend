import { Plus } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { haptic } from '../../utils/feedback';
import QuantityStepper from '../common/QuantityStepper';

/** "Add" button that turns into a quantity stepper once the dish is in the cart. */
export default function AddControl({ quantity, onChange, size = 'md' }) {
  const { t } = useT();
  const change = (q) => {
    haptic();
    onChange(q);
  };

  if (quantity > 0) {
    return (
      <div className="animate-pop">
        <QuantityStepper value={quantity} onChange={change} size={size === 'sm' ? 'sm' : 'md'} />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => change(1)}
      className={`inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-white font-bold text-brand-700 uppercase shadow-sm transition-colors hover:bg-brand-50 active:scale-95 ${
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-5 text-sm'
      }`}
    >
      {t('menu.add')}
      <Plus className="size-3.5" strokeWidth={3} />
    </button>
  );
}
