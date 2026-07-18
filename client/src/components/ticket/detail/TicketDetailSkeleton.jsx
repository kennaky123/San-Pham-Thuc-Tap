function TicketDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Đang tải chi tiết ticket">
      <div className="h-11 w-36 rounded-lg bg-slate-200" />
      <div className="mt-5 h-4 w-40 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-full max-w-2xl rounded bg-slate-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-7 w-24 rounded-full bg-slate-200" />
        <div className="h-7 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-48 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-96 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-80 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default TicketDetailSkeleton;
