import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useT } from '../../hooks/useT';
import { categoryService } from '../../services/categoryService';
import { menuService } from '../../services/menuService';
import { errorMessage } from '../../utils/errors';
import Button from '../common/Button';
import { Input, Select, Textarea } from '../common/Field';
import Modal from '../common/Modal';
import Toggle from '../common/Toggle';
import VegMark from '../common/VegMark';
import ImageUploader from './ImageUploader';

const emptyForm = {
  nameEn: '',
  nameHi: '',
  descEn: '',
  descHi: '',
  price: '',
  category: '',
  isVeg: true,
  isRecommended: false,
  isAvailable: true,
};

const toForm = (item) =>
  item
    ? {
        nameEn: item.name.en,
        nameHi: item.name.hi || '',
        descEn: item.description?.en || '',
        descHi: item.description?.hi || '',
        price: String(item.price),
        category: item.categoryId,
        isVeg: item.isVeg,
        isRecommended: item.isRecommended,
        isAvailable: item.isAvailable,
      }
    : emptyForm;

export default function MenuItemForm({ open, item, categories, onClose, onSaved, onCategoryCreated }) {
  const { t, pick, lang } = useT();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState({ preview: null });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState(null); // { en, hi } while the inline form is open
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ ...toForm(item), category: item?.categoryId || categories[0]?.id || '' });
    setImage({ preview: item?.imageUrl || null });
    setErrors({});
    setNewCategory(null);
  }, [open, item]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const validate = () => {
    const next = {};
    if (!form.nameEn.trim()) next.nameEn = t('itemForm.nameRequired');
    const price = Number(form.price);
    if (form.price === '' || Number.isNaN(price) || price < 0 || !/^\d+(\.\d{1,2})?$/.test(form.price.trim())) {
      next.price = t('itemForm.priceInvalid');
    }
    if (!form.category) next.category = t('itemForm.categoryRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: { en: form.nameEn.trim(), hi: form.nameHi.trim() },
      description: { en: form.descEn.trim(), hi: form.descHi.trim() },
      price: Number(form.price),
      category: form.category,
      isVeg: form.isVeg,
      isRecommended: form.isRecommended,
      isAvailable: form.isAvailable,
    };
    // Only send the image when it changed: a new data URI, or null to remove it
    if (image.dataUri) payload.imageBase64 = image.dataUri;
    else if (image.removed) payload.imageBase64 = null;

    try {
      const saved = item ? await menuService.update(item.id, payload) : await menuService.create(payload);
      toast.success(t(item ? 'menuAdmin.updated' : 'menuAdmin.created'));
      onSaved(saved, Boolean(item));
    } catch (error) {
      toast.error(errorMessage(error, t, lang));
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory?.en.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await categoryService.create({ name: { en: newCategory.en.trim(), hi: newCategory.hi.trim() } });
      onCategoryCreated?.(created);
      setForm((f) => ({ ...f, category: created.id }));
      setNewCategory(null);
      toast.success(t('categoriesAdmin.created'));
    } catch (error) {
      toast.error(errorMessage(error, t, lang));
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={t(item ? 'itemForm.editTitle' : 'itemForm.addTitle')}
      size="lg"
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving} className="flex-1 sm:flex-none">
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="menu-item-form" loading={saving} className="flex-1 sm:ml-auto sm:flex-none">
            {saving ? t('common.saving') : t(item ? 'common.saveChanges' : 'menuAdmin.add')}
          </Button>
        </>
      }
    >
      <form id="menu-item-form" onSubmit={submit} noValidate className="grid gap-5 pt-2 sm:grid-cols-[220px_1fr]">
        <ImageUploader value={image} onChange={setImage} label={t('itemForm.image')} aspect="aspect-square" />

        <div className="grid content-start gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('itemForm.nameEn')} required value={form.nameEn} onChange={set('nameEn')} error={errors.nameEn} maxLength={120} />
            <Input
              label={t('itemForm.nameHi')}
              optionalLabel={t('common.optional')}
              value={form.nameHi}
              onChange={set('nameHi')}
              placeholder={t('itemForm.hiPlaceholder')}
              lang="hi"
              maxLength={120}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('itemForm.price')}
              required
              inputMode="decimal"
              prefix="₹"
              value={form.price}
              onChange={set('price')}
              error={errors.price}
              placeholder="0"
            />
            <div>
              <Select label={t('itemForm.category')} required value={form.category} onChange={set('category')} error={errors.category}>
                <option value="" disabled>
                  {t('itemForm.selectCategory')}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {pick(c.name)}
                  </option>
                ))}
              </Select>
              {!newCategory && (
                <button
                  type="button"
                  onClick={() => setNewCategory({ en: '', hi: '' })}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                >
                  <Plus className="size-3.5" />
                  {t('categoriesAdmin.add')}
                </button>
              )}
            </div>
          </div>

          {newCategory && (
            <div className="grid gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Input
                label={t('categoriesAdmin.nameEn')}
                value={newCategory.en}
                onChange={(e) => setNewCategory((c) => ({ ...c, en: e.target.value }))}
                autoFocus
              />
              <Input
                label={t('categoriesAdmin.nameHi')}
                value={newCategory.hi}
                lang="hi"
                onChange={(e) => setNewCategory((c) => ({ ...c, hi: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setNewCategory(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={createCategory} loading={creatingCategory} disabled={!newCategory.en.trim()}>
                  {t('categoriesAdmin.add')}
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea label={t('itemForm.descEn')} optionalLabel={t('common.optional')} value={form.descEn} onChange={set('descEn')} maxLength={500} />
            <Textarea
              label={t('itemForm.descHi')}
              optionalLabel={t('common.optional')}
              value={form.descHi}
              onChange={set('descHi')}
              placeholder={t('itemForm.hiPlaceholder')}
              lang="hi"
              maxLength={500}
            />
          </div>
          <p className="-mt-2 text-xs text-muted">{t('itemForm.hindiTip')}</p>

          <div>
            <p className="mb-1.5 text-sm font-medium">{t('itemForm.foodType')}</p>
            <div className="inline-flex rounded-xl border border-line bg-white p-1">
              {[true, false].map((veg) => (
                <button
                  key={String(veg)}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isVeg: veg }))}
                  aria-pressed={form.isVeg === veg}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    form.isVeg === veg ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  <VegMark isVeg={veg} className="size-3.5" />
                  {veg ? t('food.veg') : t('food.nonVeg')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-line bg-cream/60 p-4">
            <Toggle
              label={t('itemForm.recommended')}
              hint={t('itemForm.recommendedHint')}
              checked={form.isRecommended}
              onChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))}
            />
            <Toggle
              label={t('itemForm.available')}
              hint={t('itemForm.availableHint')}
              checked={form.isAvailable}
              onChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
