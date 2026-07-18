import { ChevronLeft, ChevronRight } from "lucide-react";

function getVisiblePages(currentPage, totalPages) {
  const pageNumbers = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedPages = [...pageNumbers]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const result = [];

  for (const page of sortedPages) {
    const previousPage = result.at(-1);

    if (typeof previousPage === "number" && page - previousPage > 1) {
      result.push(`ellipsis-${previousPage}-${page}`);
    }

    result.push(page);
  }

  return result;
}

function TicketPagination({ pagination, onPageChange }) {
  const { page, limit, totalItems, totalPages, hasPreviousPage, hasNextPage } =
    pagination;

  if (totalItems === 0 || totalPages === 0) {
    return null;
  }

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, totalItems);
  const visiblePages = getVisiblePages(page, totalPages);
  const navigationButtonClasses =
    "inline-flex size-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      aria-label="Phân trang danh sách ticket"
    >
      <p className="text-center text-sm text-slate-600 sm:text-left">
        Hiển thị <span className="font-semibold text-slate-800">{firstItem}</span>
        –<span className="font-semibold text-slate-800">{lastItem}</span> trong
        tổng số <span className="font-semibold text-slate-800">{totalItems}</span>
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className={navigationButtonClasses}
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        <span className="min-w-24 text-center text-sm font-medium text-slate-700 sm:hidden">
          Trang {page}/{totalPages}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={[
                  "inline-flex size-11 items-center justify-center rounded-lg text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                  item === page
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
                aria-label={`Trang ${item}`}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="inline-flex size-8 items-center justify-center text-slate-400"
                aria-hidden="true"
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={navigationButtonClasses}
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default TicketPagination;
