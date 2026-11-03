import { ArrowLeft, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button, { ButtonLink } from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { Textarea } from '../../components/common/Field';
import QuantityStepper from '../../components/common/QuantityStepper';
import SmartImage from '../../components/common/SmartImage';
import { PageSpinner } from '../../components/common/Spinner';
import VegMark from '../../components/common/VegMark';
import { TablePill } from '../../components/customer/MenuHeader';
import TableErrorScreen from '../../components/customer/TableErrorScreen';
import { useCart } from '../../context/CartContext';
import { useTableSession } from '../../context/TableSessionContext';
import { useToast } from '../../context/ToastContext';
import { useT } from '../../hooks/useT';
import { orderService } from '../../services/orderService';
import { publicService } from '../../services/publicService';
import { errorMessage } from '../../utils/errors';
import { haptic } from '../../utils/feedback';

export default function CartPage() {
  const session = useTableSession();
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { t, pick, money, lang } = useT();
  const [placing, setPlacing] = useState(false);
  // Snapshot shown while navigating away after a successful order, so the
  // page transition never flashes an empty cart
  const [frozen, setFrozen] = useState(null);

  if (session.status === 'missing') return <TableErrorScreen code="MISSING" />;
  if (session.status === 'error') return <TableErrorScreen code={session.errorCode} onRetry={session.retry} />;
  if (session.status === 'loading') return <PageSpinner />;

  const view = frozen ?? { items: cart.items, subtotal: cart.subtotal };
  const currency = session.store?.currency ?? 'INR';
  const accepting = session.store?.isAcceptingOrders !== false;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const order = await orderService.place({ qrToken: session.token, items: cart.items, note: cart.note.trim() });
      haptic(30);
      setFrozen({ items: cart.items, subtotal: cart.subtotal });
      cart.clear();
      navigate(`/order/${order.id}`, { replace: true, viewTransition: true, state: { justPlaced: true } });
    } catch (error) {
      if (error.code === 'ITEMS_UNAVAILABLE') {
        cart.removeMany(error.details?.menuItemIds ?? []);
        publicService.getMenu({ force: true }).catch(() => {});
        toast.error(t('cart.itemsRemoved'));
      } else if (error.code === 'INVALID_TABLE' || error.code === 'TABLE_INACTIVE') {
        session.invalidate(error.code);
      } else {
        if (error.code === 'STORE_CLOSED') session.updateStore({ ...session.store, isAcceptingOrders: false });
        toast.error(errorMessage(error, t, lang));
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pb-36">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line/60 bg-cream/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link
          to={session.menuPath}
          viewTransition
          className="grid size-10 place-items-center rounded-xl hover:bg-ink/5"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="flex-1 font-display text-xl font-semibold">{t('cart.title')}</h1>
      </header>

      <div className="px-4 pt-4 sm:px-6">
        <TablePill table={session.table} />
      </div>

      {view.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.emptyTitle')}
          text={t('cart.emptyText')}
          action={
            <ButtonLink to={session.menuPath} viewTransition>
              {t('cart.browse')}
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-4 px-4 pt-4 sm:px-6">
          <ul className="card divide-y divide-line/80">
            {view.items.map((item) => {
              const name = pick(item.name);
              return (
                <li key={item.id} className="flex gap-3 p-4">
                  <SmartImage src={item.imageUrl} alt={name} seed={item.name.en} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                      <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="mt-1 size-3.5" />
                      <p className="leading-snug font-semibold">{name}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{money(item.price, currency)}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <QuantityStepper value={item.quantity} onChange={(q) => cart.setQuantity(item, q)} size="sm" />
                      <button
                        onClick={() => cart.setQuantity(item, 0)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-red-50 hover:text-chili"
                      >
                        <Trash2 className="size-3.5" />
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold tabular-nums">{money(item.price * item.quantity, currency)}</p>
                </li>
              );
            })}
            <li>
              <Link
                to={session.menuPath}
                viewTransition
                className="flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50/60"
              >
                <Plus className="size-4" />
                {t('cart.addMore')}
              </Link>
            </li>
          </ul>

          <div className="card p-4">
            <Textarea
              label={t('cart.noteLabel')}
              optionalLabel={t('common.optional')}
              placeholder={t('cart.notePlaceholder')}
              maxLength={300}
              value={cart.note}
              onChange={(e) => cart.setNote(e.target.value)}
            />
          </div>

          <div className="card space-y-2 p-4">
            <div className="flex justify-between text-sm text-muted">
              <span>{t('cart.itemTotal')}</span>
              <span className="tabular-nums">{money(view.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-line pt-2 text-lg font-bold">
              <span>{t('cart.toPay')}</span>
              <span className="tabular-nums">{money(view.subtotal, currency)}</span>
            </div>
            <p className="pt-1 text-xs text-muted">{t('cart.priceNote')}</p>
            <p className="text-xs text-muted">{t('cart.payNote')}</p>
          </div>
        </div>
      )}

      {view.items.length > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-cream/95 px-3 pt-3 backdrop-blur-md">
          <div className="mx-auto max-w-3xl" style={{ viewTransitionName: 'cart-bar' }}>
            {!accepting && <p className="mb-2 text-center text-sm font-medium text-amber-800">{t('menu.closedText')}</p>}
            <Button size="lg" className="w-full !h-14 rounded-2xl text-base" loading={placing} disabled={!accepting} onClick={placeOrder}>
              {placing ? t('cart.placing') : `${t('cart.placeOrder')} · ${money(view.subtotal, currency)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
