export default function MenuSkeleton() {
  return (
    <div aria-hidden className="px-4 sm:px-6">
      <div className="mt-2 flex gap-3 overflow-hidden">
        {[0, 1].map((i) => (
          <div key={i} className="w-[232px] shrink-0">
            <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
            <div className="skeleton mt-3 h-4 w-3/4" />
          </div>
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 border-b border-line/80 py-5">
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3 w-10" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-3 w-full" />
          </div>
          <div className="skeleton aspect-square w-[118px] rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
