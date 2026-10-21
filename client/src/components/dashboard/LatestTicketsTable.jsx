import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDashboardDateTime } from "../../utils/dashboardFormatters.js";
import { TicketPriorityBadge, TicketStatusBadge } from "../ticket/TicketBadges.jsx";

function LatestTicketsTable({ tickets, timeZone }) {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs"
      aria-labelledby="latest-tickets-title"
    >
      <div className="flex items-center justify-between border-b border-brand-bone px-5 py-4">
        <div>
          <h2
            id="latest-tickets-title"
            className="font-display text-sm font-bold text-brand-ink"
          >
            5 Ticket Mới Nhất Vừa Tiếp Nhận
          </h2>
          <p className="mt-0.5 text-xs text-brand-slate">
            Luồng sự kiện trực tiếp từ hàng đợi trung tâm
          </p>
        </div>
        <Link
          to="/admin/tickets"
          className="text-xs font-semibold text-brand-violet hover:underline"
        >
          Mở Hàng Đợi →
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-mist text-brand-ash">
            <Inbox className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-brand-ink">
            Chưa có ticket nào
          </p>
          <p className="mt-1 text-xs text-brand-slate">
            Ticket mới sẽ xuất hiện tại đây sau khi được tạo.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-brand-bone md:hidden">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/tickets/${ticket.id}`}
                      className="font-mono text-xs font-bold text-brand-violet"
                    >
                      {ticket.ticketCode}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-brand-ink">
                      {ticket.title}
                    </p>
                  </div>
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-xs text-brand-slate">
                    {ticket.category?.name ?? "Chưa có danh mục"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-ash">
                  <span>{ticket.requester?.fullName ?? "Không xác định"}</span>
                  <time dateTime={ticket.createdAt} className="font-mono">
                    {formatDashboardDateTime(ticket.createdAt, timeZone)}
                  </time>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <thead className="border-b border-brand-bone bg-brand-mist/70 text-[11px] font-bold tracking-wider text-brand-slate uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Mã &amp; Tiêu Đề Ticket
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Danh Mục
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Mức Độ
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trạng Thái
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Thời Gian Tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-bone">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="group transition-colors hover:bg-brand-violet/[0.03]"
                  >
                    <td className="max-w-sm px-5 py-3.5 align-top">
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="font-mono text-xs font-bold text-brand-ink group-hover:text-brand-violet"
                      >
                        {ticket.ticketCode}
                      </Link>
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="mt-0.5 block truncate text-sm font-semibold text-brand-ink group-hover:text-brand-violet"
                      >
                        {ticket.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-brand-ash">
                        Người gửi:{" "}
                        {ticket.requester?.fullName ?? "Không xác định"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-brand-slate">
                      {ticket.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs whitespace-nowrap text-brand-ash">
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
