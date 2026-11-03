import { Ban, QrCode, WifiOff } from 'lucide-react';
import { useT } from '../../hooks/useT';
import Button from '../common/Button';
import LanguageToggle from '../common/LanguageToggle';

const ICONS = { INVALID_TABLE: QrCode, TABLE_INACTIVE: Ban, MISSING: QrCode, NETWORK: WifiOff };

export default function TableErrorScreen({ code = 'MISSING', onRetry }) {
  const { t } = useT();
  const Icon = ICONS[code] || QrCode;
  return (
    <div className="flex min-h-dvh flex-col px-6">
      <div className="flex justify-end pt-5">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 animate-fade-in flex-col items-center justify-center pb-24 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-brand-50 text-brand-600">
          <Icon className="size-10" strokeWidth={1.6} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">{t(`tableError.${code}.title`)}</h1>
        <p className="mt-2 max-w-xs text-muted">{t(`tableError.${code}.text`)}</p>
        {code === 'NETWORK' && onRetry && (
          <Button className="mt-6" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  );
}
