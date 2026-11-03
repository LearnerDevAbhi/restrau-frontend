export default function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-leaf',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
