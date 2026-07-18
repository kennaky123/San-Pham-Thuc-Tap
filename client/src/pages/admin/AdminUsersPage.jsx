import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import UserDetailDrawer from "../../components/admin/users/UserDetailDrawer.jsx";
import UserFilters from "../../components/admin/users/UserFilters.jsx";
import UserFormModal from "../../components/admin/users/UserFormModal.jsx";
import UserListSkeleton from "../../components/admin/users/UserListSkeleton.jsx";
import UserStatsGrid from "../../components/admin/users/UserStatsGrid.jsx";
import UsersTable from "../../components/admin/users/UsersTable.jsx";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import { INITIAL_ADMIN_USERS } from "../../data/adminUsers.js";
import { normalizeSearch } from "../../utils/adminUserFormatters.js";

const EMPTY_FILTERS = { search: "", status: "", role: "" };

function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_ADMIN_USERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formUser, setFormUser] = useState(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = normalizeSearch(filters.search);
    return users.filter((user) => {
      const searchable = normalizeSearch(`${user.fullName} ${user.email} ${user.phone}`);
      return (!keyword || searchable.includes(keyword)) && (!filters.status || user.status === filters.status) && (!filters.role || user.role === filters.role);
    });
  }, [filters, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: users.length,
      active: users.filter((user) => user.status === "active").length,
      locked: users.filter((user) => user.status === "locked").length,
      newThisMonth: users.filter((user) => {
        const date = new Date(user.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [users]);

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDetail = useCallback(() => setDetailUser(null), []);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
    setSelectedIds(new Set());
  }

  function saveUser(values) {
    if (formUser) {
      setUsers((current) => current.map((item) => item.id === formUser.id ? { ...item, ...values, password: undefined, confirmPassword: undefined } : item));
      toast.success("Đã cập nhật thông tin người dùng.");
    } else {
      const newUser = {
        id: `USR-${String(Date.now()).slice(-6)}`,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status,
        ticketCount: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        department: "Chưa cập nhật",
        recentTickets: [],
      };
      setUsers((current) => [newUser, ...current]);
      setPage(1);
      toast.success("Đã thêm người dùng mới.");
    }
    setFormOpen(false);
  }

  function toggleLock(user) {
    const nextStatus = user.status === "locked" ? "active" : "locked";
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item));
    setOpenMenuId(null);
    toast.success(nextStatus === "locked" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
  }

  function confirmDelete() {
    setUsers((current) => current.filter((user) => user.id !== deleteUser.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(deleteUser.id);
      return next;
    });
    if (detailUser?.id === deleteUser.id) setDetailUser(null);
    setDeleteUser(null);
    toast.success("Đã xóa tài khoản khỏi dữ liệu giả.");
  }

  return (
    <section aria-labelledby="admin-users-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">Quản lý hệ thống</p>
          <h1 id="admin-users-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Người dùng</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Quản lý tài khoản người dùng và theo dõi hoạt động gửi yêu cầu hỗ trợ.</p>
        </div>
        <button type="button" onClick={() => { setFormUser(undefined); setFormOpen(true); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:self-auto">
          <Plus className="size-5" aria-hidden="true" />Thêm người dùng
        </button>
      </div>

      <UserStatsGrid stats={stats} />
      <div className="mt-6"><UserFilters filters={filters} onChange={updateFilter} onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); setSelectedIds(new Set()); }} /></div>
      <div className="mt-4" aria-busy={isLoading}>
        {isLoading ? <UserListSkeleton /> : (
          <UsersTable
            users={visibleUsers}
            total={filteredUsers.length}
            page={safePage}
            pageSize={pageSize}
            selectedIds={selectedIds}
            openMenuId={openMenuId}
            onSelect={(id) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
            onSelectPage={(checked) => setSelectedIds((current) => { const next = new Set(current); visibleUsers.forEach((user) => checked ? next.add(user.id) : next.delete(user.id)); return next; })}
            onMenuToggle={(id) => setOpenMenuId((current) => current === id ? null : id)}
            onMenuClose={() => setOpenMenuId(null)}
            onView={(user) => { setOpenMenuId(null); setDetailUser(user); }}
            onEdit={(user) => { setOpenMenuId(null); setFormUser(user); setFormOpen(true); }}
            onToggleLock={toggleLock}
            onDelete={(user) => { setOpenMenuId(null); setDeleteUser(user); }}
            onPageChange={setPage}
            onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
          />
        )}
      </div>

      {formOpen ? <UserFormModal key={formUser?.id ?? "new"} user={formUser} users={users} onClose={closeForm} onSave={saveUser} /> : null}
      {detailUser ? <UserDetailDrawer user={users.find((user) => user.id === detailUser.id) ?? detailUser} onClose={closeDetail} /> : null}
      {deleteUser ? <ConfirmActionModal title="Xóa tài khoản người dùng?" description={`Tài khoản ${deleteUser.fullName} sẽ bị xóa khỏi danh sách dữ liệu giả. Thao tác này không ảnh hưởng đến database.`} confirmLabel="Xóa tài khoản" submitting={false} onCancel={() => setDeleteUser(null)} onConfirm={confirmDelete} /> : null}
    </section>
  );
}

export default AdminUsersPage;
