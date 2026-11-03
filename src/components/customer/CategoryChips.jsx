import { useEffect, useRef } from 'react';

export default function CategoryChips({ categories, active, onChange, allLabel }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector('[aria-pressed="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  const chips = [{ id: 'all', label: allLabel }, ...categories];
  return (
    <div ref={containerRef} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6" role="toolbar">
      {chips.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={`h-9 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
              isActive ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/80 hover:border-ink/30'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
