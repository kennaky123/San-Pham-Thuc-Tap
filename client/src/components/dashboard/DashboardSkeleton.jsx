const SUMMARY_SKELETONS = ["total", "pending", "processing", "completed"];
const CHART_SKELETONS = ["trend", "status", "category"];

function SkeletonBlock({ className }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải dữ liệu dashboard...</span>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_SKELETONS.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-4 h-9 w-20" />
            <SkeletonBlock className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        {CHART_SKELETONS.map((item) => (
          <div
            key={item}
            className={[
              "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
              item === "trend" ? "xl:col-span-2" : "",
            ].join(" ")}
          >
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="mt-3 h-3 w-64 max-w-full" />
            <SkeletonBlock className="mt-6 h-64 w-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-36" />
          <div className="mt-6 space-y-4">
            {["ticket-1", "ticket-2", "ticket-3", "ticket-4", "ticket-5"].map(
              (item) => (
                <SkeletonBlock key={item} className="h-10 w-full" />
              ),
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-48" />
          <div className="mt-6 space-y-4">
            {["tech-1", "tech-2", "tech-3", "tech-4"].map((item) => (
              <SkeletonBlock key={item} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
