import { Link, useNavigate } from "react-router-dom";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges.jsx";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatCreatedAt(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

function TicketList({ tickets }) {
  const navigate = useNavigate();

  function handleRowClick(event, ticketId) {
    if (event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    navigate(`/admin/tickets/${ticketId}`);
  }

  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="ticket-results-title"
    >
      <h2 id="ticket-results-title" className="sr-only">
        Kết quả danh sách ticket
      </h2>

      <ul className="divide-y divide-slate-100 xl:hidden">
        {tickets.map((ticket) => (
          <li key={ticket._id}>
            <Link
              to={`/admin/tickets/${ticket._id}`}
              className="block p-4 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:p-5"
              aria-label={`Xem chi tiết ${ticket.ticketCode}: ${ticket.title}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-700">
                    {ticket.ticketCode}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                    {ticket.title}
                  </h3>
                </div>
                <TicketPriorityBadge priority={ticket.priority} />
              </div>

              <div className="mt-3">
                <TicketStatusBadge status={ticket.status} />
              </div>

              <dl className="mt-4 grid gap-x-4 gap-y-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Người gửi</dt>
                  <dd className="mt-1 truncate font-medium text-slate-700">
                    {ticket.createdBy?.fullName ?? "Không xác định"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Danh mục</dt>
                  <dd className="mt-1 truncate font-medium text-slate-700">
                    {ticket.category?.name ?? "Không xác định"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Technician</dt>
                  <dd className="mt-1 truncate font-medium text-slate-700">
                    {ticket.assignedTo?.fullName ?? "Chưa phân công"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Ngày tạo</dt>
                  <dd className="mt-1 font-medium text-slate-700">
                    <time dateTime={ticket.createdAt}>
                      {formatCreatedAt(ticket.createdAt)}
                    </time>
                  </dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[68rem] border-collapse text-left">
          <caption className="sr-only">
            Danh sách ticket gồm mã, tiêu đề, người gửi, danh mục, ưu tiên,
            trạng thái, technician và ngày tạo
          </caption>
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">
                Mã ticket
              </th>
              <th scope="col" className="px-4 py-3">
                Tiêu đề
              </th>
              <th scope="col" className="px-4 py-3">
                Người gửi
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
              <th scope="col" className="px-4 py-3">
                Technician
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                onClick={(event) => handleRowClick(event, ticket._id)}
                className="cursor-pointer transition hover:bg-blue-50/40"
              >
                <td className="whitespace-nowrap px-5 py-4 align-top">
                  <Link
                    to={`/admin/tickets/${ticket._id}`}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {ticket.ticketCode}
                  </Link>
                </td>
                <td className="max-w-72 px-4 py-4 align-top">
                  <Link
                    to={`/admin/tickets/${ticket._id}`}
                    className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="max-w-44 px-4 py-4 align-top text-sm text-slate-600">
                  <span className="block truncate">
                    {ticket.createdBy?.fullName ?? "Không xác định"}
                  </span>
                </td>
                <td className="max-w-40 px-4 py-4 align-top text-sm text-slate-600">
                  <span className="block truncate">
                    {ticket.category?.name ?? "Không xác định"}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <TicketPriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-4 align-top">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="max-w-44 px-4 py-4 align-top text-sm text-slate-600">
                  <span className="block truncate">
                    {ticket.assignedTo?.fullName ?? "Chưa phân công"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right align-top text-xs text-slate-500">
                  <time dateTime={ticket.createdAt}>
                    {formatCreatedAt(ticket.createdAt)}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TicketList;
