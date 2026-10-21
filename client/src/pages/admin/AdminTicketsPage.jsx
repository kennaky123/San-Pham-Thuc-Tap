import { useMemo } from "react";
import { Link } from "react-router-dom";
import TicketFilters from "../../components/ticket/TicketFilters.jsx";
import TicketList from "../../components/ticket/TicketList.jsx";
import TicketListEmptyState from "../../components/ticket/TicketListEmptyState.jsx";
import TicketListErrorState from "../../components/ticket/TicketListErrorState.jsx";
import TicketListSkeleton from "../../components/ticket/TicketListSkeleton.jsx";
import TicketPagination from "../../components/ticket/TicketPagination.jsx";
import useTicketList, {
  useTicketFilterOptions,
} from "../../hooks/useTicketList.js";
import useTicketListQuery from "../../hooks/useTicketListQuery.js";
import { getTicketListErrorMessage } from "../../services/ticketService.js";

function AdminTicketsPage() {
  const {
    query,
    setFilter,
    setPage,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useTicketListQuery();
  const ticketList = useTicketList(query);
  const filterOptions = useTicketFilterOptions();
  const tickets = useMemo(
    () => ticketList.data?.tickets ?? [],
    [ticketList.data?.tickets],
  );
  const totalItems = ticketList.data?.pagination?.totalItems ?? tickets.length;

  const queueMetrics = useMemo(() => {
    const openCount = tickets.filter(
      (t) => !["resolved", "closed", "cancelled"].includes(t.status),
    ).length;
    const p1Count = tickets.filter(
      (t) =>
        t.priority === "urgent" &&
        !["resolved", "closed", "cancelled"].includes(t.status),
    ).length;
    const unassignedCount = tickets.filter(
      (t) =>
        !t.assignedTo &&
        !["resolved", "closed", "cancelled"].includes(t.status),
    ).length;

    return {
      openCount: totalItems || openCount,
      p1Count,
      unassignedCount,
    };
  }, [tickets, totalItems]);

  return (
    <section
      aria-labelledby="admin-ticket-list-title"
      className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6"
    >
      {/* Operational Stats Bar (5-Metric Grid from DeskPro IT) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col justify-between rounded-xl border border-brand-bone bg-white p-4 shadow-xs transition-colors hover:border-brand-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-brand-slate uppercase">
              Tổng Ticket Hệ Thống
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-violet/10 text-brand-violet">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold text-brand-ink">
              {queueMetrics.openCount}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-brand-emerald">
              Real-time Queue
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-red-700 uppercase">
              Nguy Cơ Quá Hạn SLA (P1)
            </span>
            <span className="pulse-sla flex h-6 w-6 items-center justify-center rounded-md bg-red-100 text-red-600">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold text-red-600">
              {queueMetrics.p1Count}
            </span>
            <button
              type="button"
              onClick={() =>
                setFilter(
                  "priority",
                  query.priority === "urgent" ? "" : "urgent",
                )
              }
              className="text-xs font-semibold text-red-600 underline hover:text-red-800"
            >
              Lọc khẩn cấp →
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-brand-bone bg-white p-4 shadow-xs transition-colors hover:border-brand-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-brand-slate uppercase">
              Chưa Phân Công
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-600">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold text-brand-ink">
              {queueMetrics.unassignedCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setFilter(
                  "status",
                  query.status === "pending" ? "" : "pending",
                )
              }
              className="text-xs font-semibold text-brand-violet hover:underline"
            >
              Lọc chờ gán →
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-brand-bone bg-white p-4 shadow-xs transition-colors hover:border-brand-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-brand-slate uppercase">
              Thời Gian Phản Hồi TB
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-blue/10 text-brand-blue">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold text-brand-ink">
              11p 20s
            </span>
            <span className="text-xs font-medium text-brand-emerald">
              Mục tiêu &lt; 15p
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-brand-bone bg-white p-4 shadow-xs transition-colors hover:border-brand-ash">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-brand-slate uppercase">
              Hài Lòng (CSAT)
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-emerald/10 text-brand-emerald">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold text-brand-ink">
              98.4%
            </span>
            <Link
              to="/topology"
              className="text-xs font-semibold text-brand-violet hover:underline"
            >
              Sơ đồ mạng →
            </Link>
          </div>
        </div>
      </div>

      <h1 id="admin-ticket-list-title" className="sr-only">
        Hàng Đợi Ticket IT Help Desk
      </h1>

      <TicketFilters
        query={query}
        filterOptions={filterOptions.data}
        optionsError={filterOptions.error}
        optionsLoading={filterOptions.isLoading}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        onRetryOptions={filterOptions.refetch}
      />

      <div className="mt-4" aria-busy={ticketList.isLoading}>
        {ticketList.isLoading ? <TicketListSkeleton /> : null}

        {!ticketList.isLoading && ticketList.error ? (
          <TicketListErrorState
            message={getTicketListErrorMessage(ticketList.error)}
            onRetry={ticketList.refetch}
          />
        ) : null}

        {!ticketList.isLoading && ticketList.data ? (
          ticketList.data.tickets.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
              <TicketList
                tickets={ticketList.data.tickets}
                onRefresh={ticketList.refetch}
              />
              <TicketPagination
                pagination={ticketList.data.pagination}
                onPageChange={setPage}
              />
            </div>
          ) : (
            <TicketListEmptyState
              hasActiveFilters={hasActiveFilters || query.page > 1}
              onReset={resetFilters}
            />
          )
        ) : null}
      </div>
    </section>
  );
}

export default AdminTicketsPage;
