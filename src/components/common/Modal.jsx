import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Bottom sheet on phones, centered dialog on larger screens.
 * Closes on Escape and backdrop click; locks page scroll while open.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md', closeLabel = 'Close' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector('input:not([type=hidden]), textarea, select');
      (first || panelRef.current)?.focus({ preventScroll: true });
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-paper shadow-lift outline-none sm:rounded-3xl ${width}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2 sm:px-6 sm:pt-5">
            <div>
              {title && <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {onClose && (
              <button onClick={onClose} className="-mr-1 rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink" aria-label={closeLabel}>
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
        {footer && <div className="safe-bottom flex gap-3 border-t border-line px-5 pt-3 sm:px-6 sm:pb-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
