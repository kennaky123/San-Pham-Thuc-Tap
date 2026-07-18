function CreateTicketPageSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Đang tải trang tạo yêu cầu">
      <div className="h-3 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-64 max-w-full rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-200" />
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-11 rounded-lg bg-slate-100" />
            <div className="h-11 rounded-lg bg-slate-100" />
          </div>
          <div className="h-40 rounded-lg bg-slate-100" />
          <div className="h-36 rounded-xl bg-slate-100" />
        </div>
        <div className="hidden h-72 rounded-2xl bg-slate-100 xl:block" />
      </div>
    </div>
  );
}

export default CreateTicketPageSkeleton;
