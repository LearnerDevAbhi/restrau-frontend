import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ImageUploader from '../../components/admin/ImageUploader';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import { Input, Select } from '../../components/common/Field';
import { PageSpinner } from '../../components/common/Spinner';
import Toggle from '../../components/common/Toggle';
import MenuHeader from '../../components/customer/MenuHeader';
import { useToast } from '../../context/ToastContext';
import { useT } from '../../hooks/useT';
import { storeService } from '../../services/storeService';
import { CURRENCIES } from '../../utils/constants';
import { errorMessage } from '../../utils/errors';

export default function StorePage() {
  const { store, setStore } = useOutletContext();
  const { t, lang } = useT();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState({ preview: null });
  const [saving, setSaving] = useState(false);
  const [togglingOrders, setTogglingOrders] = useState(false);

  useEffect(() => {
    if (!store || form) return;
    setForm({
      nameEn: store.name.en,
      nameHi: store.name.hi || '',
      taglineEn: store.tagline?.en || '',
      taglineHi: store.tagline?.hi || '',
      currency: store.currency,
    });
    setLogo({ preview: store.logoUrl });
  }, [store, form]);

  const publish = (updated) => {
    setStore(updated);
    window.dispatchEvent(new CustomEvent('store:changed', { detail: updated }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nameEn.trim()) return toast.error(t('itemForm.nameRequired'));
    setSaving(true);
    const payload = {
      name: { en: form.nameEn.trim(), hi: form.nameHi.trim() },
      tagline: { en: form.taglineEn.trim(), hi: form.taglineHi.trim() },
      currency: form.currency,
    };
    if (logo.dataUri) payload.logoBase64 = logo.dataUri;
    else if (logo.removed) payload.logoBase64 = null;
    try {
      const updated = await storeService.update(payload);
      publish(updated);
      setLogo({ preview: updated.logoUrl });
      toast.success(t('storeAdmin.saved'));
    } catch (err) {
      toast.error(errorMessage(err, t, lang));
    } finally {
      setSaving(false);
    }
  };

  const toggleOrders = async (isAcceptingOrders) => {
    setTogglingOrders(true);
    try {
      publish(await storeService.update({ isAcceptingOrders }));
      toast.success(t('storeAdmin.saved'));
    } catch (err) {
      toast.error(errorMessage(err, t, lang));
    } finally {
      setTogglingOrders(false);
    }
  };

  if (!store || !form) return <PageSpinner />;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const previewStore = {
    ...store,
    name: { en: form.nameEn, hi: form.nameHi },
    tagline: { en: form.taglineEn, hi: form.taglineHi },
    logoUrl: logo.preview,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('storeAdmin.title')} subtitle={t('storeAdmin.subtitle')} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 font-semibold">{t('storeAdmin.ordering')}</h2>
            <Toggle
              label={t('storeAdmin.accepting')}
              hint={t('storeAdmin.acceptingHint')}
              checked={store.isAcceptingOrders}
              disabled={togglingOrders}
              onChange={toggleOrders}
            />
          </section>

          <form onSubmit={save} className="card space-y-5 p-5" noValidate>
            <h2 className="font-semibold">{t('storeAdmin.profile')}</h2>
            <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
              <ImageUploader value={logo} onChange={setLogo} label={t('storeAdmin.logo')} aspect="aspect-square" hint="JPG, PNG, WebP · 2 MB" />
              <div className="grid content-start gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label={t('storeAdmin.nameEn')} required value={form.nameEn} onChange={set('nameEn')} maxLength={120} />
                  <Input label={t('storeAdmin.nameHi')} lang="hi" value={form.nameHi} onChange={set('nameHi')} maxLength={120} />
                  <Input label={t('storeAdmin.taglineEn')} value={form.taglineEn} onChange={set('taglineEn')} maxLength={200} />
                  <Input label={t('storeAdmin.taglineHi')} lang="hi" value={form.taglineHi} onChange={set('taglineHi')} maxLength={200} />
                </div>
                <Select label={t('storeAdmin.currency')} value={form.currency} onChange={set('currency')} className="sm:max-w-48">
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end border-t border-line pt-4">
              <Button type="submit" loading={saving}>
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </div>

        <aside>
          <p className="mb-2 text-sm font-semibold text-muted">{t('storeAdmin.preview')}</p>
          <div className="overflow-hidden rounded-3xl border-[6px] border-ink bg-cream shadow-lift">
            <MenuHeader store={previewStore} table={{ tableNumber: '4', tableName: '' }} />
            <div className="space-y-3 px-4 pb-6">
              <div className="skeleton h-11 !animate-none" />
              <div className="flex gap-2">
                <div className="skeleton h-9 w-16 !animate-none" />
                <div className="skeleton h-9 w-24 !animate-none" />
                <div className="skeleton h-9 w-20 !animate-none" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
