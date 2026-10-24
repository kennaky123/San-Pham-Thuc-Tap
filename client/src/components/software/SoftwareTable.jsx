import {
  AppWindow,
  Calendar,
  ExternalLink,
  Layers,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { formatCurrencyVND } from "../../services/softwareService.js";

const STATUS_CONFIG = {
  active: {
    label: "Đang Hoạt Động",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  expiring_soon: {
    label: "Sắp Hết Hạn",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  expired: {
    label: "Đã Hết Hạn",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const TYPE_CONFIG = {
  saas_subscription: {
    label: "SaaS Cloud",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  perpetual: {
    label: "Vĩnh Viễn",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
  volume: {
    label: "Volume License",
    badge: "bg-purple-50 text-brand-violet border-purple-200",
  },
  oem: {
    label: "OEM Bản Quyền",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

const CYCLE_LABELS = {
  monthly: "Tháng",
  yearly: "Năm",
  one_time: "Một lần",
};

function SoftwareTable({
  licenses = [],
  role = "admin",
  onAllocate,
  onViewUsers,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-mist/60 text-[11px] font-bold text-brand-slate uppercase tracking-wider border-b border-brand-bone">
          <tr>
            <th className="py-3 px-4">Phần Mềm & Vendor</th>
            <th className="py-3 px-4">Loại & Chu Kỳ</th>
            <th className="py-3 px-4 min-w-[200px]">Phân Bổ Seats</th>
            <th className="py-3 px-4">Chi Phí (FinOps)</th>
            <th className="py-3 px-4">Hạn Dùng & Trạng Thái</th>
            <th className="py-3 px-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-bone">
          {licenses.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-brand-slate">
                Không tìm thấy bản quyền phần mềm nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            licenses.map((license) => {
              const statusCfg = STATUS_CONFIG[license.status] || STATUS_CONFIG.active;
              const typeCfg = TYPE_CONFIG[license.type] || {
                label: license.type,
                badge: "bg-gray-50 text-gray-700 border-gray-200",
              };
              const assigned =
                license.assignedCount ?? (license.assignedUsers?.length || 0);
              const total = license.totalSeats || 0;
              const percent =
                total > 0 ? Math.min(100, Math.round((assigned / total) * 100)) : 0;
              const available = Math.max(0, total - assigned);

              let progressColor = "bg-emerald-500";
              if (percent === 100) progressColor = "bg-red-500";
              else if (percent >= 85) progressColor = "bg-amber-500";

              const costPerSeatText =
                license.costPerSeat > 0
                  ? `${formatCurrencyVND(license.costPerSeat)}/${CYCLE_LABELS[license.billingCycle] || "seat"}`
                  : "Miễn phí";

              const monthlyCostText =
                license.calculatedMonthlyCost > 0
                  ? `${formatCurrencyVND(license.calculatedMonthlyCost)}/tháng`
                  : null;

              return (
                <tr
                  key={license._id}
                  className="hover:bg-brand-mist/30 transition-colors group"
                >
                  {/* Name & Vendor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-brand-violet flex items-center justify-center shrink-0 border border-purple-100">
                        <AppWindow className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-brand-onyx flex items-center gap-1.5 truncate">
                          <span>{license.name}</span>
                          {license.portalUrl && (
                            <a
                              href={license.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-slate hover:text-brand-violet transition-colors inline-flex"
                              title="Mở cổng Portal quản trị của nhà cung cấp"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-brand-slate flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-brand-ink">{license.vendor}</span>
                          <span>•</span>
                          <span className="text-brand-ash">{license.category}</span>
                        </div>
                        {license.licenseKey && (
                          <div className="text-[10px] font-mono text-brand-slate bg-brand-mist/70 px-1.5 py-0.5 rounded border border-brand-bone/50 mt-1 inline-block max-w-[200px] truncate">
                            Key: {license.licenseKey}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type & Cycle */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeCfg.badge}`}
                      >
                        {typeCfg.label}
                      </span>
                      <div className="text-[11px] text-brand-slate flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-ash" />
                        <span>{CYCLE_LABELS[license.billingCycle] || license.billingCycle}</span>
                      </div>
                    </div>
                  </td>

                  {/* Seats & Utilization Progress */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-brand-onyx">
                          {assigned}/{total} seats
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            percent === 100
                              ? "text-red-600"
                              : percent >= 85
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-brand-bone overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-brand-slate flex items-center justify-between">
                        <span>
                          {available > 0 ? (
                            <span className="text-emerald-600 font-medium">
                              {available} seats còn trống
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">Đã hết seats trống</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* FinOps Cost */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold text-brand-onyx">
                        {costPerSeatText}
                      </div>
                      {monthlyCostText && (
                        <div className="text-[11px] text-brand-slate">
                          Tổng: <span className="font-medium text-brand-violet">{monthlyCostText}</span>
                        </div>
                      )}
                      {available > 0 && license.calculatedMonthlyCost > 0 && (
                        <div className="text-[10px] text-amber-600">
                          Lãng phí: ~{formatCurrencyVND(Math.round((license.costPerSeat * available) / (license.billingCycle === "yearly" ? 12 : 1)))}/tháng
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Expiry & Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                      <div className="text-[11px] text-brand-slate">
                        {license.type === "perpetual" ? (
                          <span className="text-teal-600 font-medium">Vĩnh viễn</span>
                        ) : license.expiryDate ? (
                          <div className="flex flex-col">
                            <span>
                              Hết hạn:{" "}
                              {new Date(license.expiryDate).toLocaleDateString("vi-VN")}
                            </span>
                            {license.status === "expiring_soon" && license.daysUntilExpiry !== undefined && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                (Còn {license.daysUntilExpiry} ngày)
                              </span>
                            )}
                          </div>
                        ) : (
                          "Không có ngày hạn"
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Allocate button */}
                      <button
                        type="button"
                        onClick={() => onAllocate(license)}
                        disabled={available === 0}
                        title={available === 0 ? "Đã hết seat trống" : "Cấp phát seat cho nhân viên"}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 text-brand-violet hover:bg-purple-50 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cấp phát</span>
                      </button>

                      {/* View Users button */}
                      <button
                        type="button"
                        onClick={() => onViewUsers(license)}
                        title="Xem danh sách nhân viên đang dùng bản quyền"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-bone text-brand-slate hover:text-brand-ink hover:bg-brand-mist text-xs font-medium transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-brand-slate" />
                        <span className="hidden md:inline">DS dùng</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-brand-bone text-[10px] font-bold">
                          {assigned}
                        </span>
                      </button>

                      {/* Edit (Admin/Tech) */}
                      <button
                        type="button"
                        onClick={() => onEdit(license)}
                        title="Chỉnh sửa bản quyền"
                        className="p-1.5 rounded-lg text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete (Admin only) */}
                      {role === "admin" && (
                        <button
                          type="button"
                          onClick={() => onDelete(license)}
                          title="Xóa bản quyền"
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

export default SoftwareTable;
