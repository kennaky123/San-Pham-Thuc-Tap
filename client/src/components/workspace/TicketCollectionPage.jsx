import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSlaDisplayForTicket } from "../../data/itsmData.js";
import useTicketList from "../../hooks/useTicketList.js";
import { getTicketListErrorMessage } from "../../services/ticketService.js";
import WorkspacePageHeader from "../common/WorkspacePageHeader.jsx";
import { TicketPriorityBadge, TicketStatusBadge } from "../ticket/TicketBadges.jsx";
import TicketListErrorState from "../ticket/TicketListErrorState.jsx";
import TicketListSkeleton from "../ticket/TicketListSkeleton.jsx";

const formatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

function TicketCollectionPage({
  eyebrow = "Cổng tự phục vụ IT",
  title = "Yêu cầu của tôi",
  description = "Tìm kiếm, lọc và theo dõi toàn bộ yêu cầu hỗ trợ bạn đã gửi.",
  actionLabel = "Theo dõi",
  headerAction,
  emptyMessage = "Không có ticket phù hợp.",
  allowedStatuses,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      search: search.trim(),
      status,
      statuses: status
        ? ""
        : allowedStatuses
          ? allowedStatuses.join(",")
          : "",
      priority,
      category: "",
      technician: "",
      sortOrder: "desc",
      page,
      limit: 8,
    }),
    [allowedStatuses, page, priority, search, status],
  );

  const ticketList = useTicketList(query);
  const tickets = ticketList.data?.tickets ?? [];
  const pagination = ticketList.data?.pagination;

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(1);
  }

  return (
    <section>
      <WorkspacePageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={headerAction}
      />
      <div className="rounded-xl border border-brand-bone bg-white p-3.5 shadow-xs">
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={resetFilters}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                !status && !priority
                  ? "bg-brand-ink text-white shadow-xs"
                  : "text-brand-slate hover:bg-brand-mist"
              }`}
            >
              Tất Cả
            </button>
            <button
              type="button"
              onClick={() =>
                updateFilter(setPriority, priority === "urgent" ? "" : "urgent")
              }
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                priority === "urgent"
                  ? "bg-brand-ink text-white shadow-xs"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-500" />
              P1 - Khẩn Cấp
            </button>
            <button
              type="button"
              onClick={() =>
                updateFilter(
                  setStatus,
                  status === "in_progress" ? "" : "in_progress",
                )
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                status === "in_progress"
                  ? "bg-brand-ink text-white shadow-xs"
                  : "text-brand-slate hover:bg-brand-mist"
              }`}
            >
              Đang Xử Lý
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-56 flex-1 sm:flex-initial">
              <span className="sr-only">Tìm ticket</span>
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-brand-ash" />
              <input
                type="search"
                value={search}
                onChange={(event) => updateFilter(setSearch, event.target.value)}
                placeholder="Tìm theo mã INC, tiêu đề..."
                className="w-full rounded-lg border border-brand-bone bg-brand-mist py-1.5 pr-3 pl-8 text-xs font-medium text-brand-ink outline-none focus:border-brand-violet focus:bg-white sm:w-64"
              />
            </label>
            <select
              value={status}
              onChange={(event) => updateFilter(setStatus, event.target.value)}
              className="rounded-lg border border-brand-bone bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
              aria-label="Lọc trạng thái"
            >
              <option value="">Trạng Thái: Tất Cả</option>
              <option value="pending">Mới Tiếp Nhận</option>
              <option value="assigned">Đã Phân Công</option>
              <option value="in_progress">Đang Xử Lý</option>
              <option value="waiting_user">Chờ User</option>
              <option value="resolved">Đã Xong</option>
              <option value="closed">Đã Đóng</option>
              <option value="cancelled">Đã Hủy</option>
            </select>
            <select
              value={priority}
              onChange={(event) => updateFilter(setPriority, event.target.value)}
              className="rounded-lg border border-brand-bone bg-brand-mist px-3 py-1.5 text-xs font-semibold text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
              aria-label="Lọc ưu tiên"
            >
              <option value="">Mức Độ: Tất Cả</option>
              <option value="urgent">P1 - Khẩn Cấp</option>
              <option value="high">P2 - Cao</option>
              <option value="medium">P3 - Vừa</option>
              <option value="low">P4 - Thấp</option>
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-bone bg-white px-3 py-1.5 text-xs font-semibold text-brand-slate hover:bg-brand-mist hover:text-brand-ink"
            >
              <SlidersHorizontal className="size-3.5" />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4" aria-busy={ticketList.isLoading}>
        {ticketList.isLoading ? <TicketListSkeleton /> : null}

        {!ticketList.isLoading && ticketList.error ? (
          <TicketListErrorState
            message={getTicketListErrorMessage(ticketList.error)}
            onRetry={ticketList.refetch}
          />
        ) : null}

        {!ticketList.isLoading && ticketList.data ? (
          <section className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
            {tickets.length ? (
              <>
                <ul className="divide-y divide-brand-bone xl:hidden">
                  {tickets.map((ticket) => {
                    const sla = getSlaDisplayForTicket(ticket);
                    return (
                      <li key={ticket._id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-bold text-brand-violet">
                              {ticket.ticketCode}
                            </p>
                            <h2 className="mt-1 text-sm font-bold text-brand-ink">
                              {ticket.title}
                            </h2>
                          </div>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <TicketStatusBadge status={ticket.status} />
                          <span className="rounded-full bg-brand-mist px-2.5 py-0.5 text-xs font-medium text-brand-slate">
                            {ticket.category?.name ??
                              ticket.category ??
                              "Không xác định"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${sla.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${sla.dot}`}
                            />
                            {sla.label}
                          </span>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <dt className="text-brand-ash">Kỹ thuật viên</dt>
                            <dd className="mt-0.5 font-semibold text-brand-ink">
                              {ticket.assignedTo?.fullName ??
                                ticket.technician ??
                                "Chưa phân công"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-brand-ash">Ngày tạo</dt>
                            <dd className="mt-0.5 font-mono text-brand-slate">
                              {ticket.createdAt
                                ? formatter.format(new Date(ticket.createdAt))
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          to={`/user/tickets/${ticket._id}`}
                          className="mt-4 flex min-h-9 w-full items-center justify-center rounded-lg bg-brand-ink text-xs font-semibold text-white hover:bg-brand-carbon"
                        >
                          {actionLabel}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="hidden overflow-x-auto xl:block">
                  <table className="w-full min-w-[68rem] text-left">
                    <thead>
                      <tr className="border-b border-brand-bone bg-brand-mist/70 text-[11px] font-bold tracking-wider text-brand-slate uppercase">
                        <th className="px-5 py-3">Mã Ticket</th>
                        <th className="px-4 py-3">Tiêu Đề & Danh Mục</th>
                        <th className="px-4 py-3">Mức Độ</th>
                        <th className="px-4 py-3">Trạng Thái</th>
                        <th className="px-4 py-3">Hạn SLA</th>
                        <th className="px-4 py-3">Kỹ Thuật Viên</th>
                        <th className="px-5 py-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-bone text-sm">
                      {tickets.map((ticket) => {
                        const sla = getSlaDisplayForTicket(ticket);
                        return (
                          <tr
                            key={ticket._id}
                            className="group transition-colors hover:bg-brand-violet/[0.03]"
                          >
                            <td className="px-5 py-3.5 font-mono text-xs font-bold whitespace-nowrap text-brand-ink group-hover:text-brand-violet">
                              <Link to={`/user/tickets/${ticket._id}`}>
                                {ticket.ticketCode}
                              </Link>
                            </td>
                            <td className="max-w-72 px-4 py-3.5">
                              <Link
                                to={`/user/tickets/${ticket._id}`}
                                className="block truncate font-semibold text-brand-ink group-hover:text-brand-violet"
                              >
                                {ticket.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-brand-ash">
                                {ticket.category?.name ??
                                  ticket.category ??
                                  "Chung"}{" "}
                                •{" "}
                                {ticket.createdAt
                                  ? formatter.format(new Date(ticket.createdAt))
                                  : "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <TicketPriorityBadge priority={ticket.priority} />
                            </td>
                            <td className="px-4 py-3.5">
                              <TicketStatusBadge status={ticket.status} />
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                                <span
                                  className={`h-2 w-2 rounded-full ${sla.dot}`}
                                />
                                <span className={sla.color}>{sla.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-semibold text-brand-ink">
                              {ticket.assignedTo?.fullName ??
                                ticket.technician ??
                                "Đang chờ gán Agent"}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Link
                                to={`/user/tickets/${ticket._id}`}
                                className="inline-flex items-center rounded-lg border border-brand-bone bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-violet hover:text-brand-violet"
                              >
                                {actionLabel} →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="font-display font-bold text-brand-ink">
                  {emptyMessage}
                </p>
                <p className="mt-1 text-xs text-brand-slate">
                  Hãy thay đổi bộ lọc để xem kết quả khác.
                </p>
                <button
                  type="button"
                  onClick={ticketList.refetch}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-ink px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-carbon"
                >
                  <RefreshCw className="size-3.5" />
                  Tải lại
                </button>
              </div>
            )}

            {pagination ? (
              <div className="flex flex-col gap-3 border-t border-brand-bone bg-brand-mist/40 px-4 py-3 text-xs text-brand-slate sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Hiển thị{" "}
                  <strong className="text-brand-ink">{tickets.length}</strong>{" "}
                  trong{" "}
                  <strong className="text-brand-ink">
                    {pagination.totalItems}
                  </strong>{" "}
                  ticket
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage(page - 1)}
                    className="flex h-7 items-center justify-center rounded-md border border-brand-bone bg-white px-2.5 font-medium text-brand-ink hover:bg-brand-mist disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" /> Trước
                  </button>
                  <span className="px-2 font-semibold text-brand-ink">
                    Trang {pagination.totalPages ? pagination.page : 1}/
                    {Math.max(1, pagination.totalPages)}
                  </span>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage(page + 1)}
                    className="flex h-7 items-center justify-center rounded-md border border-brand-bone bg-white px-2.5 font-medium text-brand-ink hover:bg-brand-mist disabled:opacity-40"
                  >
                    Sau <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  );
}

export default TicketCollectionPage;
