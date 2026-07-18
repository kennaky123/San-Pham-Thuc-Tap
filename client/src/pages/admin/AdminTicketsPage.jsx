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
  const totalItems = ticketList.data?.pagination.totalItems;

  return (
    <section aria-labelledby="admin-ticket-list-title">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
          Quản trị hệ thống
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="admin-ticket-list-title"
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              Quản lý ticket
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tìm kiếm, lọc và theo dõi toàn bộ yêu cầu hỗ trợ trong hệ thống.
            </p>
          </div>
          {Number.isInteger(totalItems) && !ticketList.isLoading ? (
            <p className="shrink-0 text-sm text-slate-500">
              Tổng cộng{" "}
              <span className="font-semibold text-slate-800">{totalItems}</span>{" "}
              ticket
            </p>
          ) : null}
        </div>
      </div>

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

      <div className="mt-6" aria-busy={ticketList.isLoading}>
        {ticketList.isLoading ? <TicketListSkeleton /> : null}

        {!ticketList.isLoading && ticketList.error ? (
          <TicketListErrorState
            message={getTicketListErrorMessage(ticketList.error)}
            onRetry={ticketList.refetch}
          />
        ) : null}

        {!ticketList.isLoading && ticketList.data ? (
          ticketList.data.tickets.length > 0 ? (
            <div className="space-y-4">
              <TicketList tickets={ticketList.data.tickets} />
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
