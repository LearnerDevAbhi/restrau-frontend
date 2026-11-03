import { Copy, Download, ExternalLink, FileImage, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useT } from '../../hooks/useT';
import { tableService } from '../../services/tableService';
import { errorMessage } from '../../utils/errors';
import { downloadDataUrl, downloadTableCard } from '../../utils/tableCard';
import en from '../../i18n/en';
import hi from '../../i18n/hi';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

export default function QrModal({ table, store, onClose, onRegenerated }) {
  const { t, pick, lang } = useT();
  const toast = useToast();
  const [qr, setQr] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!table) return;
    setQr(null);
    tableService
      .getQr(table.id)
      .then(setQr)
      .catch((e) => toast.error(errorMessage(e, t, lang)));
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!table) return null;
  const fileBase = `table-${table.tableNumber}`.replace(/\s+/g, '-');

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const fresh = await tableService.regenerateQr(table.id);
      setQr(fresh);
      onRegenerated(fresh.table);
      toast.success(t('tablesAdmin.regenerated'));
    } catch (e) {
      toast.error(errorMessage(e, t, lang));
    } finally {
      setRegenerating(false);
      setConfirming(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard?.writeText(qr.url);
    toast.success(t('tablesAdmin.linkCopied'));
  };

  const downloadCard = () =>
    downloadTableCard({
      qrDataUrl: qr.qrDataUrl,
      restaurantName: store?.name?.en || '',
      tableLabel: `Table ${table.tableNumber}`,
      tableName: table.tableName,
      lineEn: en.tablesAdmin.scanToOrder,
      lineHi: hi.tablesAdmin.scanToOrder,
      filename: `${fileBase}-card.png`,
    });

  return (
    <>
      <Modal open onClose={onClose} title={t('tablesAdmin.qrTitle', { number: table.tableNumber })} description={table.tableName} size="sm" closeLabel={t('common.close')}>
        <div className="mx-auto mt-2 grid aspect-square w-full max-w-[280px] place-items-center rounded-2xl border border-line bg-white p-3">
          {qr ? <img src={qr.qrDataUrl} alt={t('tablesAdmin.qr')} className="size-full" /> : <Spinner className="size-7 text-brand-600" />}
        </div>
        <p className="mt-2 text-center text-sm font-medium text-muted">{pick(store?.name)} · {t('tablesAdmin.scanToOrder')}</p>

        {qr && (
          <>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-xs text-muted">{qr.url}</code>
              <button onClick={copy} className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink" aria-label={t('tablesAdmin.copyLink')}>
                <Copy className="size-4" />
              </button>
              <a href={qr.url} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink" aria-label={t('tablesAdmin.openMenu')}>
                <ExternalLink className="size-4" />
              </a>
            </div>
            <div className="mt-4 grid gap-2">
              <Button icon={FileImage} onClick={downloadCard}>
                {t('tablesAdmin.downloadCard')}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" icon={Download} onClick={() => downloadDataUrl(qr.qrDataUrl, `${fileBase}-qr.png`)}>
                  {t('tablesAdmin.downloadQr')}
                </Button>
                <Button variant="secondary" icon={RefreshCcw} onClick={() => setConfirming(true)}>
                  {t('tablesAdmin.regenerate')}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
      <ConfirmDialog
        open={confirming}
        title={t('tablesAdmin.regenerateTitle', { number: table.tableNumber })}
        message={t('tablesAdmin.regenerateText')}
        confirmLabel={t('tablesAdmin.regenerate')}
        loading={regenerating}
        onConfirm={regenerate}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
