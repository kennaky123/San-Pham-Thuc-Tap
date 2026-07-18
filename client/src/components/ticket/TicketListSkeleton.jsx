const SKELETON_ROWS = [
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
];

function SkeletonLine({ className }) {
  return (
    <span
      className={`block animate-pulse rounded bg-slate-200 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
}

function TicketListSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải danh sách ticket...</span>

      <div className="divide-y divide-slate-100 xl:hidden">
        {SKELETON_ROWS.slice(0, 4).map((item) => (
          <div key={item} className="p-4 sm:p-5" aria-hidden="true">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="mt-3 h-4 w-4/5" />
              </div>
              <SkeletonLine className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonLine className="mt-4 h-6 w-24 rounded-full" />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <SkeletonLine className="h-8 w-full" />
              <SkeletonLine className="h-8 w-full" />
              <SkeletonLine className="h-8 w-full" />
              <SkeletonLine className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden xl:block">
        <div className="grid grid-cols-8 gap-4 bg-slate-50 px-5 py-4" aria-hidden="true">
          {["h-1", "h-2", "h-3", "h-4", "h-5", "h-6", "h-7", "h-8"].map(
            (item) => (
              <SkeletonLine key={item} className="h-3 w-full" />
            ),
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {SKELETON_ROWS.map((item) => (
            <div
              key={item}
              className="grid grid-cols-8 gap-4 px-5 py-5"
              aria-hidden="true"
            >
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-6 w-full rounded-full" />
              <SkeletonLine className="h-6 w-full rounded-full" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicketListSkeleton;
