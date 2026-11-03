import { Compass } from 'lucide-react';
import { ButtonLink } from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useT } from '../hooks/useT';

export default function NotFoundPage() {
  const { t } = useT();
  return (
    <div className="grid min-h-dvh place-items-center">
      <EmptyState icon={Compass} title={t('notFound.title')} text={t('notFound.text')} action={<ButtonLink to="/">{t('notFound.home')}</ButtonLink>} />
    </div>
  );
}
