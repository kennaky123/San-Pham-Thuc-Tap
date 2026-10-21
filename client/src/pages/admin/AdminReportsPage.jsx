import { CheckCircle2, Clock3, Download, Gauge, Ticket } from "lucide-react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import DashboardErrorState from "../../components/dashboard/DashboardErrorState.jsx";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton.jsx";
import useAdminDashboard from "../../hooks/useAdminDashboard.js";
import { getDashboardErrorMessage } from "../../services/dashboardService.js";

const COLORS = [
  "#6647f0",
  "#0091ff",
  "#00c07a",
  "#f59e0b",
  "#ef4444",
  "#646464",
];

function AdminReportsPage() {
  const { data, error, isLoading, refetch } = useAdminDashboard();
  const weekly = (data?.charts.ticketsCreatedLast7Days ?? []).map(
    (item, index) => ({
      day: item.name,
      created: item.value,
      resolved: data?.charts.ticketsResolvedLast7Days?.[index]?.value ?? 0,
    }),
  );
  const categories = data?.charts.ticketsByCategory ?? [];
  const technicians = data?.charts.technicianPerformance ?? [];

  function exportReport() {
    const rows = [
      "Ngày,Ticket tạo mới,Ticket hoàn thành",
      ...weekly.map((item) => `${item.day},${item.created},${item.resolved}`),
    ];
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${rows.join("\n")}`], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-it-helpdesk.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo CSV từ Kho Dữ Liệu ITSM.");
  }

  return (
    <section>
      <WorkspacePageHeader
        eyebrow="Kho dữ liệu ITSM & BI"
        title="Báo cáo vận hành & Dự báo phần cứng"
        description="Phân tích chuyên sâu từ dữ liệu lịch sử ticket, hiệu suất kỹ thuật viên và cảnh báo bảo trì thiết bị."
        actions={
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-ink px-4 text-xs font-semibold text-white transition hover:bg-brand-carbon"
          >
            <Download className="size-3.5" />
            Xuất Báo Cáo CSV
          </button>
        }
      />
      {isLoading ? <DashboardSkeleton /> : null}
      {!isLoading && error ? (
        <DashboardErrorState
          message={getDashboardErrorMessage(error)}
          onRetry={refetch}
        />
      ) : null}
      {!isLoading && data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStatCard
              icon={Ticket}
              label="Ticket tiếp nhận"
              value={data.summary.totalTickets}
              description="Tổng ticket trong hệ thống"
            />
            <WorkspaceStatCard
              icon={CheckCircle2}
              label="Đã hoàn thành"
              value={data.summary.completedTickets}
              description="Đã giải quyết hoặc đóng"
              tone="emerald"
            />
            <WorkspaceStatCard
              icon={Clock3}
              label="Đang xử lý"
              value={data.summary.processingTickets}
              description="Đã phân công, đang xử lý hoặc chờ phản hồi"
              tone="violet"
            />
            <WorkspaceStatCard
              icon={Gauge}
              label="Ticket khẩn cấp"
              value={data.summary.urgentTickets}
              description="Cần được ưu tiên SLA P1"
              tone="amber"
            />
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,.6fr)]">
            <ChartCard weekly={weekly} />
            <CategoryCard categories={categories} />
          </div>

          {/* Predictive Hardware Failure & Technician Performance Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-sm font-bold text-brand-ink">
                    Dự Báo Bảo Trì & Tỷ Lệ Lỗi Theo Dòng Thiết Bị
                  </h2>
                  <p className="text-xs text-brand-slate">
                    Truy vấn kết hợp{" "}
                    <code className="font-mono text-brand-violet">
                      dim_device_asset
                    </code>{" "}
                    ×{" "}
                    <code className="font-mono text-brand-violet">
                      fact_ticket_events
                    </code>
                  </p>
                </div>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                  Predictive AI
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-bone text-[10px] font-bold text-brand-ash uppercase">
                      <th className="pb-2">Dòng Thiết Bị (Model)</th>
                      <th className="pb-2 text-center">Số Lượng</th>
                      <th className="pb-2 text-center">MTBF</th>
                      <th className="pb-2 text-right">Khuyến Nghị DW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-bone">
                    <tr>
                      <td className="py-3 font-semibold text-brand-ink">
                        Dell Latitude 5420 (Batch 2022)
                      </td>
                      <td className="py-3 text-center font-mono">142 máy</td>
                      <td className="py-3 text-center font-mono font-bold text-red-600">
                        42 ngày
                      </td>
                      <td className="py-3 text-right">
                        <span className="rounded bg-red-50 px-2 py-0.5 font-semibold text-red-600">
                          Thay pin &amp; nâng RAM
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-brand-ink">
                        HP LaserJet Pro M404dn
                      </td>
                      <td className="py-3 text-center font-mono">18 máy</td>
                      <td className="py-3 text-center font-mono font-bold text-amber-600">
                        65 ngày
                      </td>
                      <td className="py-3 text-right">
                        <span className="rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                          Cập nhật Firmware LPR
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-brand-ink">
                        MacBook Pro 14&quot; M3 Pro
                      </td>
                      <td className="py-3 text-center font-mono">85 máy</td>
                      <td className="py-3 text-center font-mono font-bold text-brand-emerald">
                        310 ngày
                      </td>
                      <td className="py-3 text-right">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-brand-emerald">
                          Hoạt động ổn định
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
              <div className="border-b border-brand-bone px-5 py-4">
                <h2 className="font-display text-sm font-bold text-brand-ink">
                  Hiệu Suất Xử Lý Của Kỹ Thuật Viên (dim_agent)
                </h2>
                <p className="mt-0.5 text-xs text-brand-slate">
                  Tổng hợp từ ticket đã phân công trong hệ thống
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-brand-bone bg-brand-mist/70 text-[10px] font-bold tracking-wider text-brand-slate uppercase">
                    <tr>
                      <th className="px-5 py-3">Kỹ thuật viên</th>
                      <th className="px-4 py-3 text-center">Đang xử lý</th>
                      <th className="px-4 py-3 text-center">Đã hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-bone">
                    {technicians.map((item) => (
                      <tr
                        key={item.technicianId}
                        className="hover:bg-brand-mist/40"
                      >
                        <td className="px-5 py-3.5 font-semibold text-brand-ink">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-brand-violet">
                          {item.inProgress}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-brand-emerald">
                          {item.completed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

function ChartCard({ weekly }) {
  return (
    <section className="min-w-0 rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
      <h2 className="font-display text-sm font-bold text-brand-ink">
        Lưu Lượng Ticket Phát Sinh vs. Đã Xử Lý (7 Ngày)
      </h2>
      <p className="mt-0.5 text-xs text-brand-slate">
        Đối chiếu tốc độ tiếp nhận và năng lực giải quyết của đội ngũ IT
      </p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly}>
            <CartesianGrid
              stroke="#e8e8e8"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#646464", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#646464", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="created"
              name="Phát sinh mới"
              fill="#6647f0"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="resolved"
              name="Đã giải quyết"
              fill="#00c07a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function CategoryCard({ categories }) {
  return (
    <section className="min-w-0 rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
      <h2 className="font-display text-sm font-bold text-brand-ink">
        Cơ Cấu Danh Mục Sự Cố
      </h2>
      <p className="mt-0.5 text-xs text-brand-slate">
        Tỷ trọng yêu cầu theo nhóm dịch vụ CNTT
      </p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
            >
              {categories.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {categories.map((item, index) => (
          <li
            key={item.name}
            className="flex items-center gap-1.5 text-xs text-brand-slate"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{item.name}:</span>
            <strong className="font-mono text-brand-ink">{item.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminReportsPage;
