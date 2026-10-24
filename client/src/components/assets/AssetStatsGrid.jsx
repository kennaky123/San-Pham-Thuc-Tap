import { HardDrive, Laptop, RotateCcw, Wrench } from "lucide-react";
import WorkspaceStatCard from "../common/WorkspaceStatCard.jsx";

function AssetStatsGrid({ summary = {} }) {
  const total = Number(summary.total ?? 0);
  const inStock = Number(summary.in_stock ?? 0);
  const inUse = Number(summary.in_use ?? 0);
  const maintenance = Number(summary.maintenance ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <WorkspaceStatCard
        icon={Laptop}
        label="Tổng Thiết Bị Quản Lý"
        value={total}
        description="Bao gồm Laptop, PC & trang thiết bị"
        tone="blue"
      />
      <WorkspaceStatCard
        icon={HardDrive}
        label="Trong Kho Sẵn Sàng"
        value={inStock}
        description="Có thể xuất cấp phát ngay cho nhân viên"
        tone="emerald"
      />
      <WorkspaceStatCard
        icon={RotateCcw}
        label="Đang Cấp Phát Sử Dụng"
        value={inUse}
        description="Đang gán trực tiếp cho nhân viên làm việc"
        tone="violet"
      />
      <WorkspaceStatCard
        icon={Wrench}
        label="Đang Bảo Trì / Sửa Chữa"
        value={maintenance}
        description="Thiết bị chờ kỹ thuật kiểm tra hoặc bảo hành"
        tone="amber"
      />
    </div>
  );
}

export default AssetStatsGrid;
