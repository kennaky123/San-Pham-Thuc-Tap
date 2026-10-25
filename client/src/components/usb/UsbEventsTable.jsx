import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  HardDrive,
  Laptop,
  Usb,
} from "lucide-react";
import { formatTicketDateTime } from "../../utils/ticketPermissions.js";

const STATUS_BADGE = {
  trusted: {
    label: "Hợp lệ (Whitelisted)",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  unverified: {
    label: "Chưa xác minh",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  blocked: {
    label: "Bị chặn (Blacklisted)",
    cls: "bg-red-50 text-red-700 border-red-200",
  },
};

function UsbEventsTable({ events = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-mist/60 text-[11px] font-bold text-brand-slate uppercase tracking-wider border-b border-brand-bone">
          <tr>
            <th className="py-3 px-4">Thời Gian</th>
            <th className="py-3 px-4">Sự Kiện</th>
            <th className="py-3 px-4">Thiết Bị Ngoại Vi USB</th>
            <th className="py-3 px-4">Máy Trạm Nhân Viên</th>
            <th className="py-3 px-4">Mức Độ An Ninh Lúc Cắm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-bone">
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-xs text-brand-slate">
                Chưa có sự kiện cắm / rút USB nào được ghi nhận.
              </td>
            </tr>
          ) : (
            events.map((evt) => {
              const isConnect = evt.eventType === "connected";
              const statusInfo =
                STATUS_BADGE[evt.deviceStatusAtEvent] || STATUS_BADGE.unverified;

              return (
                <tr
                  key={evt._id}
                  className="hover:bg-brand-mist/30 transition-colors"
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-ink">
                      <Clock className="w-3.5 h-3.5 text-brand-ash" />
                      <span>{formatTicketDateTime(evt.createdAt)}</span>
                    </div>
                  </td>

                  {/* Event Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isConnect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-brand-violet border border-purple-200">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Cắm USB vào
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-brand-slate border border-gray-200">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Rút USB ra
                      </span>
                    )}
                  </td>

                  {/* Device Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Usb className="w-4 h-4 text-brand-violet shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-brand-onyx flex items-center gap-2">
                          <span>{evt.deviceName}</span>
                          {evt.driveLetter && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-mist text-[10px] font-mono text-brand-ink border border-brand-bone">
                              <HardDrive className="w-2.5 h-2.5" />
                              {evt.driveLetter}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-brand-slate truncate max-w-[300px]">
                          {evt.vendor} • <span className="font-mono text-[10px]">{evt.deviceId}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Host Info */}
                  <td className="py-3 px-4">
                    <div className="text-xs">
                      <div className="font-bold text-brand-onyx flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-brand-slate" />
                        <span>{evt.hostname}</span>
                      </div>
                      <div className="text-[11px] text-brand-slate">
                        User: <span className="font-medium text-brand-ink">{evt.osUsername || "N/A"}</span>
                        {evt.ipAddress && (
                          <span className="font-mono text-[10px] text-brand-ash ml-1.5">
                            ({evt.ipAddress})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Security Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.cls}`}
                    >
                      {statusInfo.label}
                    </span>
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

export default UsbEventsTable;
