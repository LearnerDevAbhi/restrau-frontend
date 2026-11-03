import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useT } from '../../hooks/useT';

/** Floating cart summary. Shares a view-transition name with the cart page's order bar, so it morphs on navigation. */
export default function StickyCartBar({ currency }) {
  const { count, subtotal } = useCart();
  const { t, money } = useT();
  const barRef = useRef(null);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current && barRef.current) {
      barRef.current.classList.remove('animate-bump');
      void barRef.current.offsetWidth; // restart the animation
      barRef.current.classList.add('animate-bump');
    }
    previous.current = count;
  }, [count]);

  if (!count) return null;
  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pt-3">
      <div className="mx-auto max-w-3xl animate-slide-up">
        <Link
          ref={barRef}
          to="/cart"
          viewTransition
          style={{ viewTransitionName: 'cart-bar' }}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-brand-600 px-4 py-3 text-white shadow-lift transition-colors hover:bg-brand-700"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <ShoppingBag className="size-5" />
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-xs font-medium text-white/85">{t('cart.items', { count })}</span>
            <span className="block text-base font-bold">{money(subtotal, currency)}</span>
          </span>
          <span className="flex items-center gap-1 font-semibold">
            {t('cart.view')}
            <ChevronRight className="size-5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
