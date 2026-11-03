import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import en from '../i18n/en';
import hi from '../i18n/hi';
import { formatCurrency, pickText } from '../utils/format';

const DICTIONARIES = { en, hi };
const STORAGE_KEY = 'lang';

const lookup = (dict, key) => key.split('.').reduce((node, part) => (node == null ? node : node[part]), dict);

function detectLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && DICTIONARIES[saved]) return saved;
  return navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      let entry = lookup(DICTIONARIES[lang], key) ?? lookup(en, key);
      if (entry == null) return key;
      if (typeof entry === 'object' && !Array.isArray(entry) && vars?.count !== undefined) {
        entry = vars.count === 1 ? entry.one : entry.other;
      }
      if (typeof entry !== 'string') return entry;
      return vars ? entry.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : entry;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      setLang: setLangState,
      toggleLang: () => setLangState((l) => (l === 'en' ? 'hi' : 'en')),
      t,
      /** Bilingual DB text → current language with English fallback */
      pick: (localized) => pickText(localized, lang),
      money: (amount, currency) => formatCurrency(amount, currency, lang),
    }),
    [lang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
