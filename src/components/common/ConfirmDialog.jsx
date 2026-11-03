import { AlertTriangle } from 'lucide-react';
import { useT } from '../../hooks/useT';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel, tone = 'danger', loading, onConfirm, onClose }) {
  const { t } = useT();
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="sm"
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} className="flex-1" loading={loading} onClick={onConfirm}>
            {confirmLabel || t('common.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 pt-1">
        <div className={`grid size-11 shrink-0 place-items-center rounded-full ${tone === 'danger' ? 'bg-red-50 text-chili' : 'bg-brand-50 text-brand-600'}`}>
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {message && <p className="mt-1 text-sm text-muted">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
