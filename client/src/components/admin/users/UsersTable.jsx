import { ChevronLeft, ChevronRight, Edit3, Eye, LockKeyhole, MoreHorizontal, Trash2, UnlockKeyhole, UserRoundX } from "lucide-react";
import { useRef } from "react";
import useClickOutside from "../../../hooks/useClickOutside.js";
import { USER_ROLE, USER_STATUS } from "../../../data/adminUsers.js";
import { formatUserDate, getInitials } from "../../../utils/adminUserFormatters.js";

function StatusBadge({ status }) {
  const config = USER_STATUS[status] ?? USER_STATUS.unverified;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.classes}`}>{config.label}</span>;
}

function RoleBadge({ role }) {
  const config = USER_ROLE[role] ?? USER_ROLE.user;
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${config.classes}`}>{config.label}</span>;
}

function UserIdentity({ user }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700" aria-hidden="true">{getInitials(user.fullName)}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
}

function UserActionMenu({ user, open, onToggle, onClose, onView, onEdit, onToggleLock, onDelete }) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose, open);
  const ActionIcon = user.status === "locked" ? UnlockKeyhole : LockKeyhole;

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button type="button" onClick={onToggle} className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600" aria-label={`Thao tác với ${user.fullName}`} aria-expanded={open}>
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute top-11 right-0 z-30 w-56 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl" role="menu">
          <button type="button" onClick={onView} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem"><Eye className="size-4" />Xem chi tiết</button>
          <button type="button" onClick={onEdit} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem"><Edit3 className="size-4" />Chỉnh sửa</button>
          <button type="button" onClick={onToggleLock} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-50" role="menuitem"><ActionIcon className="size-4" />{user.status === "locked" ? "Mở khóa tài khoản" : "Khóa tài khoản"}</button>
          <div className="my-1 border-t border-slate-100" />
          <button type="button" onClick={onDelete} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-red-700 hover:bg-red-50" role="menuitem"><Trash2 className="size-4" />Xóa tài khoản</button>
        </div>
      ) : null}
    </div>
  );
}

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
      <p className="text-sm text-slate-600">Hiển thị <strong className="text-slate-800">{first}–{last}</strong> trong tổng số <strong className="text-slate-800">{total}</strong> bản ghi</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Số dòng
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
            {[5, 10, 20].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <nav className="flex items-center gap-1" aria-label="Phân trang người dùng">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="flex size-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Trang trước"><ChevronLeft className="size-4" /></button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
            <button key={item} type="button" onClick={() => onPageChange(item)} aria-current={item === page ? "page" : undefined} className={`size-10 rounded-lg text-sm font-semibold ${item === page ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{item}</button>
          ))}
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="flex size-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Trang sau"><ChevronRight className="size-4" /></button>
        </nav>
      </div>
    </div>
  );
}

function UsersTable({ users, total, page, pageSize, selectedIds, openMenuId, onSelect, onSelectPage, onMenuToggle, onMenuClose, onView, onEdit, onToggleLock, onDelete, onPageChange, onPageSizeChange }) {
  const allSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));
  const menuProps = (user) => ({ user, open: openMenuId === user.id, onToggle: () => onMenuToggle(user.id), onClose: onMenuClose, onView: () => onView(user), onEdit: () => onEdit(user), onToggleLock: () => onToggleLock(user), onDelete: () => onDelete(user) });

  return (
    <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm" aria-labelledby="users-table-title">
      <h2 id="users-table-title" className="sr-only">Danh sách người dùng</h2>
      {users.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRoundX className="size-6" /></span>
          <h3 className="mt-4 font-semibold text-slate-900">Không tìm thấy người dùng</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Hãy thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 lg:hidden">
            {users.map((user) => (
              <li key={user.id} className="p-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => onSelect(user.id)} className="mt-3 size-4 rounded border-slate-300 accent-blue-600" aria-label={`Chọn ${user.fullName}`} />
                  <div className="min-w-0 flex-1"><UserIdentity user={user} /></div>
                  <UserActionMenu {...menuProps(user)} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><dt className="text-slate-500">Số điện thoại</dt><dd className="mt-1 font-medium text-slate-700">{user.phone}</dd></div>
                  <div><dt className="text-slate-500">Số yêu cầu</dt><dd className="mt-1 font-semibold text-slate-800">{user.ticketCount}</dd></div>
                  <div><dt className="text-slate-500">Vai trò</dt><dd className="mt-1"><RoleBadge role={user.role} /></dd></div>
                  <div><dt className="text-slate-500">Trạng thái</dt><dd className="mt-1"><StatusBadge status={user.status} /></dd></div>
                  <div className="col-span-2"><dt className="text-slate-500">Ngày tạo</dt><dd className="mt-1 font-medium text-slate-700">{formatUserDate(user.createdAt)}</dd></div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[72rem] text-left">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase"><tr>
                <th className="w-14 px-5 py-3"><input type="checkbox" checked={allSelected} onChange={(event) => onSelectPage(event.target.checked)} className="size-4 rounded border-slate-300 accent-blue-600" aria-label="Chọn tất cả người dùng trên trang" /></th>
                <th className="px-3 py-3">Người dùng</th><th className="px-3 py-3">Số điện thoại</th><th className="px-3 py-3">Vai trò</th><th className="px-3 py-3 text-center">Số yêu cầu</th><th className="px-3 py-3">Trạng thái</th><th className="px-3 py-3">Ngày tạo</th><th className="px-5 py-3 text-right">Thao tác</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => <tr key={user.id} className="transition hover:bg-blue-50/40">
                  <td className="px-5 py-4"><input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => onSelect(user.id)} className="size-4 rounded border-slate-300 accent-blue-600" aria-label={`Chọn ${user.fullName}`} /></td>
                  <td className="max-w-64 px-3 py-4"><UserIdentity user={user} /></td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">{user.phone}</td>
                  <td className="px-3 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-3 py-4 text-center text-sm font-semibold text-slate-800">{user.ticketCount}</td>
                  <td className="px-3 py-4"><StatusBadge status={user.status} /></td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600"><time dateTime={user.createdAt}>{formatUserDate(user.createdAt)}</time></td>
                  <td className="px-5 py-4 text-right"><UserActionMenu {...menuProps(user)} /></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
    </section>
  );
}

export default UsersTable;
