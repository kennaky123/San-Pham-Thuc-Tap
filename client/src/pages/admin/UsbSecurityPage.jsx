import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  Usb,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import UsbAgentConnectionBanner from "../../components/usb/UsbAgentConnectionBanner.jsx";
import UsbDevicesTable from "../../components/usb/UsbDevicesTable.jsx";
import UsbEventsTable from "../../components/usb/UsbEventsTable.jsx";
import UsbPolicyModal from "../../components/usb/UsbPolicyModal.jsx";
import UsbStatsGrid from "../../components/usb/UsbStatsGrid.jsx";
import useAuth from "../../hooks/useAuth.js";
import { REALTIME_DATA_EVENT } from "../../hooks/useRealtimeUpdates.js";
import {
  deleteUsbDevice,
  getAgentDownloadUrl,
  getUsbDashboard,
  sendAgentUsbEvent,
  updateUsbDevicePolicy,
} from "../../services/usbService.js";

const STATUS_OPTIONS = [
  { value: "unverified", label: "Chưa xác minh (Cảnh báo)" },
  { value: "trusted", label: "Đã phê duyệt (Whitelist)" },
  { value: "blocked", label: "Bị chặn (Blacklist)" },
];

const TYPE_OPTIONS = [
  { value: "storage", label: "USB Lưu Trữ (Flash / HDD)" },
  { value: "input_hid", label: "Chuột / Phím HID" },
  { value: "mobile_mtp", label: "Điện Thoại MTP" },
  { value: "audio_video", label: "Âm Thanh / Camera" },
  { value: "other_usb", label: "Ngoại Vi USB Khác" },
];

function UsbSecurityPage() {
  const { user } = useAuth();
  const role = user?.role || "admin";

  const [activeTab, setActiveTab] = useState("devices"); // "devices" | "events"
  const [devices, setDevices] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({});
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("");
  const [connectionStateFilter, setConnectionStateFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Modals
  const [policyTarget, setPolicyTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    getUsbDashboard(
      {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        deviceType: deviceTypeFilter || undefined,
        connectionState: connectionStateFilter || undefined,
      },
      { signal: controller.signal },
    )
      .then((res) => {
        if (!cancelled) {
          setDevices(res.devices || []);
          setEvents(res.events || []);
          setSummary(res.summary || {});
          setNetworkInfo(res.networkInfo || null);
        }
      })
      .catch((error) => {
        if (!cancelled && error.code !== "ERR_CANCELED") {
          toast.error(
            error.message || "Không thể tải dữ liệu giám sát thiết bị USB.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [search, statusFilter, deviceTypeFilter, connectionStateFilter, reloadKey]);

  // Listen to Realtime USB events
  useEffect(() => {
    function handleRealtime(event) {
      const detail = event.detail;
      if (
        !detail?.resource ||
        detail.resource === "usb" ||
        detail.resource === "system"
      ) {
        refreshData();
      }
    }
    window.addEventListener(REALTIME_DATA_EVENT, handleRealtime);
    return () => window.removeEventListener(REALTIME_DATA_EVENT, handleRealtime);
  }, [refreshData]);

  async function handleQuickApprove(device) {
    try {
      await updateUsbDevicePolicy(device._id, {
        status: "trusted",
        note: device.note || "Đã phê duyệt nhanh (Whitelisted) bởi bộ phận IT.",
      });
      toast.success(`Đã phê duyệt thiết bị USB "${device.deviceName}"!`);
      refreshData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Phê duyệt thiết bị thất bại.",
      );
    }
  }

  async function handleQuickBlock(device) {
    try {
      await updateUsbDevicePolicy(device._id, {
        status: "blocked",
        note:
          device.note ||
          "Đã chặn (Blacklisted) do vi phạm chính sách bảo mật thiết bị ngoại vi.",
      });
      toast.warning(`Đã đưa "${device.deviceName}" vào danh sách chặn (Blacklist)!`);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Chặn thiết bị thất bại.");
    }
  }

  async function handleSimulateUsbEvent() {
    setIsSimulating(true);
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const samples = [
        {
          deviceName: `SanDisk Extreme Pro USB 3.2 128GB (#${randomSuffix})`,
          vendor: "SanDisk Corp (VID_0781)",
          deviceType: "storage",
          driveLetter: "F:",
          volumeName: `USB_DATA_${randomSuffix} (119.2 GB)`,
        },
        {
          deviceName: `Kingston DataTraveler Max 256GB (#${randomSuffix})`,
          vendor: "Kingston Technology (VID_0951)",
          deviceType: "storage",
          driveLetter: "G:",
          volumeName: `KINGSTON_${randomSuffix} (238.4 GB)`,
        },
        {
          deviceName: `WD My Passport Ultra 1TB (#${randomSuffix})`,
          vendor: "Western Digital (VID_1058)",
          deviceType: "storage",
          driveLetter: "E:",
          volumeName: `WD_BACKUP_${randomSuffix} (931.5 GB)`,
        },
      ];
      const pick = samples[randomSuffix % samples.length];

      await sendAgentUsbEvent({
        deviceId: `USBSTOR\\DISK&VEN_DEMO&PROD_USB\\SN${randomSuffix}`,
        deviceName: pick.deviceName,
        vendor: pick.vendor,
        serialNumber: `SN${randomSuffix}`,
        deviceType: pick.deviceType,
        driveLetter: pick.driveLetter,
        volumeName: pick.volumeName,
        eventType: "connected",
        hostname: `LAPTOP-NHANVIEN-${randomSuffix % 10 || 1}`,
        osUsername: `NhanVien_${randomSuffix % 10 || 1}`,
        ipAddress: networkInfo?.primaryLanIp || "192.168.1.25",
      });

      refreshData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể gửi sự kiện giả lập USB.",
      );
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUsbDevice(deleteTarget._id);
      toast.success(`Đã xóa thiết bị "${deleteTarget.deviceName}" thành công.`);
      setDeleteTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thiết bị thất bại.");
    } finally {
      setIsDeleting(false);
    }
  }

  const isFilterActive = Boolean(
    search || statusFilter || deviceTypeFilter || connectionStateFilter,
  );

  function handleResetFilters() {
    setSearch("");
    setStatusFilter("");
    setDeviceTypeFilter("");
    setConnectionStateFilter("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkspacePageHeader
        eyebrow="Endpoint Security & DLP • Realtime USB Monitoring"
        title="Giám Sát & Quản Lý Thiết Bị Ngoại Vi USB"
        description="Theo dõi thời gian thực mọi sự kiện nhân viên cắm/rút USB qua Agent .exe, phát cảnh báo tức thì cho Admin & Kỹ thuật viên và kiểm soát Whitelist / Blacklist."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-bone bg-white text-xs font-semibold text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors shadow-2xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <a
              href={getAgentDownloadUrl()}
              download="ITHelpdeskUSBAgent.exe"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải Agent (.exe)</span>
            </a>
          </div>
        }
      />

      {/* Stat Cards */}
      <UsbStatsGrid summary={summary} />

      {/* Multi-machine & Agent .exe Banner */}
      <UsbAgentConnectionBanner
        networkInfo={networkInfo}
        onSimulateEvent={handleSimulateUsbEvent}
        isSimulating={isSimulating}
      />

      {/* Tabs & Filter Controls */}
      <div className="bg-white rounded-2xl border border-brand-bone p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-bone pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("devices")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "devices"
                  ? "bg-brand-violet text-white shadow-xs"
                  : "text-brand-slate hover:bg-brand-mist"
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              <span>Danh Sách Thiết Bị USB ({devices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "events"
                  ? "bg-brand-violet text-white shadow-xs"
                  : "text-brand-slate hover:bg-brand-mist"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Nhật Ký Cắm / Rút Realtime ({events.length})</span>
            </button>
          </div>

          {summary.unverifiedCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Có {summary.unverifiedCount} thiết bị USB mới chưa được phê duyệt!
              </span>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên USB, hãng, Serial, tên máy nhân viên (Hostname), IP..."
              className="w-full text-xs rounded-xl border border-brand-bone pl-9 pr-3 py-2 bg-brand-mist/30 text-brand-onyx placeholder:text-brand-ash focus:bg-white focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden transition-all"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả chính sách</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={deviceTypeFilter}
              onChange={(e) => setDeviceTypeFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả phân loại USB</option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-44">
            <select
              value={connectionStateFilter}
              onChange={(e) => setConnectionStateFilter(e.target.value)}
              className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
            >
              <option value="">Tất cả kết nối</option>
              <option value="connected">Đang cắm trên máy</option>
              <option value="disconnected">Đã rút ra</option>
            </select>
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-bone text-brand-slate hover:bg-brand-mist text-xs font-medium transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-2xl border border-brand-bone shadow-xs overflow-hidden">
        {activeTab === "devices" ? (
          <UsbDevicesTable
            devices={devices}
            role={role}
            onQuickApprove={handleQuickApprove}
            onQuickBlock={handleQuickBlock}
            onEditPolicy={(dev) => setPolicyTarget(dev)}
            onDelete={(dev) => setDeleteTarget(dev)}
          />
        ) : (
          <UsbEventsTable events={events} />
        )}
      </div>

      {/* Modals */}
      {policyTarget && (
        <UsbPolicyModal
          device={policyTarget}
          onClose={() => setPolicyTarget(null)}
          onSaved={() => {
            setPolicyTarget(null);
            refreshData();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmActionModal
          title={`Xác Nhận Xóa Thiết Bị USB "${deleteTarget.deviceName}"?`}
          description="Hành động này sẽ xóa thiết bị USB và toàn bộ nhật ký cắm/rút liên quan khỏi hệ thống."
          confirmLabel="Xóa Thiết Bị"
          submitting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default UsbSecurityPage;
