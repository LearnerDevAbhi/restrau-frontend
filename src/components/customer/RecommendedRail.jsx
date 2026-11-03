import { Sparkles, Star } from 'lucide-react';
import { useT } from '../../hooks/useT';
import SmartImage from '../common/SmartImage';
import VegMark from '../common/VegMark';
import AddControl from './AddControl';

export default function RecommendedRail({ items, quantityOf, onQuantity, onOpen, canOrder, currency }) {
  const { t, pick, money } = useT();
  if (!items.length) return null;

  return (
    <section className="mt-2 bg-gradient-to-b from-brand-50 to-transparent py-5" aria-labelledby="recommended-title">
      <div className="flex items-center gap-2 px-4 sm:px-6">
        <Sparkles className="size-5 text-saffron" />
        <h2 id="recommended-title" className="font-display text-xl font-semibold">
          {t('menu.recommended')}
        </h2>
      </div>
      <div className="scrollbar-none mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6">
        {items.map((item, index) => {
          const name = pick(item.name);
          return (
            <article
              key={item.id}
              className="relative w-[232px] shrink-0 snap-start overflow-hidden rounded-2xl bg-paper shadow-card ring-1 ring-saffron/30"
            >
              <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
                <SmartImage src={item.imageUrl} alt={name} seed={item.name.en} eager={index < 2} className="aspect-[4/3] w-full" />
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                  <Star className="size-3 fill-saffron text-saffron" />
                  {t('menu.recommendedBadge')}
                </span>
                <div className="px-3 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="size-3.5" />
                    <h3 className="truncate text-[15px] font-semibold">{name}</h3>
                  </div>
                </div>
              </button>
              <div className="flex items-center justify-between px-3 pt-1 pb-3">
                <span className="font-semibold">{money(item.price, currency)}</span>
                {canOrder && <AddControl size="sm" quantity={quantityOf(item.id)} onChange={(q) => onQuantity(item, q)} />}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
