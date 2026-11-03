import { ClipboardCheck, QrCode, UtensilsCrossed } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { PageSpinner } from '../../components/common/Spinner';
import LanguageToggle from '../../components/common/LanguageToggle';
import TableErrorScreen from '../../components/customer/TableErrorScreen';
import { useTableSession } from '../../context/TableSessionContext';
import { useT } from '../../hooks/useT';

export default function LandingPage() {
  const session = useTableSession();
  const { t } = useT();

  if (session.status === 'ready') return <Navigate to={session.menuPath} replace />;
  if (session.status === 'loading') return <PageSpinner />;
  if (session.status === 'error') return <TableErrorScreen code={session.errorCode} onRetry={session.retry} />;

  const steps = t('landing.steps');
  const icons = [QrCode, UtensilsCrossed, ClipboardCheck];
  return (
    <div className="flex min-h-dvh flex-col px-6">
      <div className="flex justify-end pt-5">
        <LanguageToggle />
      </div>
      <main className="flex flex-1 animate-fade-in flex-col items-center justify-center text-center">
        <div className="relative grid size-28 place-items-center rounded-[2rem] bg-brand-600 text-white shadow-lift">
          <QrCode className="size-14" strokeWidth={1.5} />
          <span className="absolute -inset-3 -z-10 animate-pulse rounded-[2.5rem] bg-brand-200/60" />
        </div>
        <h1 className="mt-8 max-w-sm font-display text-3xl leading-tight font-semibold">{t('landing.title')}</h1>
        <p className="mt-3 max-w-sm text-muted">{t('landing.subtitle')}</p>
        <ol className="mt-10 grid w-full max-w-sm gap-3 text-left">
          {steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step} className="card flex items-center gap-3 px-4 py-3">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium">{step}</span>
              </li>
            );
          })}
        </ol>
      </main>
      <footer className="safe-bottom py-6 text-center">
        <Link to="/admin" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          {t('landing.staff')}
        </Link>
      </footer>
    </div>
  );
}
