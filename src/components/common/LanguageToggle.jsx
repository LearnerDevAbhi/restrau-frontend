import { useT } from '../../hooks/useT';

export default function LanguageToggle({ className = '', tone = 'light' }) {
  const { lang, setLang, t } = useT();
  const shell = tone === 'dark' ? 'bg-white/10 text-white/70' : 'bg-ink/5 text-muted';
  const activeCls = tone === 'dark' ? 'bg-white text-ink' : 'bg-paper text-ink shadow-sm';
  return (
    <div role="group" aria-label={t('lang.switchTo')} className={`inline-flex rounded-full p-0.5 text-xs font-semibold ${shell} ${className}`}>
      {[
        ['en', 'EN'],
        ['hi', 'हिं'],
      ].map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          lang={code}
          className={`min-w-9 rounded-full px-2.5 py-1 transition-colors ${lang === code ? activeCls : 'hover:text-current'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
