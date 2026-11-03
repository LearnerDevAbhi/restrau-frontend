import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder, clearLabel }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-line bg-white pr-10 pl-10 text-[15px] shadow-sm placeholder:text-muted/80 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-ink/5 text-muted hover:text-ink"
          aria-label={clearLabel}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
