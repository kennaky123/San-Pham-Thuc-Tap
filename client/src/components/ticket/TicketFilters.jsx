import { RotateCcw, Search } from "lucide-react";
import { useRef } from "react";
import { getTicketListErrorMessage } from "../../services/ticketService.js";

const STATUS_OPTIONS = [
  { value: "pending", label: "Mới Tiếp Nhận" },
  { value: "assigned", label: "Đã Phân Công" },
  { value: "in_progress", label: "Đang Xử Lý" },
  { value: "waiting_user", label: "Chờ User" },
  { value: "resolved", label: "Đã Xong" },
  { value: "closed", label: "Đã Đóng" },
  { value: "cancelled", label: "Đã Hủy" },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "P1 - Khẩn Cấp" },
  { value: "high", label: "P2 - Cao" },
  { value: "medium", label: "P3 - Vừa" },
  { value: "low", label: "P4 - Thấp" },
];

const selectClasses =
  "rounded-lg border border-brand-bone bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-ink outline-none transition focus:border-brand-violet focus:bg-white disabled:cursor-not-allowed disabled:opacity-50";

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

  const activePill = !query.status && !query.priority
    ? "all"
    : query.priority === "urgent"
      ? "p1"
      : query.status === "pending"
        ? "unassigned"
        : query.status === "in_progress"
          ? "in_progress"
          : "custom";

  return (
    <section
      className="rounded-xl border border-brand-bone bg-white p-3.5 shadow-xs"
      aria-labelledby="ticket-filters-title"
    >
      <h2 id="ticket-filters-title" className="sr-only">
        Tìm kiếm và bộ lọc
      </h2>

      {/* Top Row: Quick Filter Pills & Search */}
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        {/* Quick Filter Pills from DeskPro IT */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onReset}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePill === "all"
                ? "bg-brand-ink text-white shadow-xs"
                : "text-brand-slate hover:bg-brand-mist"
            }`}
          >
            Tất Cả
          </button>
          <button
            type="button"
            onClick={() => {
              onFilterChange("priority", query.priority === "urgent" ? "" : "urgent");
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePill === "p1"
                ? "bg-brand-ink text-white shadow-xs"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            P1 - Khẩn Cấp
          </button>
          <button
            type="button"
            onClick={() => {
              onFilterChange("status", query.status === "pending" ? "" : "pending");
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePill === "unassigned"
                ? "bg-brand-ink text-white shadow-xs"
                : "text-brand-slate hover:bg-brand-mist"
            }`}
          >
            Mới Tiếp Nhận
          </button>
          <button
            type="button"
            onClick={() => {
              onFilterChange("status", query.status === "in_progress" ? "" : "in_progress");
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePill === "in_progress"
                ? "bg-brand-ink text-white shadow-xs"
                : "text-brand-slate hover:bg-brand-mist"
            }`}
          >
            Đang Xử Lý
          </button>
        </div>

        {/* Right Side: Search + Select Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <form
            className="relative min-w-56 flex-1 sm:flex-initial"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-brand-ash"
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
              placeholder="Lọc theo mã INC, tiêu đề, người gửi..."
              className="w-full rounded-lg border border-brand-bone bg-brand-mist py-1.5 pr-3 pl-8 text-xs font-medium text-brand-ink outline-none transition placeholder:text-brand-ash focus:border-brand-violet focus:bg-white sm:w-64"
            />
          </form>

          <select
            id="status-filter"
            aria-label="Lọc theo trạng thái"
            value={query.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className={selectClasses}
          >
            <option value="">Trạng Thái: Tất Cả</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            id="priority-filter"
            aria-label="Lọc theo mức độ ưu tiên"
            value={query.priority}
            onChange={(event) => onFilterChange("priority", event.target.value)}
            className={selectClasses}
          >
            <option value="">Mức Độ: Tất Cả</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            id="category-filter"
            aria-label="Lọc theo danh mục"
            value={query.category}
            onChange={(event) => onFilterChange("category", event.target.value)}
            className={selectClasses}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Đang tải danh mục..." : "Danh Mục: Tất Cả"}
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

          <select
            id="technician-filter"
            aria-label="Lọc theo kỹ thuật viên"
            value={query.technician}
            onChange={(event) =>
              onFilterChange("technician", event.target.value)
            }
            className={selectClasses}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Đang tải..." : "Kỹ Thuật Viên: Tất Cả"}
            </option>
            {technicianIsMissing ? (
              <option value={query.technician}>Kỹ thuật viên đang chọn</option>
            ) : null}
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>

          <select
            id="sort-filter"
            aria-label="Sắp xếp"
            value={query.sortOrder}
            onChange={(event) =>
              onFilterChange("sortOrder", event.target.value)
            }
            className={selectClasses}
          >
            <option value="desc">Mới nhất trước</option>
            <option value="asc">Cũ nhất trước</option>
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-bone bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-slate transition hover:bg-brand-mist hover:text-brand-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Đặt lại ({activeFilterCount})
            </button>
          ) : null}
        </div>
      </div>

      {optionsError ? (
        <div
          className="mt-3 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>
            {getTicketListErrorMessage(optionsError)} Bộ lọc danh mục và kỹ
            thuật viên tạm thời chưa khả dụng.
          </p>
          <button
            type="button"
            onClick={onRetryOptions}
            className="shrink-0 rounded-lg px-2.5 py-1 font-semibold hover:bg-amber-100"
          >
            Tải lại tùy chọn
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default TicketFilters;
