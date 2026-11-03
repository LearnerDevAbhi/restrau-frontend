import { Pencil, Plus, Search, Star, Tags, Trash2, UtensilsCrossed } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import MenuItemForm from '../../components/admin/MenuItemForm';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/common/Badge';
import Button, { ButtonLink } from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { Input, Select } from '../../components/common/Field';
import SmartImage from '../../components/common/SmartImage';
import { PageSpinner } from '../../components/common/Spinner';
import Toggle from '../../components/common/Toggle';
import VegMark from '../../components/common/VegMark';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useT } from '../../hooks/useT';
import { categoryService } from '../../services/categoryService';
import { menuService } from '../../services/menuService';
import { errorMessage } from '../../utils/errors';

const NO_FILTERS = { search: '', category: '', availability: '', recommended: '' };

function RecommendedButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg transition-colors ${active ? 'text-saffron hover:bg-amber-50' : 'text-line hover:bg-ink/5 hover:text-muted'}`}
    >
      <Star className={`size-5 ${active ? 'fill-saffron' : ''}`} />
    </button>
  );
}

export default function MenuPage() {
  const { store } = useOutletContext();
  const { t, pick, money, lang } = useT();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = edit
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const search = useDebounce(filters.search, 250);
  const currency = store?.currency ?? 'INR';

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('new')) {
      setEditing({});
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const load = useCallback(() => {
    menuService
      .list({ ...filters, search })
      .then(setItems)
      .catch((e) => toast.error(errorMessage(e, t, lang)));
  }, [search, filters.category, filters.availability, filters.recommended]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (item, changes) => {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...changes } : i)));
    try {
      const updated = await menuService.update(item.id, changes);
      setItems((list) => list.map((i) => (i.id === updated.id ? updated : i)));
    } catch (e) {
      setItems((list) => list.map((i) => (i.id === item.id ? item : i)));
      toast.error(errorMessage(e, t, lang));
    }
  };

  const remove = async () => {
    setDeletingBusy(true);
    try {
      await menuService.remove(deleting.id);
      setItems((list) => list.filter((i) => i.id !== deleting.id));
      toast.success(t('menuAdmin.deleted'));
      setDeleting(null);
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
    } finally {
      setDeletingBusy(false);
    }
  };

  const filtered = Object.values(filters).some(Boolean);
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  if (!items) return <PageSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('menuAdmin.title')}
        subtitle={t('menuAdmin.subtitle', { count: items.length })}
        actions={
          <Button icon={Plus} onClick={() => setEditing({})} disabled={!categories.length}>
            {t('menuAdmin.add')}
          </Button>
        }
      />

      {categories.length === 0 && !filtered && items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Tags}
            title={t('menuAdmin.noCategoriesTitle')}
            text={t('menuAdmin.noCategoriesText')}
            action={<ButtonLink to="/admin/categories">{t('menuAdmin.goToCategories')}</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_190px_190px_auto]">
            <Input prefix={<Search className="size-4" />} placeholder={t('menuAdmin.searchPlaceholder')} value={filters.search} onChange={set('search')} />
            <Select value={filters.category} onChange={set('category')}>
              <option value="">{t('menuAdmin.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {pick(c.name)}
                </option>
              ))}
            </Select>
            <Select value={filters.availability} onChange={set('availability')}>
              <option value="">{t('menuAdmin.anyAvailability')}</option>
              <option value="available">{t('menuAdmin.available')}</option>
              <option value="unavailable">{t('menuAdmin.unavailable')}</option>
            </Select>
            <button
              onClick={() => setFilters((f) => ({ ...f, recommended: f.recommended ? '' : 'true' }))}
              aria-pressed={Boolean(filters.recommended)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold whitespace-nowrap ${
                filters.recommended ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-line bg-white text-muted hover:text-ink'
              }`}
            >
              <Star className={`size-4 ${filters.recommended ? 'fill-saffron text-saffron' : ''}`} />
              {t('menuAdmin.recommendedOnly')}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={UtensilsCrossed}
                title={filtered ? t('menuAdmin.noMatch') : t('menuAdmin.emptyTitle')}
                text={filtered ? undefined : t('menuAdmin.emptyText')}
                action={
                  filtered ? (
                    <Button variant="secondary" onClick={() => setFilters(NO_FILTERS)}>
                      {t('menuAdmin.clearFilters')}
                    </Button>
                  ) : (
                    <Button icon={Plus} onClick={() => setEditing({})}>
                      {t('menuAdmin.add')}
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Desktop table */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="border-b border-line bg-cream/60 text-xs font-semibold tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3">{t('menuAdmin.columns.item')}</th>
                    <th className="px-4 py-3">{t('menuAdmin.columns.category')}</th>
                    <th className="px-4 py-3 text-right">{t('menuAdmin.columns.price')}</th>
                    <th className="px-4 py-3 text-center">{t('menuAdmin.columns.recommended')}</th>
                    <th className="px-4 py-3 text-center">{t('menuAdmin.columns.available')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => (
                    <tr key={item.id} className={`transition-colors hover:bg-cream/50 ${item.isAvailable ? '' : 'opacity-60'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <SmartImage src={item.imageUrl} alt={item.name.en} className="size-12 shrink-0 rounded-xl" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-semibold">
                              <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="size-3.5" />
                              <span className="truncate">{item.name.en}</span>
                            </p>
                            {item.name.hi && (
                              <p className="truncate text-muted" lang="hi">
                                {item.name.hi}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{pick(item.category?.name)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(item.price, currency)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <RecommendedButton
                            active={item.isRecommended}
                            label={t('itemForm.recommended')}
                            onClick={() => patch(item, { isRecommended: !item.isRecommended })}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Toggle size="sm" label={undefined} checked={item.isAvailable} onChange={(v) => patch(item, { isAvailable: v })} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="iconSm" variant="ghost" onClick={() => setEditing(item)} aria-label={t('common.edit')}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="iconSm" variant="ghost" className="hover:text-chili" onClick={() => setDeleting(item)} aria-label={t('common.delete')}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <ul className="divide-y divide-line md:hidden">
                {items.map((item) => (
                  <li key={item.id} className={`flex gap-3 p-3 ${item.isAvailable ? '' : 'opacity-60'}`}>
                    <button onClick={() => setEditing(item)} className="shrink-0">
                      <SmartImage src={item.imageUrl} alt={item.name.en} className="size-16 rounded-xl" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <VegMark isVeg={item.isVeg} label={item.isVeg ? t('food.veg') : t('food.nonVeg')} className="size-3.5" />
                        <span className="truncate">{pick(item.name)}</span>
                      </p>
                      <p className="text-sm text-muted">
                        {money(item.price, currency)} · {pick(item.category?.name)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <Toggle size="sm" checked={item.isAvailable} onChange={(v) => patch(item, { isAvailable: v })} />
                        <RecommendedButton
                          active={item.isRecommended}
                          label={t('itemForm.recommended')}
                          onClick={() => patch(item, { isRecommended: !item.isRecommended })}
                        />
                        <div className="ml-auto flex gap-1">
                          <Button size="iconSm" variant="ghost" onClick={() => setEditing(item)} aria-label={t('common.edit')}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="iconSm" variant="ghost" onClick={() => setDeleting(item)} aria-label={t('common.delete')}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <MenuItemForm
        open={editing !== null}
        item={editing?.id ? editing : null}
        categories={categories}
        onClose={() => setEditing(null)}
        onCategoryCreated={(c) => setCategories((list) => [...list, c])}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t('menuAdmin.deleteTitle', { name: pick(deleting?.name) })}
        message={t('menuAdmin.deleteText')}
        confirmLabel={t('common.delete')}
        loading={deletingBusy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
