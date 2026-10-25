import {
  Ban,
  CheckCircle2,
  HardDrive,
  Laptop,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Usb,
  User,
} from "lucide-react";
import { formatTicketDateTime } from "../../utils/ticketPermissions.js";

const STATUS_CONFIG = {
  trusted: {
    label: "Đã Phê Duyệt (Whitelist)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  unverified: {
    label: "Chưa Xác Minh (Mới)",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  blocked: {
    label: "Bị Chặn (Blacklist)",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const DEVICE_TYPE_LABELS = {
  storage: {
    label: "USB Lưu Trữ",
    badge: "bg-purple-50 text-brand-violet border-purple-200",
  },
  input_hid: {
    label: "Chuột / Phím HID",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  mobile_mtp: {
    label: "Điện Thoại MTP",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
  audio_video: {
    label: "Âm Thanh / Camera",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  other_usb: {
    label: "Ngoại Vi USB",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

function UsbDevicesTable({
  devices = [],
  role = "admin",
  onQuickApprove,
  onQuickBlock,
  onEditPolicy,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-mist/60 text-[11px] font-bold text-brand-slate uppercase tracking-wider border-b border-brand-bone">
          <tr>
            <th className="py-3 px-4">Thiết Bị USB & Phần Cứng</th>
            <th className="py-3 px-4">Phân Loại & Ổ Đĩa</th>
            <th className="py-3 px-4">Máy Nhân Viên Kết Nối</th>
            <th className="py-3 px-4">Trạng Thái Cắm</th>
            <th className="py-3 px-4">Chính Sách Bảo Mật</th>
            <th className="py-3 px-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-bone">
          {devices.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-brand-slate">
                Chưa có thiết bị USB nào khớp với bộ lọc hiện tại.
              </td>
            </tr>
          ) : (
            devices.map((device) => {
              const statusCfg = STATUS_CONFIG[device.status] || STATUS_CONFIG.unverified;
              const typeCfg = DEVICE_TYPE_LABELS[device.deviceType] || DEVICE_TYPE_LABELS.other_usb;
              const host = device.lastHost || {};

              return (
                <tr
                  key={device._id}
                  className="hover:bg-brand-mist/30 transition-colors group"
                >
                  {/* USB Name & Hardware ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          device.status === "blocked"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : device.status === "unverified"
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-purple-50 text-brand-violet border-purple-100"
                        }`}
                      >
                        <Usb className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-brand-onyx truncate max-w-[260px]">
                          {device.deviceName}
                        </div>
                        <div className="text-[11px] text-brand-slate mt-0.5">
                          <span className="font-medium text-brand-ink">{device.vendor}</span>
                          {device.serialNumber && (
                            <span className="text-brand-ash"> • SN: {device.serialNumber}</span>
                          )}
                        </div>
                        <div
                          className="text-[10px] font-mono text-brand-slate bg-brand-mist/70 px-1.5 py-0.5 rounded border border-brand-bone/60 mt-1 inline-block max-w-[250px] truncate"
                          title={device.deviceId}
                        >
                          {device.deviceId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type & Drive Letter */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeCfg.badge}`}
                      >
                        {typeCfg.label}
                      </span>
                      {device.driveLetter && (
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-brand-onyx">
                          <HardDrive className="w-3 h-3 text-brand-violet" />
                          <span>Ổ {device.driveLetter}</span>
                          {device.volumeName && (
                            <span className="text-[10px] font-normal text-brand-slate truncate max-w-[120px]">
                              ({device.volumeName})
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-[10px] text-brand-ash">
                        Số lần cắm: <strong className="text-brand-ink">{device.connectionCount || 1}</strong>
                      </div>
                    </div>
                  </td>

                  {/* Employee Machine Info */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-brand-onyx flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-brand-violet shrink-0" />
                        <span>{host.hostname || "UNKNOWN-PC"}</span>
                      </div>
                      <div className="text-[11px] text-brand-slate">
                        User OS:{" "}
                        <span className="font-medium text-brand-ink">
                          {host.osUsername || "N/A"}
                        </span>
                        {host.ipAddress && (
                          <span className="font-mono text-[10px] text-brand-ash ml-1.5">
                            ({host.ipAddress})
                          </span>
                        )}
                      </div>
                      {device.assignedUser && (
                        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Gán cho: {device.assignedUser.fullName}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Live Connection Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {device.isCurrentlyConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Đang cắm
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Đã rút ra
                        </span>
                      )}
                      <div className="text-[10px] text-brand-ash font-mono">
                        {host.connectedAt
                          ? `Cắm: ${formatTicketDateTime(host.connectedAt)}`
                          : ""}
                      </div>
                    </div>
                  </td>

                  {/* Security Policy Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                      {device.note && (
                        <div
                          className="text-[11px] text-brand-slate max-w-[200px] truncate"
                          title={device.note}
                        >
                          {device.note}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {device.status !== "trusted" && (
                        <button
                          type="button"
                          onClick={() => onQuickApprove?.(device)}
                          title="Phê duyệt cho phép dùng USB này (Whitelist)"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Duyệt</span>
                        </button>
                      )}

                      {device.status !== "blocked" && (
                        <button
                          type="button"
                          onClick={() => onQuickBlock?.(device)}
                          title="Chặn thiết bị USB này (Blacklist)"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/70 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Chặn</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEditPolicy?.(device)}
                        title="Cấu hình chính sách & Gán nhân viên sở hữu"
                        className="p-1.5 rounded-lg text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {role === "admin" && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(device)}
                          title="Xóa thiết bị USB"
                          className="p-1.5 rounded-lg text-brand-slate hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsbDevicesTable;
