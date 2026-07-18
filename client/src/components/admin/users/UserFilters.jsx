import { RotateCcw, Search } from "lucide-react";

const inputClasses = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

function UserFilters({ filters, onChange, onReset }) {
  const hasFilters = Boolean(filters.search || filters.status || filters.role);

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm" aria-label="Bộ lọc người dùng">
      <div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_13rem_13rem_auto]">
        <label className="relative block">
          <span className="sr-only">Tìm kiếm người dùng</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className={`${inputClasses} pl-10`}
          />
        </label>

        <label>
          <span className="sr-only">Lọc theo trạng thái</span>
          <select value={filters.status} onChange={(event) => onChange("status", event.target.value)} className={inputClasses}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Lọc theo vai trò</span>
          <select value={filters.role} onChange={(event) => onChange("role", event.target.value)} className={inputClasses}>
            <option value="">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Làm mới bộ lọc
        </button>
      </div>
    </section>
  );
}

export default UserFilters;
