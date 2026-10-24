import { AlertTriangle, CreditCard, Layers, TrendingDown } from "lucide-react";
import WorkspaceStatCard from "../common/WorkspaceStatCard.jsx";
import { formatCurrencyVND } from "../../services/softwareService.js";

function SoftwareFinOpsSummary({ finOps = {} }) {
  const monthlyCost = formatCurrencyVND(finOps.monthlyTotalCost || 0);
  const wastedCost = formatCurrencyVND(finOps.wastedMonthlyCost || 0);
  const utilization = `${finOps.utilizationRate ?? 0}%`;
  const seatsDetail = `Đã cấp ${finOps.assignedSeats ?? 0}/${finOps.totalSeats ?? 0} seats`;
  const expiringCount = Number(finOps.expiringSoonCount || 0) + Number(finOps.expiredCount || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <WorkspaceStatCard
        icon={CreditCard}
        label="Ngân Sách Phần Mềm / Tháng"
        value={monthlyCost}
        description="Tổng chi phí định kỳ Microsoft, Adobe, SaaS..."
        tone="blue"
      />
      <WorkspaceStatCard
        icon={Layers}
        label="Hiệu Suất Sử Dụng Bản Quyền"
        value={utilization}
        description={seatsDetail}
        tone="emerald"
      />
      <WorkspaceStatCard
        icon={AlertTriangle}
        label="Sắp Hết Hạn / Cần Gia Hạn"
        value={expiringCount}
        description={
          finOps.expiredCount > 0
            ? `${finOps.expiredCount} gói đã hết hạn, ${finOps.expiringSoonCount} gói sắp tới hạn`
            : "Hợp đồng trong vòng 30 ngày tới"
        }
        tone={expiringCount > 0 ? "amber" : "blue"}
      />
      <WorkspaceStatCard
        icon={TrendingDown}
        label="Tiết Kiệm Tiềm Năng (FinOps)"
        value={wastedCost}
        description={`Từ ${finOps.unassignedSeats ?? 0} seats chưa gán cho nhân viên`}
        tone="violet"
      />
    </div>
  );
}

export default SoftwareFinOpsSummary;
