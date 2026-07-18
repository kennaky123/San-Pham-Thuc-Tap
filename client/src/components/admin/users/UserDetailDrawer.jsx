import { CalendarDays, Clock3, Mail, Phone, Ticket, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { USER_ROLE, USER_STATUS } from "../../../data/adminUsers.js";
import { formatUserDate, formatUserDateTime, getInitials } from "../../../utils/adminUserFormatters.js";

function UserDetailDrawer({ user, onClose }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const status = USER_STATUS[user.status] ?? USER_STATUS.unverified;
  const role = USER_ROLE[user.role] ?? USER_ROLE.user;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/45" onClick={onClose} aria-label="Đóng thông tin người dùng" />
      <aside role="dialog" aria-modal="true" aria-labelledby={titleId} className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div><p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">Chi tiết tài khoản</p><h2 id={titleId} className="mt-1 text-xl font-bold text-slate-900">Thông tin người dùng</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X className="size-5" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F6F8FC] p-5 sm:p-6">
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">{getInitials(user.fullName)}</span>
              <div className="min-w-0"><h3 className="truncate text-lg font-bold text-slate-900">{user.fullName}</h3><p className="mt-1 text-sm text-slate-500">{user.department || "Chưa cập nhật phòng ban"}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${role.classes}`}>{role.label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.classes}`}>{status.label}</span></div></div>
            </div>
            <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 size-4 text-slate-400" /><div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-0.5 font-medium text-slate-800">{user.email}</dd></div></div>
              <div className="flex items-start gap-3"><Phone className="mt-0.5 size-4 text-slate-400" /><div><dt className="text-xs text-slate-500">Số điện thoại</dt><dd className="mt-0.5 font-medium text-slate-800">{user.phone}</dd></div></div>
              <div className="flex items-start gap-3"><UserRound className="mt-0.5 size-4 text-slate-400" /><div><dt className="text-xs text-slate-500">Mã người dùng</dt><dd className="mt-0.5 font-medium text-slate-800">{user.id}</dd></div></div>
            </dl>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-3" aria-label="Hoạt động tài khoản">
            <article className="rounded-xl border border-[#E2E8F0] bg-white p-4"><CalendarDays className="size-5 text-blue-600" /><p className="mt-3 text-xs text-slate-500">Ngày đăng ký</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatUserDate(user.createdAt)}</p></article>
            <article className="rounded-xl border border-[#E2E8F0] bg-white p-4"><Clock3 className="size-5 text-violet-600" /><p className="mt-3 text-xs text-slate-500">Đăng nhập gần nhất</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-800">{formatUserDateTime(user.lastLoginAt)}</p></article>
            <article className="rounded-xl border border-[#E2E8F0] bg-white p-4"><Ticket className="size-5 text-emerald-600" /><p className="mt-3 text-xs text-slate-500">Tổng yêu cầu</p><p className="mt-1 text-xl font-bold text-slate-900">{user.ticketCount}</p></article>
          </section>

          <section className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            <div className="border-b border-slate-200 px-5 py-4"><h3 className="font-bold text-slate-900">Yêu cầu gần đây</h3><p className="mt-1 text-xs text-slate-500">Các ticket mới nhất do người dùng tạo</p></div>
            {user.recentTickets?.length ? <ul className="divide-y divide-slate-100">{user.recentTickets.map((ticket) => <li key={ticket.code} className="px-5 py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-blue-700">{ticket.code}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{ticket.title}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{ticket.status}</span></div></li>)}</ul> : <p className="px-5 py-8 text-center text-sm text-slate-500">Người dùng chưa tạo yêu cầu nào.</p>}
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

export default UserDetailDrawer;
