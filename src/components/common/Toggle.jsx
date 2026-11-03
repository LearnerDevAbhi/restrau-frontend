export default function Toggle({ checked, onChange, label, hint, disabled, size = 'md', className = '' }) {
  const dims = size === 'sm' ? { track: 'h-5 w-9', knob: 'size-4', on: 'translate-x-4' } : { track: 'h-6 w-11', knob: 'size-5', on: 'translate-x-5' };
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={typeof label === 'string' ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:opacity-50 ${dims.track} ${
        checked ? 'bg-leaf' : 'bg-ink/20'
      }`}
    >
      <span
        className={`${dims.knob} rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? dims.on : 'translate-x-0'}`}
      />
    </button>
  );
  if (!label) return control;
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      {control}
    </div>
  );
}
