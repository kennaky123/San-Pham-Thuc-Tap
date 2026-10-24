import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HardDrive,
  Laptop,
  Plus,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import AssetFormModal from "../../components/assets/AssetFormModal.jsx";
import AssetHistoryDrawer from "../../components/assets/AssetHistoryDrawer.jsx";
import AssetRequestsTable from "../../components/assets/AssetRequestsTable.jsx";
import AssetStatsGrid from "../../components/assets/AssetStatsGrid.jsx";
import AssetsTable from "../../components/assets/AssetsTable.jsx";
import AssignAssetModal from "../../components/assets/AssignAssetModal.jsx";
import CompleteAssetRequestModal from "../../components/assets/CompleteAssetRequestModal.jsx";
import CreateAssetRequestModal from "../../components/assets/CreateAssetRequestModal.jsx";
import RemoteConnectModal from "../../components/assets/RemoteConnectModal.jsx";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal.jsx";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import useAuth from "../../hooks/useAuth.js";
import { REALTIME_DATA_EVENT } from "../../hooks/useRealtimeUpdates.js";
import {
  acceptAssetRequest,
  cancelAssetRequest,
  deleteAsset,
  getAssetRequests,
  getAssets,
} from "../../services/assetService.js";

function AssetManagementPage() {
  const { user } = useAuth();
  const role = user?.role || "admin";

  const [activeTab, setActiveTab] = useState("assets"); // "assets" | "requests"
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({});
  const [requests, setRequests] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Modals state
  const [formAsset, setFormAsset] = useState(null); // null = closed, {} = create, obj = edit
  const [assignAssetTarget, setAssignAssetTarget] = useState(null);
  const [returnAssetTarget, setReturnAssetTarget] = useState(null);
  const [historyAssetId, setHistoryAssetId] = useState(null);
  const [remoteAsset, setRemoteAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Request Modals
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [completeRequestTarget, setCompleteRequestTarget] = useState(null);
  const [cancelRequestTarget, setCancelRequestTarget] = useState(null);

  const refreshData = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    Promise.all([
      getAssets(
        { search, status: statusFilter, type: typeFilter },
        { signal: controller.signal },
      ),
      getAssetRequests({}, { signal: controller.signal }),
    ])
      .then(([assetRes, reqRes]) => {
        if (!cancelled) {
          setAssets(assetRes.assets || []);
          setSummary(assetRes.summary || {});
          setRequests(reqRes || []);
        }
      })
      .catch((error) => {
        if (!cancelled && error.code !== "ERR_CANCELED") {
          toast.error(error.message || "Không thể tải dữ liệu kho thiết bị.");
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [search, statusFilter, typeFilter, reloadKey]);

  // Listen to realtime updates
  useEffect(() => {
    function handleRealtime(event) {
      const detail = event.detail;
      if (!detail?.resource || detail.resource === "assets" || detail.resource === "system") {
        refreshData();
      }
    }
    window.addEventListener(REALTIME_DATA_EVENT, handleRealtime);
    return () => window.removeEventListener(REALTIME_DATA_EVENT, handleRealtime);
  }, [refreshData]);

  // Actions
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteAsset(deleteTarget._id);
      toast.success(`Xóa thiết bị ${deleteTarget.assetTag} thành công.`);
      setDeleteTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thiết bị thất bại.");
    }
  }

  async function handleAcceptRequest(req) {
    try {
      await acceptAssetRequest(req._id);
      toast.success(`Đã tiếp nhận yêu cầu ${req.requestCode}! Hãy chuẩn bị thiết bị để bàn giao.`);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tiếp nhận yêu cầu thất bại.");
    }
  }

  async function handleCancelRequestConfirm(note) {
    if (!cancelRequestTarget) return;
    try {
      await cancelAssetRequest(cancelRequestTarget._id, { reason: note });
      toast.success(`Đã hủy yêu cầu ${cancelRequestTarget.requestCode}.`);
      setCancelRequestTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Hủy yêu cầu thất bại.");
    }
  }

  const pendingRequestsCount = useMemo(() => {
    return requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkspacePageHeader
        eyebrow="IT Asset Management • Realtime"
        title="Quản Lý Kho Thiết Bị & Cấp Phát Laptop"
        description="Quản lý toàn bộ vòng đời laptop, PC và thiết bị công ty. Theo dõi chi tiết ai đang sử dụng máy nào, thiết bị nào sẵn sàng trong kho, hỗ trợ kỹ thuật 1-click qua AnyDesk / TeamViewer và quy trình Admin yêu cầu cấp phát máy."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              title="Làm mới dữ liệu"
              className="p-2 rounded-xl border border-brand-bone bg-white text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {role === "admin" && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-brand-violet border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  Yêu Cầu Cấp Laptop
                </button>

                <button
                  type="button"
                  onClick={() => setFormAsset({})}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Nhập Thiết Bị Vào Kho
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Stats Summary */}
      <AssetStatsGrid summary={summary} />

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl border border-brand-bone shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-brand-bone px-5 pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("assets")}
              className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "assets"
                  ? "border-brand-violet text-brand-violet"
                  : "border-transparent text-brand-slate hover:text-brand-ink"
              }`}
            >
              <Laptop className="w-4 h-4" />
              Kho Thiết Bị & Đang Sử Dụng
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100/70 text-brand-violet">
                {summary.total ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "requests"
                  ? "border-brand-violet text-brand-violet"
                  : "border-transparent text-brand-slate hover:text-brand-ink"
              }`}
            >
              <Send className="w-4 h-4" />
              Yêu Cầu Cấp Phát Laptop
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {pendingRequestsCount} chờ xử lý
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Assets in stock & in use */}
        {activeTab === "assets" && (
          <div>
            {/* Filter Bar */}
            <div className="p-4 border-b border-brand-bone flex flex-wrap items-center justify-between gap-3 bg-brand-mist/20">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ash" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo Asset Tag, tên máy, serial, người đang dùng..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="in_stock">Trong Kho (Sẵn sàng)</option>
                  <option value="in_use">Đang Sử Dụng (Cấp phát)</option>
                  <option value="maintenance">Đang Bảo Trì</option>
                  <option value="retired">Ngưng Sử Dụng</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="">Tất cả loại thiết bị</option>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop / PC</option>
                  <option value="monitor">Màn hình</option>
                  <option value="accessory">Phụ kiện</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <AssetsTable
              assets={assets}
              role={role}
              onAssign={(asset) => setAssignAssetTarget(asset)}
              onReturn={(asset) => setReturnAssetTarget(asset)}
              onEdit={(asset) => setFormAsset(asset)}
              onDelete={(asset) => setDeleteTarget(asset)}
              onViewHistory={(id) => setHistoryAssetId(id)}
              onRemoteConnect={(asset) => setRemoteAsset(asset)}
            />
          </div>
        )}

        {/* Tab 2: Asset Requests */}
        {activeTab === "requests" && (
          <div>
            <div className="p-4 border-b border-brand-bone bg-brand-mist/20 flex items-center justify-between">
              <div className="text-xs text-brand-slate">
                Danh sách các yêu cầu bàn giao laptop từ Admin tới đội ngũ Kỹ thuật viên (Technician).
              </div>
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tạo Yêu Cầu Cấp Phát Mới
                </button>
              )}
            </div>

            <AssetRequestsTable
              requests={requests}
              role={role}
              currentUserId={user?._id}
              onAccept={handleAcceptRequest}
              onComplete={(req) => setCompleteRequestTarget(req)}
              onCancel={(req) => setCancelRequestTarget(req)}
            />
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      {formAsset && (
        <AssetFormModal
          asset={formAsset}
          onClose={() => setFormAsset(null)}
          onSaved={() => {
            setFormAsset(null);
            refreshData();
          }}
        />
      )}

      {assignAssetTarget && (
        <AssignAssetModal
          asset={assignAssetTarget}
          onClose={() => setAssignAssetTarget(null)}
          onAssigned={() => {
            setAssignAssetTarget(null);
            refreshData();
          }}
        />
      )}

      {returnAssetTarget && (
        <ReturnAssetModal
          asset={returnAssetTarget}
          onClose={() => setReturnAssetTarget(null)}
          onReturned={() => {
            setReturnAssetTarget(null);
            refreshData();
          }}
        />
      )}

      {remoteAsset && (
        <RemoteConnectModal
          asset={remoteAsset}
          onClose={() => setRemoteAsset(null)}
          onUpdated={() => {
            setRemoteAsset(null);
            refreshData();
          }}
        />
      )}

      {historyAssetId && (
        <AssetHistoryDrawer
          assetId={historyAssetId}
          onClose={() => setHistoryAssetId(null)}
        />
      )}

      {isCreateRequestOpen && (
        <CreateAssetRequestModal
          onClose={() => setIsCreateRequestOpen(false)}
          onCreated={() => {
            setIsCreateRequestOpen(false);
            refreshData();
          }}
        />
      )}

      {completeRequestTarget && (
        <CompleteAssetRequestModal
          request={completeRequestTarget}
          onClose={() => setCompleteRequestTarget(null)}
          onCompleted={() => {
            setCompleteRequestTarget(null);
            refreshData();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmActionModal
          title="Xác Nhận Xóa Thiết Bị"
          description={`Bạn có chắc chắn muốn xóa thiết bị [${deleteTarget.assetTag}] "${deleteTarget.name}" khỏi hệ thống? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa Thiết Bị"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {cancelRequestTarget && (
        <ConfirmActionModal
          title="Xác Nhận Hủy Yêu Cầu Cấp Phát"
          description={`Bạn có chắc chắn muốn hủy yêu cầu cấp phát laptop [${cancelRequestTarget.requestCode}] cho nhân viên "${cancelRequestTarget.employee?.fullName}"?`}
          confirmLabel="Hủy Yêu Cầu"
          noteLabel="Lý do hủy yêu cầu"
          notePlaceholder="Nhập lý do hủy bỏ cấp phát laptop..."
          onCancel={() => setCancelRequestTarget(null)}
          onConfirm={handleCancelRequestConfirm}
        />
      )}
    </div>
  );
}

export default AssetManagementPage;
