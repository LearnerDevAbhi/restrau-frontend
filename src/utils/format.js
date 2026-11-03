const locale = (lang) => (lang === 'hi' ? 'hi-IN' : 'en-IN');

export function formatCurrency(amount, currency = 'INR', lang = 'en') {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat(locale(lang), {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTime(date, lang = 'en') {
  return new Intl.DateTimeFormat(locale(lang), { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

export function formatDateTime(date, lang = 'en') {
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(
    new Date(date),
  );
}

export function timeAgo(date, lang = 'en') {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  return rtf.format(Math.round(seconds / 86400), 'day');
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Picks the text for the current language, falling back to English. */
export const pickText = (localized, lang) => (localized ? localized[lang] || localized.en || '' : '');
