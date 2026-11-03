import { useEffect, useState } from 'react';
import { useT } from '../../hooks/useT';
import { haptic } from '../../utils/feedback';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuantityStepper from '../common/QuantityStepper';
import SmartImage from '../common/SmartImage';
import VegMark from '../common/VegMark';
import { Star } from 'lucide-react';

/** Dish detail as a bottom sheet: big photo, full description and a quantity picker. */
export default function ItemSheet({ item, currentQuantity, onClose, onConfirm, canOrder, currency }) {
  const { t, pick, money } = useT();
  const [quantity, setQuantity] = useState(Math.max(1, currentQuantity));

  useEffect(() => {
    if (item) setQuantity(Math.max(1, currentQuantity));
  }, [item, currentQuantity]);

  if (!item) return null;
  const name = pick(item.name);
  const inCart = currentQuantity > 0;

  return (
    <Modal open={Boolean(item)} onClose={onClose} closeLabel={t('common.close')}>
      <div className="-mx-5 -mt-1 sm:-mx-6">
        <SmartImage src={item.imageUrl} alt={name} seed={item.name.en} eager className="aspect-[16/10] w-full" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} />
        {item.isRecommended && (
          <Badge tone="amber" icon={Star}>
            {t('menu.recommendedBadge')}
          </Badge>
        )}
      </div>
      <h2 className="mt-2 font-display text-2xl font-semibold">{name}</h2>
      <p className="mt-1 text-lg font-semibold">{money(item.price, currency)}</p>
      {pick(item.description) && <p className="mt-3 leading-relaxed text-muted">{pick(item.description)}</p>}

      {canOrder && (
        <div className="safe-bottom mt-6 flex items-center gap-3">
          <QuantityStepper value={quantity} onChange={(q) => setQuantity(Math.max(inCart ? 0 : 1, q))} size="lg" />
          <Button
            size="lg"
            className="flex-1"
            variant={inCart && quantity === 0 ? 'secondary' : 'primary'}
            onClick={() => {
              haptic();
              onConfirm(quantity);
            }}
          >
            {inCart && quantity === 0
              ? t('item.remove')
              : t(inCart ? 'item.updateOrder' : 'item.addToOrder', { price: money(item.price * quantity, currency) })}
          </Button>
        </div>
      )}
    </Modal>
  );
}
