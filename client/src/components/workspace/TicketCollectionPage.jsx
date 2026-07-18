import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { TicketPriorityBadge, TicketStatusBadge } from "../ticket/TicketBadges.jsx";
import WorkspacePageHeader from "../common/WorkspacePageHeader.jsx";
import { normalizeSearch } from "../../utils/adminUserFormatters.js";

const formatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

function TicketCollectionPage({ eyebrow, title, description, tickets, actionLabel = "Xem chi tiết", headerAction, emptyMessage = "Không có ticket phù hợp.", allowedStatuses }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(() => tickets.filter((ticket) => {
    const matchesSearch = normalizeSearch(`${ticket.ticketCode} ${ticket.title} ${ticket.requester}`).includes(normalizeSearch(search));
    return matchesSearch && (!status || ticket.status === status) && (!priority || ticket.priority === priority) && (!allowedStatuses || allowedStatuses.includes(ticket.status));
  }), [allowedStatuses, priority, search, status, tickets]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const update = (setter, value) => { setter(value); setPage(1); };

  return (
    <section>
      <WorkspacePageHeader eyebrow={eyebrow} title={title} description={description} actions={headerAction} />
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_13rem_13rem_auto]">
          <label className="relative"><span className="sr-only">Tìm ticket</span><Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => update(setSearch, event.target.value)} placeholder="Tìm theo mã, tiêu đề, người gửi..." className="min-h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" /></label>
          <select value={status} onChange={(event) => update(setStatus, event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option value="pending">Đang chờ</option><option value="assigned">Đã phân công</option><option value="in_progress">Đang xử lý</option><option value="waiting_user">Chờ người dùng</option><option value="resolved">Đã giải quyết</option><option value="closed">Đã đóng</option><option value="cancelled">Đã hủy</option></select>
          <select value={priority} onChange={(event) => update(setPriority, event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" aria-label="Lọc ưu tiên"><option value="">Tất cả ưu tiên</option><option value="urgent">Khẩn cấp</option><option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option></select>
          <button type="button" onClick={() => { setSearch(""); setStatus(""); setPriority(""); setPage(1); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><SlidersHorizontal className="size-4" />Đặt lại</button>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        {visible.length ? <>
          <ul className="divide-y divide-slate-100 xl:hidden">{visible.map((ticket) => <li key={ticket.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-700">{ticket.ticketCode}</p><h2 className="mt-1 text-sm font-semibold text-slate-900">{ticket.title}</h2></div><TicketPriorityBadge priority={ticket.priority} /></div><div className="mt-3 flex flex-wrap gap-2"><TicketStatusBadge status={ticket.status} /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{ticket.category}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-500">Người gửi</dt><dd className="mt-1 font-medium text-slate-700">{ticket.requester}</dd></div><div><dt className="text-slate-500">Cập nhật</dt><dd className="mt-1 font-medium text-slate-700">{formatter.format(new Date(ticket.updatedAt))}</dd></div><div><dt className="text-slate-500">Kỹ thuật viên</dt><dd className="mt-1 font-medium text-slate-700">{ticket.technician}</dd></div><div><dt className="text-slate-500">SLA</dt><dd className="mt-1 font-medium text-slate-700">{ticket.sla}</dd></div></dl><button type="button" onClick={() => toast.info(`${actionLabel}: ${ticket.ticketCode}`)} className="mt-4 min-h-10 w-full rounded-lg border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100">{actionLabel}</button></li>)}</ul>
          <div className="hidden overflow-x-auto xl:block"><table className="w-full min-w-[68rem] text-left"><thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase"><tr><th className="px-5 py-3">Mã ticket</th><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Người gửi</th><th className="px-4 py-3">Danh mục</th><th className="px-4 py-3">Ưu tiên</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">SLA</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((ticket) => <tr key={ticket.id} className="hover:bg-blue-50/40"><td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-blue-700">{ticket.ticketCode}</td><td className="max-w-72 px-4 py-4"><p className="truncate text-sm font-semibold text-slate-900">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">{formatter.format(new Date(ticket.createdAt))}</p></td><td className="px-4 py-4 text-sm text-slate-600">{ticket.requester}</td><td className="px-4 py-4 text-sm text-slate-600">{ticket.category}</td><td className="px-4 py-4"><TicketPriorityBadge priority={ticket.priority} /></td><td className="px-4 py-4"><TicketStatusBadge status={ticket.status} /></td><td className="px-4 py-4 text-xs font-medium text-slate-600">{ticket.sla}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => toast.info(`${actionLabel}: ${ticket.ticketCode}`)} className="min-h-9 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">{actionLabel}</button></td></tr>)}</tbody></table></div>
        </> : <div className="py-20 text-center"><p className="font-semibold text-slate-800">{emptyMessage}</p><p className="mt-1 text-sm text-slate-500">Hãy thay đổi bộ lọc để xem kết quả khác.</p></div>}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600">Hiển thị <strong>{visible.length}</strong> trong <strong>{filtered.length}</strong> ticket</p><div className="flex items-center gap-2"><button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="flex size-10 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"><ChevronLeft className="size-4" /></button><span className="text-sm font-medium text-slate-700">Trang {safePage}/{totalPages}</span><button type="button" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} className="flex size-10 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div>
      </section>
    </section>
  );
}

export default TicketCollectionPage;
