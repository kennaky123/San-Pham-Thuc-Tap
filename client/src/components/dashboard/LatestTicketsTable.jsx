import { Inbox } from "lucide-react";
import { formatDashboardDateTime } from "../../utils/dashboardFormatters.js";

const STATUS_CLASSES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  assigned: "bg-blue-50 text-blue-700 ring-blue-600/20",
  in_progress: "bg-violet-50 text-violet-700 ring-violet-600/20",
  waiting_user: "bg-orange-50 text-orange-700 ring-orange-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  closed: "bg-slate-100 text-slate-700 ring-slate-500/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
};

const PRIORITY_CLASSES = {
  low: "bg-slate-100 text-slate-700 ring-slate-500/20",
  medium: "bg-blue-50 text-blue-700 ring-blue-600/20",
  high: "bg-orange-50 text-orange-700 ring-orange-600/20",
  urgent: "bg-red-50 text-red-700 ring-red-600/20",
};

function TicketBadge({ label, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ ticket }) {
  return (
    <TicketBadge
      label={ticket.statusLabel || ticket.status}
      className={
        STATUS_CLASSES[ticket.status] ??
        "bg-slate-100 text-slate-700 ring-slate-500/20"
      }
    />
  );
}

function PriorityBadge({ ticket }) {
  return (
    <TicketBadge
      label={ticket.priorityLabel || ticket.priority}
      className={
        PRIORITY_CLASSES[ticket.priority] ??
        "bg-slate-100 text-slate-700 ring-slate-500/20"
      }
    />
  );
}

function LatestTicketsTable({ tickets, timeZone }) {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="latest-tickets-title"
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2
          id="latest-tickets-title"
          className="text-base font-semibold text-slate-900"
        >
          5 ticket mới nhất
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Các yêu cầu vừa được gửi vào hệ thống
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Inbox className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Chưa có ticket nào
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ticket mới sẽ xuất hiện tại đây sau khi được tạo.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 md:hidden">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-700">
                      {ticket.ticketCode}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                      {ticket.title}
                    </p>
                  </div>
                  <PriorityBadge ticket={ticket} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge ticket={ticket} />
                  <span className="text-xs text-slate-500">
                    {ticket.category?.name ?? "Chưa có danh mục"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{ticket.requester?.fullName ?? "Không xác định"}</span>
                  <time dateTime={ticket.createdAt}>
                    {formatDashboardDateTime(ticket.createdAt, timeZone)}
                  </time>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <caption className="sr-only">
                Danh sách tối đa 5 ticket mới nhất trong hệ thống
              </caption>
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Ticket
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Danh mục
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ưu tiên
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/70">
                    <td className="max-w-sm px-5 py-4 align-top">
                      <p className="text-xs font-bold text-blue-700">
                        {ticket.ticketCode}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {ticket.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        Người tạo: {ticket.requester?.fullName ?? "Không xác định"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {ticket.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge ticket={ticket} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge ticket={ticket} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-xs text-slate-500">
                      <time dateTime={ticket.createdAt}>
                        {formatDashboardDateTime(ticket.createdAt, timeZone)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default LatestTicketsTable;
