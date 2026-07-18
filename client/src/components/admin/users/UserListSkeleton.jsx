function UserListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm" role="status" aria-label="Đang tải danh sách người dùng">
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="h-12 bg-slate-100" />
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-4 border-t border-slate-100 px-5 py-4">
            <div className="size-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2"><div className="h-3 w-40 rounded bg-slate-200" /><div className="h-3 w-56 max-w-full rounded bg-slate-100" /></div>
            <div className="hidden h-7 w-24 rounded-full bg-slate-100 sm:block" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

export default UserListSkeleton;
