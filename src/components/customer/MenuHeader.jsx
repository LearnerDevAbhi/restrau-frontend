import { MapPin } from 'lucide-react';
import { assetUrl } from '../../services/api';
import { useT } from '../../hooks/useT';
import LanguageToggle from '../common/LanguageToggle';

export function TablePill({ table, className = '' }) {
  const { t } = useT();
  if (!table) return null;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 py-1 pr-3 pl-1 text-sm ${className}`}>
      <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
        <MapPin className="size-3.5" />
      </span>
      <span className="font-semibold text-brand-800">{t('table.label', { number: table.tableNumber })}</span>
      {table.tableName && <span className="text-brand-700/80">· {table.tableName}</span>}
    </div>
  );
}

export default function MenuHeader({ store, table }) {
  const { pick } = useT();
  const name = pick(store?.name) || ' ';
  const tagline = pick(store?.tagline);

  return (
    <header className="px-4 pt-5 pb-3 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {store?.logoUrl ? (
            <img src={assetUrl(store.logoUrl)} alt="" className="size-12 shrink-0 rounded-2xl border border-line bg-white object-cover" />
          ) : (
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 font-display text-xl font-semibold text-white">
              {[...name][0]}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-[22px] leading-tight font-semibold text-ink">{name}</h1>
            {tagline && <p className="line-clamp-2 text-sm leading-snug text-muted">{tagline}</p>}
          </div>
        </div>
        <LanguageToggle />
      </div>
      <TablePill table={table} className="mt-4" />
    </header>
  );
}
