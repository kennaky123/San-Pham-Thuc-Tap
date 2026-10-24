import { useCallback, useEffect, useState } from "react";
import {
  AppWindow,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import SoftwareFinOpsSummary from "../../components/software/SoftwareFinOpsSummary.jsx";
import SoftwareTable from "../../components/software/SoftwareTable.jsx";
import SoftwareFormModal from "../../components/software/SoftwareFormModal.jsx";
import AllocateLicenseModal from "../../components/software/AllocateLicenseModal.jsx";
import AllocatedUsersDrawer from "../../components/software/AllocatedUsersDrawer.jsx";
import useAuth from "../../hooks/useAuth.js";
import { REALTIME_DATA_EVENT } from "../../hooks/useRealtimeUpdates.js";
import {
  deleteSoftwareLicense,
  getFinOpsSummary,
  getSoftwareLicenses,
} from "../../services/softwareService.js";

const CATEGORIES = [
  "Văn phòng & Email",
  "Thiết kế & Đồ họa",
  "Lập trình & Phát triển",
  "Bảo mật & Tiện ích",
  "Giao tiếp & Cộng tác",
  "Hệ điều hành & Máy chủ",
  "Khác",
];

const TYPES = [
  { value: "saas_subscription", label: "SaaS Cloud" },
  { value: "perpetual", label: "Vĩnh Viễn" },
  { value: "volume", label: "Volume License" },
  { value: "oem", label: "OEM Bản Quyền" },
];

const STATUSES = [
  { value: "active", label: "Đang Hoạt Động" },
  { value: "expiring_soon", label: "Sắp Hết Hạn" },
  { value: "expired", label: "Đã Hết Hạn" },
];

function SoftwareLicensePage() {
  const { user } = useAuth();
  const role = user?.role || "admin";

  const [licenses, setLicenses] = useState([]);
  const [finOps, setFinOps] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Modals state
  const [formLicense, setFormLicense] = useState(null); // null = closed, {} = create, obj = edit
  const [allocateTarget, setAllocateTarget] = useState(null);
  const [viewUsersTargetId, setViewUsersTargetId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    Promise.all([
      getSoftwareLicenses(
        {
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
        },
        { signal: controller.signal }
      ),
      getFinOpsSummary({ signal: controller.signal }),
    ])
      .then(([licensesRes, finOpsRes]) => {
        if (!cancelled) {
          setLicenses(licensesRes.licenses || []);
          setFinOps(finOpsRes || {});
        }
      })
      .catch((error) => {
        if (!cancelled && error.code !== "ERR_CANCELED") {
          toast.error(error.message || "Không thể tải danh sách bản quyền phần mềm.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [search, categoryFilter, typeFilter, statusFilter, reloadKey]);

  // Realtime updates listener
  useEffect(() => {
    function handleRealtime(event) {
      const detail = event.detail;
      if (!detail?.resource || detail.resource === "software" || detail.resource === "system") {
        refreshData();
      }
    }
    window.addEventListener(REALTIME_DATA_EVENT, handleRealtime);
    return () => window.removeEventListener(REALTIME_DATA_EVENT, handleRealtime);
  }, [refreshData]);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSoftwareLicense(deleteTarget._id);
      toast.success(`Đã xóa bản quyền ${deleteTarget.name} thành công.`);
      setDeleteTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa bản quyền thất bại.");
    } finally {
      setIsDeleting(false);
    }
  }

  const isFilterActive = Boolean(search || categoryFilter || typeFilter || statusFilter);

  function handleResetFilters() {
    setSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setStatusFilter("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkspacePageHeader
        eyebrow="Software Asset Management • FinOps Realtime"
        title="Quản Lý Bản Quyền Phần Mềm & Chi Phí CNTT"
        description="Theo dõi toàn diện giấy phép bản quyền SaaS, Desktop, Cloud, kiểm soát số lượng seats cấp phát và loại bỏ chi phí lãng phí."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-bone bg-white text-xs font-semibold text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              type="button"
              onClick={() => setFormLicense({})}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bản Quyền Mới</span>
            </button>
          </div>
        }
      />

      {/* FinOps Analytics Cards */}
      <SoftwareFinOpsSummary finOps={finOps} />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-bone p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên phần mềm, nhà cung cấp, key..."
              className="w-full text-xs rounded-xl border border-brand-bone pl-9 pr-3 py-2 bg-brand-mist/30 text-brand-onyx placeholder:text-brand-ash focus:bg-white focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả danh mục</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-40">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả hình thức</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-bone text-brand-slate hover:bg-brand-mist text-xs font-medium transition-colors shrink-0"
              title="Xóa bộ lọc"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-brand-bone shadow-xs overflow-hidden">
        <SoftwareTable
          licenses={licenses}
          role={role}
          onAllocate={(lic) => setAllocateTarget(lic)}
          onViewUsers={(lic) => setViewUsersTargetId(lic._id)}
          onEdit={(lic) => setFormLicense(lic)}
          onDelete={(lic) => setDeleteTarget(lic)}
        />
      </div>

      {/* Modals & Drawers */}
      {formLicense && (
        <SoftwareFormModal
          license={formLicense._id ? formLicense : null}
          onClose={() => setFormLicense(null)}
          onSaved={() => {
            setFormLicense(null);
            refreshData();
          }}
        />
      )}

      {allocateTarget && (
        <AllocateLicenseModal
          license={allocateTarget}
          onClose={() => setAllocateTarget(null)}
          onAllocated={() => {
            setAllocateTarget(null);
            refreshData();
          }}
        />
      )}

      {viewUsersTargetId && (
        <AllocatedUsersDrawer
          licenseId={viewUsersTargetId}
          onClose={() => setViewUsersTargetId(null)}
          onRevoked={() => {
            refreshData();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmActionModal
          title={`Xác Nhận Xóa Bản Quyền "${deleteTarget.name}"?`}
          description="Hành động này sẽ xóa hoàn toàn thông tin phần mềm, bao gồm lịch sử cấp phát seat của tất cả nhân viên liên quan."
          confirmLabel="Xóa Bản Quyền"
          submitting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default SoftwareLicensePage;
