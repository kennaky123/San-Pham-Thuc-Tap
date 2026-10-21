import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSlaDisplayForTicket } from "../../data/itsmData.js";
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

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function TicketList({ tickets, basePath = "/admin/tickets" }) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected =
    tickets.length > 0 && selectedIds.length === tickets.length;

  function toggleSelectAll(checked) {
    if (checked) {
      setSelectedIds(tickets.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleRowSelection(ticketId) {
    setSelectedIds((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId],
    );
  }

  function handleRowClick(event, ticketId) {
    if (event.target.closest("a, button, input, select, textarea, label")) {
      return;
    }
    navigate(`${basePath}/${ticketId}`);
  }

  return (
    <section className="min-w-0" aria-labelledby="ticket-results-title">
      <h2 id="ticket-results-title" className="sr-only">
        Kết quả danh sách ticket
      </h2>

      {/* Bulk Action Bar (Shown when checkboxes selected) */}
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-violet/20 bg-brand-violet/10 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-violet">
            <span>Đã chọn {selectedIds.length} ticket</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toast.info(
                  `Mở chi tiết ticket đầu tiên để gán kỹ thuật viên (${selectedIds.length} đã chọn).`,
                );
                navigate(`${basePath}/${selectedIds[0]}`);
              }}
              className="rounded-lg border border-brand-bone bg-white px-3 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-mist"
            >
              Xử Lý Ngay
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-brand-bone bg-white px-3 py-1 text-xs font-semibold text-brand-slate transition-colors hover:bg-brand-mist"
            >
              Bỏ Chọn
            </button>
          </div>
        </div>
      ) : null}

      {/* Mobile Cards */}
      <ul className="divide-y divide-brand-bone xl:hidden">
        {tickets.map((ticket) => {
          const sla = getSlaDisplayForTicket(ticket);
          return (
            <li key={ticket._id}>
              <Link
                to={`${basePath}/${ticket._id}`}
                className="block p-4 transition hover:bg-brand-mist/60 sm:p-5"
                aria-label={`Xem chi tiết ${ticket.ticketCode}: ${ticket.title}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-brand-violet">
                      {ticket.ticketCode}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-brand-ink">
                      {ticket.title}
                    </h3>
                  </div>
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${sla.color}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${sla.dot}`} />
                    SLA: {sla.label}
                  </span>
                </div>

                <dl className="mt-4 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-brand-ash">Người yêu cầu</dt>
                    <dd className="mt-0.5 truncate font-semibold text-brand-ink">
                      {ticket.createdBy?.fullName ?? "Không xác định"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-ash">Danh mục</dt>
                    <dd className="mt-0.5 truncate font-medium text-brand-slate">
                      {ticket.category?.name ?? "Không xác định"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-ash">Phụ trách</dt>
                    <dd className="mt-0.5 truncate font-medium text-brand-slate">
                      {ticket.assignedTo?.fullName ?? "Chưa phân công"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-ash">Cập nhật</dt>
                    <dd className="mt-0.5 font-mono text-brand-slate">
                      {formatCreatedAt(ticket.createdAt)}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop High-Density Table (Matches DeskPro IT View 1) */}
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-bone bg-brand-mist/70 text-[11px] font-bold tracking-wider text-brand-slate uppercase">
              <th scope="col" className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  aria-label="Chọn tất cả ticket"
                  className="h-3.5 w-3.5 cursor-pointer rounded border-brand-ash text-brand-violet focus:ring-brand-violet"
                />
              </th>
              <th scope="col" className="w-28 px-3 py-3">
                Mã Ticket
              </th>
              <th scope="col" className="px-4 py-3">
                Tiêu Đề & Danh Mục
              </th>
              <th scope="col" className="w-32 px-3 py-3">
                Mức Độ
              </th>
              <th scope="col" className="w-36 px-3 py-3">
                Trạng Thái
              </th>
              <th scope="col" className="w-36 px-3 py-3">
                Hạn SLA
              </th>
              <th scope="col" className="w-48 px-3 py-3">
                Người Yêu Cầu
              </th>
              <th scope="col" className="w-44 px-4 py-3">
                Phụ Trách
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-bone text-sm">
            {tickets.map((ticket) => {
              const sla = getSlaDisplayForTicket(ticket);
              const isSelected = selectedIds.includes(ticket._id);
              const assigneeName = ticket.assignedTo?.fullName;

              return (
                <tr
                  key={ticket._id}
                  onClick={(event) => handleRowClick(event, ticket._id)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-brand-violet/5"
                      : "hover:bg-brand-violet/[0.03]"
                  }`}
                >
                  <td
                    className="px-4 py-3.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(ticket._id)}
                      aria-label={`Chọn ticket ${ticket.ticketCode}`}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-brand-ash text-brand-violet focus:ring-brand-violet"
                    />
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <Link
                      to={`${basePath}/${ticket._id}`}
                      className="font-mono text-xs font-bold text-brand-ink transition-colors group-hover:text-brand-violet"
                    >
                      {ticket.ticketCode}
                    </Link>
                  </td>
                  <td className="max-w-md px-4 py-3.5">
                    <div className="flex flex-col">
                      <Link
                        to={`${basePath}/${ticket._id}`}
                        className="line-clamp-1 font-semibold text-brand-ink transition-colors group-hover:text-brand-violet"
                      >
                        {ticket.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-brand-ash">
                        <span className="inline-flex items-center gap-1 font-medium text-brand-slate">
                          {ticket.category?.name ?? "Chung"}
                        </span>
                        <span>•</span>
                        <span>Cập nhật {formatCreatedAt(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <TicketPriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                      <span
                        className={`h-2 w-2 rounded-full ${sla.dot}`}
                      />
                      <span className={sla.color}>{sla.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex flex-col">
                      <span className="truncate text-xs font-semibold text-brand-ink">
                        {ticket.createdBy?.fullName ?? "Không xác định"}
                      </span>
                      <span className="truncate text-[11px] text-brand-ash">
                        {ticket.createdBy?.department ||
                          ticket.createdBy?.email ||
                          "Nội bộ"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {assigneeName ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-violet text-[10px] font-bold text-white">
                          {getInitials(assigneeName)}
                        </div>
                        <span className="truncate text-xs font-medium text-brand-ink">
                          {assigneeName}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-amber-400 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                        + Nhận xử lý
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TicketList;
