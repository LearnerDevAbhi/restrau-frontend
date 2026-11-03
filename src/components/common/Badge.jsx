const TONES = {
  neutral: 'bg-ink/5 text-ink/80',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
};

export default function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

const STATUS_TONES = {
  PLACED: 'amber',
  ACCEPTED: 'blue',
  PREPARING: 'violet',
  SERVED: 'green',
  COMPLETED: 'neutral',
  CANCELLED: 'red',
};

export function StatusBadge({ status, label }) {
  return <Badge tone={STATUS_TONES[status]}>{label}</Badge>;
}
