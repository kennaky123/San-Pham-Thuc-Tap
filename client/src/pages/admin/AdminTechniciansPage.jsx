import {
  CircleGauge,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import TechnicianFormModal from "../../components/admin/technicians/TechnicianFormModal.jsx";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import useClickOutside from "../../hooks/useClickOutside.js";
import { REALTIME_DATA_EVENT } from "../../hooks/useRealtimeUpdates.js";
import {
  createAdminTechnician,
  deleteAdminTechnician,
  getAdminErrorMessage,
  getAdminTechnicians,
  updateAdminTechnician,
} from "../../services/adminService.js";
import {
  getInitials,
  normalizeSearch,
} from "../../utils/adminUserFormatters.js";

const STATUS = {
  online: {
    label: "Sẵn sàng",
    classes: "bg-emerald-50 text-brand-emerald border border-emerald-200",
  },
  busy: {
    label: "Đang bận",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  offline: {
    label: "Ngoại tuyến",
    classes: "bg-brand-mist text-brand-slate border border-brand-bone",
  },
};

function TechnicianActionMenu({
  technician,
  open,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose, open);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={onToggle}
        className="flex size-8 items-center justify-center rounded-lg text-brand-slate transition hover:bg-brand-mist hover:text-brand-ink"
        aria-label={`Thao tác với ${technician.name}`}
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4.5" />
      </button>
      {open ? (
        <div
          className="absolute top-9 right-0 z-30 w-44 rounded-xl border border-brand-bone bg-white p-1.5 text-left shadow-xl"
          role="menu"
        >
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-brand-ink hover:bg-brand-mist"
            role="menuitem"
          >
            <Edit3 className="size-3.5" />
            Chỉnh sửa
          </button>
          <div className="my-1 border-t border-brand-bone" />
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            <Trash2 className="size-3.5" />
            Xóa kỹ thuật viên
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formTechnician, setFormTechnician] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTechnician, setDeleteTechnician] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadTechnicians = useCallback(async (options = {}) => {
    setTechnicians(await getAdminTechnicians(options));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getAdminTechnicians({ signal: controller.signal })
      .then(setTechnicians)
      .catch((error) => {
        if (error.code !== "ERR_CANCELED")
          toast.error(getAdminErrorMessage(error));
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) loadTechnicians().catch(() => {});
    };
    const intervalId = window.setInterval(refresh, 10_000);
    window.addEventListener(REALTIME_DATA_EVENT, refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(REALTIME_DATA_EVENT, refresh);
    };
  }, [loadTechnicians]);

  const filtered = useMemo(
    () =>
      technicians.filter(
        (item) =>
          (!search ||
            normalizeSearch(
              `${item.name} ${item.email} ${item.specialization}`,
            ).includes(normalizeSearch(search))) &&
          (!status || item.status === status),
      ),
    [search, status, technicians],
  );

  const createdTicketCount = technicians.reduce(
    (sum, item) => sum + item.completed,
    0,
  );

  function openCreateForm() {
    setFormTechnician(null);
    setFormOpen(true);
  }

  function openEditForm(technician) {
    setOpenMenuId(null);
    setFormTechnician(technician);
    setFormOpen(true);
  }

  async function saveTechnician(values) {
    try {
      const saved = formTechnician
        ? await updateAdminTechnician(formTechnician.id, values)
        : await createAdminTechnician(values);
      setTechnicians((items) =>
        formTechnician
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...items],
      );
      setFormOpen(false);
      toast.success(
        formTechnician
          ? "Đã cập nhật thông tin kỹ thuật viên."
          : "Đã thêm kỹ thuật viên mới.",
      );
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
      throw error;
    }
  }

  async function confirmDelete() {
    setDeleteSubmitting(true);
    try {
      await deleteAdminTechnician(deleteTechnician.id);
      setTechnicians((items) =>
        items.filter((item) => item.id !== deleteTechnician.id),
      );
      setDeleteTechnician(null);
      toast.success("Đã xóa kỹ thuật viên khỏi hệ thống.");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  async function toggleAvailability(technician) {
    const nextStatus = technician.status === "offline" ? "online" : "offline";
    try {
      const saved = await updateAdminTechnician(technician.id, {
        ...technician,
        status: nextStatus,
      });
      setTechnicians((items) =>
        items.map((item) => (item.id === technician.id ? saved : item)),
      );
      toast.success(
        nextStatus === "online"
          ? "Kỹ thuật viên đã sẵn sàng nhận ticket."
          : "Đã đặt kỹ thuật viên ở trạng thái ngoại tuyến.",
      );
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    }
  }

  return (
    <section>
      <WorkspacePageHeader
        eyebrow="Quản trị đội ngũ kỹ thuật (dim_agent)"
        title="Nhân viên kỹ thuật (IT Agents)"
        description="Quản lý đội ngũ kỹ sư L1/L2/L3, chuyên môn và khối lượng ticket đang phụ trách."
        actions={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-ink px-4 text-xs font-semibold text-white transition hover:bg-brand-carbon"
          >
            <Plus className="size-4" />
            Thêm kỹ thuật viên
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          icon={Users}
          label="Tổng kỹ thuật viên"
          value={technicians.length}
          description="Nhân sự trong đội hỗ trợ"
        />
        <WorkspaceStatCard
          icon={UserCheck}
          label="Đang sẵn sàng"
          value={technicians.filter((item) => item.status === "online").length}
          description="Có thể nhận ticket mới"
          tone="emerald"
        />
        <WorkspaceStatCard
          icon={Wrench}
          label="Ticket đang xử lý"
          value={technicians.reduce((sum, item) => sum + item.active, 0)}
          description="Trên toàn bộ kỹ thuật viên"
          tone="violet"
        />
        <WorkspaceStatCard
          icon={CircleGauge}
          label="Đã hoàn thành"
          value={createdTicketCount}
          description="Tổng ticket đã xử lý xong"
          tone="amber"
        />
      </div>

      <div className="mt-6 rounded-xl border border-brand-bone bg-white p-3.5 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <label className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-ash" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, email hoặc chuyên môn..."
              className="w-full rounded-lg border border-brand-bone bg-brand-mist py-2 pr-3 pl-10 text-xs font-medium text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-brand-bone bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="online">Sẵn sàng</option>
            <option value="busy">Đang bận</option>
            <option value="offline">Ngoại tuyến</option>
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((item) => {
            const state = STATUS[item.status] ?? STATUS.offline;
            return (
              <article
                key={item.id}
                className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs transition-colors hover:border-brand-ash"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-violet text-sm font-bold text-white">
                    {getInitials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-sm font-bold text-brand-ink">
                          {item.name}
                        </h2>
                        <p className="truncate font-mono text-xs text-brand-ash">
                          {item.email}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-start gap-1">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${state.classes}`}
                        >
                          {state.label}
                        </span>
                        <TechnicianActionMenu
                          technician={item}
                          open={openMenuId === item.id}
                          onToggle={() =>
                            setOpenMenuId((current) =>
                              current === item.id ? null : item.id,
                            )
                          }
                          onClose={() => setOpenMenuId(null)}
                          onEdit={() => openEditForm(item)}
                          onDelete={() => {
                            setOpenMenuId(null);
                            setDeleteTechnician(item);
                          }}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-brand-slate">
                      {item.specialization}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-brand-bone pt-3.5 text-center">
                  <div>
                    <dt className="text-[11px] text-brand-ash">Đang xử lý</dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-brand-violet">
                      {item.active}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-brand-ash">Hoàn thành</dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-brand-ink">
                      {item.completed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-brand-ash">CSAT</dt>
                    <dd className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-brand-ink">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-brand-ash">SLA</dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-brand-emerald">
                      98%
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => toggleAvailability(item)}
                  className="mt-4 w-full rounded-lg border border-brand-bone bg-brand-mist/50 py-2 text-xs font-semibold text-brand-ink transition hover:bg-brand-mist"
                >
                  {item.status === "offline"
                    ? "Kích hoạt làm việc"
                    : "Đặt ngoại tuyến"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-brand-bone bg-white px-5 py-16 text-center text-xs text-brand-slate">
          Không tìm thấy kỹ thuật viên phù hợp.
        </div>
      )}

      {formOpen ? (
        <TechnicianFormModal
          key={formTechnician?.id ?? "new"}
          technician={formTechnician}
          technicians={technicians}
          onClose={() => setFormOpen(false)}
          onSave={saveTechnician}
        />
      ) : null}

      {deleteTechnician ? (
        <ConfirmActionModal
          title="Xóa kỹ thuật viên?"
          description={`Bạn có chắc muốn xóa ${deleteTechnician.name} khỏi đội hỗ trợ? Thao tác này không thể hoàn tác trong phiên hiện tại.`}
          confirmLabel="Xóa kỹ thuật viên"
          submitting={deleteSubmitting}
          onCancel={() => setDeleteTechnician(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}

export default AdminTechniciansPage;
