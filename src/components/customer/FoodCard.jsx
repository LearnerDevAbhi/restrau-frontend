import { Star } from 'lucide-react';
import { useT } from '../../hooks/useT';
import Badge from '../common/Badge';
import SmartImage from '../common/SmartImage';
import VegMark from '../common/VegMark';
import AddControl from './AddControl';

export default function FoodCard({ item, quantity, onQuantity, onOpen, canOrder, currency, eager }) {
  const { t, pick, money } = useT();
  const name = pick(item.name);
  const description = pick(item.description);

  return (
    <article className="flex gap-4 border-b border-line/80 py-5 last:border-b-0">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} />
          {item.isRecommended && (
            <Badge tone="amber" icon={Star}>
              {t('menu.recommendedBadge')}
            </Badge>
          )}
        </div>
        <h3 className="mt-1.5 text-[16px] leading-snug font-semibold text-ink">{name}</h3>
        <p className="mt-0.5 text-[15px] font-semibold text-ink/90">{money(item.price, currency)}</p>
        {description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{description}</p>}
      </button>

      <div className="relative w-[118px] shrink-0 pb-4">
        <button type="button" onClick={onOpen} className="block w-full" aria-label={name}>
          <SmartImage src={item.imageUrl} alt={name} seed={item.name.en} eager={eager} className="aspect-square w-full rounded-2xl" />
        </button>
        {canOrder && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <AddControl quantity={quantity} onChange={onQuantity} />
          </div>
        )}
      </div>
    </article>
  );
}
