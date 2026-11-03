import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { Input } from '../../components/common/Field';
import Modal from '../../components/common/Modal';
import { PageSpinner } from '../../components/common/Spinner';
import Toggle from '../../components/common/Toggle';
import { useToast } from '../../context/ToastContext';
import { useT } from '../../hooks/useT';
import { categoryService } from '../../services/categoryService';
import { errorMessage } from '../../utils/errors';

function CategoryForm({ open, category, onClose, onSaved }) {
  const { t, lang } = useT();
  const toast = useToast();
  const [form, setForm] = useState({ en: '', hi: '', sortOrder: '0', isActive: true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      en: category?.name.en ?? '',
      hi: category?.name.hi ?? '',
      sortOrder: String(category?.sortOrder ?? 0),
      isActive: category?.isActive ?? true,
    });
    setError('');
  }, [open, category]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.en.trim()) return setError(t('itemForm.nameRequired'));
    setSaving(true);
    const payload = {
      name: { en: form.en.trim(), hi: form.hi.trim() },
      sortOrder: Math.max(0, parseInt(form.sortOrder, 10) || 0),
      isActive: form.isActive,
    };
    try {
      const saved = category ? await categoryService.update(category.id, payload) : await categoryService.create(payload);
      toast.success(t(category ? 'categoriesAdmin.updated' : 'categoriesAdmin.created'));
      onSaved(saved);
    } catch (err) {
      toast.error(errorMessage(err, t, lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      size="sm"
      title={t(category ? 'categoriesAdmin.editTitle' : 'categoriesAdmin.addTitle')}
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="category-form" className="flex-1" loading={saving}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} noValidate className="grid gap-4 pt-2">
        <Input label={t('categoriesAdmin.nameEn')} required value={form.en} error={error} onChange={(e) => setForm((f) => ({ ...f, en: e.target.value }))} maxLength={120} />
        <Input
          label={t('categoriesAdmin.nameHi')}
          optionalLabel={t('common.optional')}
          lang="hi"
          placeholder={t('itemForm.hiPlaceholder')}
          value={form.hi}
          onChange={(e) => setForm((f) => ({ ...f, hi: e.target.value }))}
          maxLength={120}
        />
        <Input
          label={t('categoriesAdmin.sortOrder')}
          hint={t('categoriesAdmin.sortHint')}
          type="number"
          min="0"
          inputMode="numeric"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
        />
        <Toggle
          label={t('categoriesAdmin.active')}
          hint={t('categoriesAdmin.activeHint')}
          checked={form.isActive}
          onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
        />
      </form>
    </Modal>
  );
}

export default function CategoriesPage() {
  const { t, pick, lang } = useT();
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => categoryService.list().then(setCategories).catch((e) => toast.error(errorMessage(e, t, lang)));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async (category, isActive) => {
    setCategories((list) => list.map((c) => (c.id === category.id ? { ...c, isActive } : c)));
    try {
      await categoryService.update(category.id, { isActive });
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
      load();
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await categoryService.remove(deleting.id);
      toast.success(t('categoriesAdmin.deleted'));
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
    } finally {
      setBusy(false);
    }
  };

  if (!categories) return <PageSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('categoriesAdmin.title')}
        subtitle={t('categoriesAdmin.subtitle')}
        actions={
          <Button icon={Plus} onClick={() => setEditing({})}>
            {t('categoriesAdmin.add')}
          </Button>
        }
      />

      {categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Tags}
            title={t('categoriesAdmin.emptyTitle')}
            text={t('categoriesAdmin.emptyText')}
            action={
              <Button icon={Plus} onClick={() => setEditing({})}>
                {t('categoriesAdmin.add')}
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cream text-sm font-bold text-muted tabular-nums">{c.sortOrder}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {c.name.en}
                  {!c.isActive && <Badge tone="red">{t('categoriesAdmin.hidden')}</Badge>}
                </p>
                <p className="text-sm text-muted">
                  {c.name.hi && (
                    <span lang="hi">
                      {c.name.hi} ·{' '}
                    </span>
                  )}
                  {t('categoriesAdmin.items', { count: c.itemCount })}
                </p>
              </div>
              <Toggle size="sm" checked={c.isActive} onChange={(v) => toggleActive(c, v)} />
              <div className="flex gap-1">
                <Button size="iconSm" variant="ghost" onClick={() => setEditing(c)} aria-label={t('common.edit')}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="iconSm"
                  variant="ghost"
                  onClick={() => setDeleting(c)}
                  disabled={c.itemCount > 0}
                  title={c.itemCount > 0 ? t('categoriesAdmin.inUse') : t('common.delete')}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CategoryForm
        open={editing !== null}
        category={editing?.id ? editing : null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t('categoriesAdmin.deleteTitle', { name: pick(deleting?.name) })}
        message={t('categoriesAdmin.deleteText')}
        confirmLabel={t('common.delete')}
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
