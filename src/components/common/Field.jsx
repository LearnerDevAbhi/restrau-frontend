import { forwardRef, useId } from 'react';

const base =
  'w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-4 disabled:bg-cream disabled:text-muted';
const tone = (error) =>
  error ? 'border-chili/60 focus:border-chili focus:ring-chili/10' : 'border-line focus:border-brand-500 focus:ring-brand-500/15';

export function Field({ label, hint, error, required, optionalLabel, htmlFor, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-chili"> *</span>}
          {optionalLabel && <span className="font-normal text-muted"> ({optionalLabel})</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-chili">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, required, optionalLabel, className = '', prefix, ...props }, ref) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} optionalLabel={optionalLabel} htmlFor={id} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={`${base} ${tone(error)} h-11 ${prefix ? 'pl-9' : ''}`}
          {...props}
        />
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, required, optionalLabel, className = '', ...props }, ref) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} optionalLabel={optionalLabel} htmlFor={id} className={className}>
      <textarea ref={ref} id={id} aria-invalid={Boolean(error)} rows={3} className={`${base} ${tone(error)} resize-none py-2.5`} {...props} />
    </Field>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, required, className = '', children, ...props }, ref) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className={`${base} ${tone(error)} h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%236f655d%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%236f655d%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10`}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
