import { Clock, SearchX, UtensilsCrossed } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import CategoryChips from '../../components/customer/CategoryChips';
import FoodCard from '../../components/customer/FoodCard';
import ItemSheet from '../../components/customer/ItemSheet';
import MenuHeader from '../../components/customer/MenuHeader';
import MenuSkeleton from '../../components/customer/MenuSkeleton';
import RecommendedRail from '../../components/customer/RecommendedRail';
import SearchBar from '../../components/customer/SearchBar';
import StickyCartBar from '../../components/customer/StickyCartBar';
import TableErrorScreen from '../../components/customer/TableErrorScreen';
import { useCart } from '../../context/CartContext';
import { useTableSession } from '../../context/TableSessionContext';
import { useT } from '../../hooks/useT';
import { publicService } from '../../services/publicService';

const normalize = (s) => (s || '').toLocaleLowerCase().normalize('NFKC');

export default function MenuPage() {
  const session = useTableSession();
  const cart = useCart();
  const { t, pick } = useT();
  const [menu, setMenu] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openItem, setOpenItem] = useState(null);
  const listTopRef = useRef(null);
  const deferredQuery = useDeferredValue(query);
  const { reconcile } = cart;
  const { updateStore } = session;

  const load = useCallback(
    (force = false) => {
      setLoadError(false);
      publicService
        .getMenu({ force })
        .then((data) => {
          setMenu(data);
          reconcile(data.items);
          updateStore(data.store);
        })
        .catch(() => setLoadError(true));
    },
    [reconcile, updateStore],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.title = pick(session.store?.name) || 'Menu';
  }, [session.store, pick]);

  const categories = useMemo(() => (menu?.categories ?? []).map((c) => ({ id: c.id, label: pick(c.name) })), [menu, pick]);

  const results = useMemo(() => {
    if (!menu) return [];
    const q = normalize(deferredQuery.trim());
    return menu.items.filter((item) => {
      if (category !== 'all' && item.categoryId !== category) return false;
      if (!q) return true;
      return [item.name.en, item.name.hi, item.description.en, item.description.hi].some((text) => normalize(text).includes(q));
    });
  }, [menu, deferredQuery, category]);

  const sections = useMemo(() => {
    if (!menu) return [];
    return categories
      .map((c) => ({ ...c, items: results.filter((i) => i.categoryId === c.id) }))
      .filter((s) => s.items.length);
  }, [categories, results, menu]);

  if (session.status === 'error') return <TableErrorScreen code={session.errorCode} onRetry={session.retry} />;
  if (session.status === 'missing') return <TableErrorScreen code="MISSING" />;

  const store = menu?.store ?? session.store;
  const currency = store?.currency ?? 'INR';
  const canOrder = session.status === 'ready' && store?.isAcceptingOrders !== false;
  const searching = deferredQuery.trim().length > 0;
  const showRail = !searching && category === 'all' && menu?.recommended.length > 0;
  let eagerBudget = showRail ? 0 : 3;

  const changeCategory = (id) => {
    setCategory(id);
    const top = listTopRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) listTopRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pb-32">
      <MenuHeader store={store} table={session.table} />

      {store && !store.isAcceptingOrders && (
        <div className="mx-4 mb-2 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:mx-6">
          <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">{t('menu.closedTitle')}</p>
            <p className="text-sm text-amber-800">{t('menu.closedText')}</p>
          </div>
        </div>
      )}

      <div ref={listTopRef} className="sticky top-0 z-20 space-y-3 border-b border-line/60 bg-cream/90 px-4 pt-3 pb-3 backdrop-blur-md sm:px-6">
        <SearchBar value={query} onChange={setQuery} placeholder={t('menu.searchPlaceholder')} clearLabel={t('menu.clearSearch')} />
        {categories.length > 0 && <CategoryChips categories={categories} active={category} onChange={changeCategory} allLabel={t('menu.all')} />}
      </div>

      {!menu && !loadError && <MenuSkeleton />}

      {loadError && (
        <EmptyState
          icon={UtensilsCrossed}
          title={t('menu.loadError')}
          action={<Button onClick={() => load(true)}>{t('common.retry')}</Button>}
        />
      )}

      {menu && menu.items.length === 0 && <EmptyState icon={UtensilsCrossed} title={t('menu.emptyTitle')} text={t('menu.emptyText')} />}

      {menu && menu.items.length > 0 && (
        <div className="animate-fade-in">
          {showRail && (
            <RecommendedRail
              items={menu.recommended}
              quantityOf={cart.quantityOf}
              onQuantity={cart.setQuantity}
              onOpen={setOpenItem}
              canOrder={canOrder}
              currency={currency}
            />
          )}

          {searching && results.length > 0 && (
            <p className="px-4 pt-4 text-sm font-medium text-muted sm:px-6">{t('menu.results', { count: results.length })}</p>
          )}

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('menu.noResultsTitle')}
              text={t('menu.noResultsText')}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setCategory('all');
                  }}
                >
                  {t('menu.clearSearch')}
                </Button>
              }
            />
          ) : (
            sections.map((section) => (
              <section key={section.id} className="px-4 pt-6 sm:px-6" aria-labelledby={`cat-${section.id}`}>
                <h2 id={`cat-${section.id}`} className="flex items-baseline gap-2 font-display text-xl font-semibold">
                  {section.label}
                  <span className="font-sans text-sm font-medium text-muted">{section.items.length}</span>
                </h2>
                <div>
                  {section.items.map((item) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      quantity={cart.quantityOf(item.id)}
                      onQuantity={(q) => cart.setQuantity(item, q)}
                      onOpen={() => setOpenItem(item)}
                      canOrder={canOrder}
                      currency={currency}
                      eager={eagerBudget-- > 0}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      <ItemSheet
        item={openItem}
        currentQuantity={openItem ? cart.quantityOf(openItem.id) : 0}
        canOrder={canOrder}
        currency={currency}
        onClose={() => setOpenItem(null)}
        onConfirm={(q) => {
          cart.setQuantity(openItem, q);
          setOpenItem(null);
        }}
      />

      {canOrder && <StickyCartBar currency={currency} />}
    </div>
  );
}
