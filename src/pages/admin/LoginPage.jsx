import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Input } from '../../components/common/Field';
import LanguageToggle from '../../components/common/LanguageToggle';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../hooks/useT';
import { errorMessage } from '../../utils/errors';

export default function LoginPage() {
  const { status, login } = useAuth();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'signedIn') return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err, t, lang));
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div aria-hidden className="absolute bottom-32 -left-20 size-72 rounded-full bg-saffron/20 blur-3xl" />
        <div className="relative max-w-md">
          <h2 className="font-display text-5xl leading-[1.05] font-semibold">{t('login.brandTitle')}</h2>
          <p className="mt-4 text-lg text-white/70">{t('login.brandText')}</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <form onSubmit={submit} className="w-full max-w-sm animate-slide-up" noValidate>
            <div className="mb-8">
              <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
                <LockKeyhole className="size-6" />
              </div>
              <h1 className="font-display text-3xl font-semibold">{t('login.title')}</h1>
              <p className="mt-1.5 text-muted">{t('login.subtitle')}</p>
            </div>
            <div className="space-y-4">
              <Input
                label={t('login.email')}
                type="email"
                autoComplete="username"
                prefix={<Mail className="size-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  label={t('login.password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  prefix={<LockKeyhole className="size-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 bottom-1.5 rounded-lg p-1.5 text-muted hover:text-ink"
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-chili">{error}</p>}
              <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!email || !password}>
                {submitting ? t('login.signingIn') : t('login.submit')}
              </Button>
              {import.meta.env.DEV && (
                <p className="text-center text-xs text-muted">Dev: admin@restaurant.com / Admin@123</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
