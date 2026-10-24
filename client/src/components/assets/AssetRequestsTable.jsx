import { CheckCircle2, Clock, PackageCheck, Send, UserCheck, XCircle } from "lucide-react";
import { formatTicketDateTime } from "../../utils/ticketPermissions.js";

const REQUEST_STATUS_CONFIG = {
  pending: {
    label: "Chờ Tiếp Nhận",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "Đang Chuẩn Bị Máy",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Đã Bàn Giao Xong",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Đã Hủy",
    badge: "bg-red-50 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
};

function AssetRequestsTable({
  requests = [],
  role = "admin",
  currentUserId,
  onAccept,
  onComplete,
  onCancel,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-mist/60 text-[11px] font-bold text-brand-slate uppercase tracking-wider border-b border-brand-bone">
          <tr>
            <th className="py-3 px-4">Mã Yêu Cầu</th>
            <th className="py-3 px-4">Nhân Viên Tiếp Nhận</th>
            <th className="py-3 px-4">Loại Thiết Bị & Nhu Cầu</th>
            <th className="py-3 px-4">Kỹ Thuật Viên Phụ Trách</th>
            <th className="py-3 px-4">Trạng Thái</th>
            <th className="py-3 px-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-bone">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-brand-slate">
                Chưa có yêu cầu cấp phát laptop/thiết bị nào.
              </td>
            </tr>
          ) : (
            requests.map((req) => {
              const statusCfg =
                REQUEST_STATUS_CONFIG[req.status] || REQUEST_STATUS_CONFIG.pending;
              const isAssignedToCurrentTech =
                req.technician?._id === currentUserId || !req.technician;

              return (
                <tr
                  key={req._id}
                  className="hover:bg-brand-mist/40 transition-colors"
                >
                  {/* Mã Yêu Cầu */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-xs text-brand-violet">
                      {req.requestCode}
                    </div>
                    <div className="text-[11px] text-brand-ash">
                      {formatTicketDateTime(req.createdAt)}
                    </div>
                  </td>

                  {/* Nhân Viên Tiếp Nhận */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-[11px] font-bold text-brand-violet">
                        {req.employee?.fullName?.slice(0, 2).toUpperCase() || "NV"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-brand-onyx truncate">
                          {req.employee?.fullName || "Chưa cập nhật"}
                        </div>
                        <div className="text-[10px] text-brand-slate truncate">
                          {req.employee?.department || req.employee?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Loại & Ghi chú */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-xs text-brand-onyx uppercase">
                      {req.assetType}
                    </div>
                    <div className="text-xs text-brand-slate truncate max-w-xs mt-0.5">
                      {req.note || "Không có ghi chú thêm."}
                    </div>
                  </td>

                  {/* Kỹ Thuật Viên */}
                  <td className="py-3 px-4">
                    {req.technician ? (
                      <div className="flex items-center gap-1.5 text-xs text-brand-ink font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-brand-violet" />
                        {req.technician.fullName}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">
                        Chờ kỹ thuật tiếp nhận
                      </span>
                    )}
                  </td>

                  {/* Trạng Thái */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={statusCfg.badge.split(" ")[1]}>
                          {statusCfg.label}
                        </span>
                      </div>
                      {req.status === "completed" && req.asset && (
                        <div className="text-[11px] font-mono text-emerald-700">
                          Máy: {req.asset.assetTag} ({req.asset.name})
                        </div>
                      )}
                      {req.status === "cancelled" && req.cancelReason && (
                        <div className="text-[11px] text-red-600 truncate max-w-xs">
                          Lý do: {req.cancelReason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Thao Tác */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Technician: Tiếp nhận yêu cầu đang pending */}
                      {req.status === "pending" && role === "technician" && (
                        <button
                          type="button"
                          onClick={() => onAccept?.(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          Tiếp Nhận
                        </button>
                      )}

                      {/* Tech / Admin: Xuất kho bàn giao khi in_progress hoặc pending */}
                      {["pending", "in_progress"].includes(req.status) &&
                        role !== "user" &&
                        (role === "admin" || isAssignedToCurrentTech) && (
                          <button
                            type="button"
                            onClick={() => onComplete?.(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Bàn Giao Máy
                          </button>
                        )}

                      {/* Hủy yêu cầu */}
                      {["pending", "in_progress"].includes(req.status) &&
                        role !== "user" && (
                          <button
                            type="button"
                            onClick={() => onCancel?.(req)}
                            className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Hủy yêu cầu"
                          >
                            <XCircle className="w-4 h-4" />
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

export default AssetRequestsTable;
