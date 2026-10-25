import { AlertTriangle, CheckCircle2, ShieldAlert, Usb } from "lucide-react";
import WorkspaceStatCard from "../common/WorkspaceStatCard.jsx";

function UsbStatsGrid({ summary = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <WorkspaceStatCard
        icon={Usb}
        label="Thiết Bị Đang Kết Nối"
        value={summary.currentlyConnected ?? 0}
        description={`Trên tổng số ${summary.totalDevices ?? 0} USB đã ghi nhận`}
        tone="blue"
      />
      <WorkspaceStatCard
        icon={AlertTriangle}
        label="USB Lạ Chưa Xác Minh"
        value={summary.unverifiedCount ?? 0}
        description="Cần Admin / Kỹ thuật viên kiểm tra & duyệt"
        tone={(summary.unverifiedCount ?? 0) > 0 ? "amber" : "blue"}
      />
      <WorkspaceStatCard
        icon={CheckCircle2}
        label="USB Đã Phê Duyệt (Whitelist)"
        value={summary.trustedCount ?? 0}
        description="Thiết bị hợp lệ được phép sử dụng"
        tone="emerald"
      />
      <WorkspaceStatCard
        icon={ShieldAlert}
        label="Thiết Bị Bị Chặn (Blacklist)"
        value={summary.blockedCount ?? 0}
        description={`Tổng ${summary.totalEvents ?? 0} sự kiện trên ${summary.activeHostsCount ?? 0} máy trạm`}
        tone="violet"
      />
    </div>
  );
}

export default UsbStatsGrid;
