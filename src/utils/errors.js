/** Turns an ApiError into a message in the current language. */
export function errorMessage(error, t, lang) {
  const code = error?.code || 'INTERNAL_ERROR';
  if (code === 'DUPLICATE') {
    const field = error.details?.fields?.[0];
    const specific = field && t(`errors.DUPLICATE_${field}`);
    if (specific && specific !== `errors.DUPLICATE_${field}`) return specific;
  }
  // Server validation messages are specific and written in English
  if (code === 'VALIDATION_FAILED' && lang === 'en' && error.message) return error.message;
  const translated = t(`errors.${code}`);
  return translated === `errors.${code}` ? error?.message || t('errors.INTERNAL_ERROR') : translated;
}
