import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useRef } from "react";
import { getTicketListErrorMessage } from "../../services/ticketService.js";

const STATUS_OPTIONS = [
  { value: "pending", label: "Đang chờ" },
  { value: "assigned", label: "Đã phân công" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "waiting_user", label: "Chờ người dùng" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "closed", label: "Đã đóng" },
  { value: "cancelled", label: "Đã hủy" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

const selectClasses =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function TicketFilters({
  query,
  filterOptions,
  optionsError,
  optionsLoading,
  activeFilterCount,
  hasActiveFilters,
  onFilterChange,
  onReset,
  onRetryOptions,
}) {
  const searchInputRef = useRef(null);
  const categories = filterOptions?.categories ?? [];
  const technicians = filterOptions?.technicians ?? [];
  const categoryIsMissing =
    query.category && !categories.some((item) => item.id === query.category);
  const technicianIsMissing =
    query.technician &&
    !technicians.some((item) => item.id === query.technician);
  const searchInputKey = [
    query.search,
    query.status,
    query.priority,
    query.category,
    query.technician,
    query.sortOrder,
    query.page,
  ].join("|");

  function handleSearchSubmit(event) {
    event.preventDefault();
    onFilterChange("search", searchInputRef.current?.value ?? "");
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby="ticket-filters-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-5 text-slate-500" aria-hidden="true" />
          <h2
            id="ticket-filters-title"
            className="text-sm font-semibold text-slate-900"
          >
            Tìm kiếm và bộ lọc
          </h2>
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Xóa bộ lọc
        </button>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        role="search"
        onSubmit={handleSearchSubmit}
      >
        <label htmlFor="ticket-search" className="sr-only">
          Tìm theo mã ticket hoặc tiêu đề
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            key={searchInputKey}
            ref={searchInputRef}
            id="ticket-search"
            name="search"
            type="search"
            defaultValue={query.search}
            maxLength={100}
            placeholder="Nhập mã ticket hoặc tiêu đề..."
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Search className="size-4" aria-hidden="true" />
          Tìm kiếm
        </button>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <label htmlFor="status-filter" className="mb-1.5 block text-xs font-medium text-slate-600">
            Trạng thái
          </label>
          <select
            id="status-filter"
            value={query.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className={selectClasses}
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" className="mb-1.5 block text-xs font-medium text-slate-600">
            Mức độ ưu tiên
          </label>
          <select
            id="priority-filter"
            value={query.priority}
            onChange={(event) => onFilterChange("priority", event.target.value)}
            className={selectClasses}
          >
            <option value="">Tất cả mức độ</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category-filter" className="mb-1.5 block text-xs font-medium text-slate-600">
            Danh mục
          </label>
          <select
            id="category-filter"
            value={query.category}
            onChange={(event) => onFilterChange("category", event.target.value)}
            className={selectClasses}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Đang tải danh mục..." : "Tất cả danh mục"}
            </option>
            {categoryIsMissing ? (
              <option value={query.category}>Danh mục đang chọn</option>
            ) : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="technician-filter" className="mb-1.5 block text-xs font-medium text-slate-600">
            Technician
          </label>
          <select
            id="technician-filter"
            value={query.technician}
            onChange={(event) =>
              onFilterChange("technician", event.target.value)
            }
            className={selectClasses}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Đang tải technician..." : "Tất cả technician"}
            </option>
            {technicianIsMissing ? (
              <option value={query.technician}>Technician đang chọn</option>
            ) : null}
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort-filter" className="mb-1.5 block text-xs font-medium text-slate-600">
            Sắp xếp
          </label>
          <select
            id="sort-filter"
            value={query.sortOrder}
            onChange={(event) =>
              onFilterChange("sortOrder", event.target.value)
            }
            className={selectClasses}
          >
            <option value="desc">Ngày tạo: mới nhất</option>
            <option value="asc">Ngày tạo: cũ nhất</option>
          </select>
        </div>
      </div>

      {optionsError ? (
        <div
          className="mt-4 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>
            {getTicketListErrorMessage(optionsError)} Bộ lọc danh mục và
            technician tạm thời chưa khả dụng.
          </p>
          <button
            type="button"
            onClick={onRetryOptions}
            className="min-h-9 shrink-0 self-start rounded-lg px-3 py-1.5 font-semibold hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-700 sm:self-auto"
          >
            Tải lại tùy chọn
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default TicketFilters;
