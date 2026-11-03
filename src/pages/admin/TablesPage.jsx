import { Pencil, Plus, QrCode, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import QrModal from '../../components/admin/QrModal';
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
import { tableService } from '../../services/tableService';
import { errorMessage } from '../../utils/errors';

function TableForm({ open, table, onClose, onSaved }) {
  const { t, lang } = useT();
  const toast = useToast();
  const [form, setForm] = useState({ tableNumber: '', tableName: '', isActive: true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ tableNumber: table?.tableNumber ?? '', tableName: table?.tableName ?? '', isActive: table?.isActive ?? true });
    setError('');
  }, [open, table]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.tableNumber.trim()) return setError(t('tablesAdmin.number'));
    setSaving(true);
    setError('');
    const payload = { tableNumber: form.tableNumber.trim(), tableName: form.tableName.trim(), isActive: form.isActive };
    try {
      const saved = table ? await tableService.update(table.id, payload) : await tableService.create(payload);
      toast.success(t(table ? 'tablesAdmin.updated' : 'tablesAdmin.created'));
      onSaved(saved, !table);
    } catch (err) {
      setError(errorMessage(err, t, lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      size="sm"
      title={t(table ? 'tablesAdmin.editTitle' : 'tablesAdmin.addTitle')}
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="table-form" className="flex-1" loading={saving}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form id="table-form" onSubmit={submit} noValidate className="grid gap-4 pt-2">
        <Input
          label={t('tablesAdmin.number')}
          hint={t('tablesAdmin.numberHint')}
          required
          value={form.tableNumber}
          error={error}
          maxLength={20}
          onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))}
        />
        <Input
          label={t('tablesAdmin.name')}
          optionalLabel={t('common.optional')}
          placeholder={t('tablesAdmin.namePlaceholder')}
          value={form.tableName}
          maxLength={60}
          onChange={(e) => setForm((f) => ({ ...f, tableName: e.target.value }))}
        />
        <Toggle label={t('tablesAdmin.active')} hint={t('tablesAdmin.activeHint')} checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
      </form>
    </Modal>
  );
}

export default function TablesPage() {
  const { store } = useOutletContext();
  const { t, lang } = useT();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tables, setTables] = useState(null);
  const [editing, setEditing] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => tableService.list().then(setTables).catch((e) => toast.error(errorMessage(e, t, lang)));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchParams.get('new')) {
      setEditing({});
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const replace = (updated) => setTables((list) => list.map((tb) => (tb.id === updated.id ? updated : tb)));

  const toggleActive = async (table, isActive) => {
    replace({ ...table, isActive });
    try {
      replace(await tableService.update(table.id, { isActive }));
      toast.success(t(isActive ? 'tablesAdmin.activated' : 'tablesAdmin.deactivated', { number: table.tableNumber }));
    } catch (e) {
      replace(table);
      toast.error(errorMessage(e, t, lang));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await tableService.remove(deleting.id);
      setTables((list) => list.filter((tb) => tb.id !== deleting.id));
      toast.success(t('tablesAdmin.deleted'));
      setDeleting(null);
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
    } finally {
      setBusy(false);
    }
  };

  if (!tables) return <PageSpinner />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('tablesAdmin.title')}
        subtitle={t('tablesAdmin.subtitle')}
        actions={
          <Button icon={Plus} onClick={() => setEditing({})}>
            {t('tablesAdmin.add')}
          </Button>
        }
      />

      {tables.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={QrCode}
            title={t('tablesAdmin.emptyTitle')}
            text={t('tablesAdmin.emptyText')}
            action={
              <Button icon={Plus} onClick={() => setEditing({})}>
                {t('tablesAdmin.add')}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <article key={table.id} className={`card flex flex-col p-5 ${table.isActive ? '' : 'bg-cream'}`}>
              <div className="flex items-start gap-4">
                <div
                  className={`grid size-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-semibold ${
                    table.isActive ? 'bg-ink text-white' : 'bg-line text-muted'
                  }`}
                >
                  {table.tableNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t('table.label', { number: table.tableNumber })}</p>
                  {table.tableName && <p className="truncate text-sm text-muted">{table.tableName}</p>}
                  <Badge tone={table.isActive ? 'green' : 'red'} className="mt-2">
                    {table.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
                <Toggle size="sm" checked={table.isActive} onChange={(v) => toggleActive(table, v)} />
              </div>
              <div className="mt-5 flex gap-2 border-t border-line pt-4">
                <Button variant="subtle" size="sm" icon={QrCode} className="flex-1" onClick={() => setQrTable(table)}>
                  {t('tablesAdmin.qr')}
                </Button>
                <Button size="iconSm" variant="ghost" onClick={() => setEditing(table)} aria-label={t('common.edit')}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="iconSm" variant="ghost" className="hover:text-chili" onClick={() => setDeleting(table)} aria-label={t('common.delete')}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <TableForm
        open={editing !== null}
        table={editing?.id ? editing : null}
        onClose={() => setEditing(null)}
        onSaved={(saved, isNew) => {
          setEditing(null);
          if (isNew) {
            setTables((list) => [...list, saved]);
            setQrTable(saved); // show the new QR straight away
          } else replace(saved);
        }}
      />
      <QrModal table={qrTable} store={store} onClose={() => setQrTable(null)} onRegenerated={replace} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t('tablesAdmin.deleteTitle', { number: deleting?.tableNumber })}
        message={t('tablesAdmin.deleteText')}
        confirmLabel={t('common.delete')}
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
