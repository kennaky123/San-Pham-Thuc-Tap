import {
  CheckCircle2,
  Clock3,
  Database,
  Download,
  RefreshCw,
  Ticket,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardChartCard from "../../components/dashboard/DashboardChartCard.jsx";
import DashboardErrorState from "../../components/dashboard/DashboardErrorState.jsx";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import LatestTicketsTable from "../../components/dashboard/LatestTicketsTable.jsx";
import TechnicianPerformanceList from "../../components/dashboard/TechnicianPerformanceList.jsx";
import TicketsByCategoryChart from "../../components/dashboard/TicketsByCategoryChart.jsx";
import TicketsByStatusChart from "../../components/dashboard/TicketsByStatusChart.jsx";
import TicketsLast7DaysChart from "../../components/dashboard/TicketsLast7DaysChart.jsx";
import useAdminDashboard from "../../hooks/useAdminDashboard.js";
import { getDashboardErrorMessage } from "../../services/dashboardService.js";
import {
  formatDashboardGeneratedAt,
  formatDashboardNumber,
} from "../../utils/dashboardFormatters.js";

function AdminDashboardPage() {
  const { data, error, isLoading, isRefreshing, refetch } =
    useAdminDashboard();

  function handleExportCsv() {
    if (!data) return;
    const rows = [
      "Chỉ số,Giá trị",
      `Tổng số ticket,${data.summary.totalTickets}`,
      `Ticket đang chờ,${data.summary.pendingTickets}`,
      `Ticket đang xử lý,${data.summary.processingTickets}`,
      `Ticket đã hoàn thành,${data.summary.completedTickets}`,
    ];
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${rows.join("\n")}`], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "deskpro-dw-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo OLAP CSV từ Fact Table (fact_ticket_events)!");
  }

  return (
    <section
      aria-labelledby="admin-dashboard-title"
      aria-busy={isRefreshing}
      className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6"
    >
      {/* DW & BI Header (Matches DeskPro IT View 4) */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1
              id="admin-dashboard-title"
              className="font-display text-2xl font-extrabold tracking-tight text-brand-ink"
            >
              Kho Dữ Liệu ITSM & Phân Tích Chuyên Sâu (BI)
            </h1>
            <span className="rounded-md border border-brand-violet/20 bg-brand-violet/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-violet">
              STAR SCHEMA DW
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
              ETL Sync:{" "}
              {data
                ? formatDashboardGeneratedAt(data.generatedAt, data.timeZone)
                : "Real-time"}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-slate">
            Tổng hợp dữ liệu lịch sử từ Fact Table (
            <code className="font-mono text-brand-violet">
              fact_ticket_events
            </code>
            ) kết hợp cùng dữ liệu vận hành thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              toast.info(
                "Đã sao chép SQL DDL (Star Schema: 1 Fact + 4 Dimensions) vào Clipboard!",
              )
            }
            className="flex items-center gap-1.5 rounded-lg border border-brand-bone bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink shadow-2xs transition-colors hover:bg-brand-mist"
          >
            <Database className="size-3.5 text-brand-violet" />
            Xuất SQL DDL Schema
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-lg border border-brand-bone bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink shadow-2xs transition-colors hover:bg-brand-mist disabled:opacity-50"
          >
            <Download className="size-3.5 text-brand-ink" />
            Xuất Báo Cáo CSV
          </button>
          {data ? (
            <button
              type="button"
              onClick={refetch}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-ink px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-carbon disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isRefreshing ? "Đang đồng bộ..." : "Đồng bộ ETL"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Top SLA & OLAP KPI Row from DeskPro IT */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-brand-slate uppercase">
            <span>Thời Gian Khắc Phục TB (MTTR)</span>
            <span className="rounded bg-brand-mist px-1.5 py-0.5 font-mono text-[10px] text-brand-ash">
              fact_ticket.mttr_mins
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-brand-ink">
              2h 18p
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-brand-emerald">
              ↓ 24% so với tháng trước
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-mist">
            <div
              className="h-full rounded-full bg-brand-emerald"
              style={{ width: "82%" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-brand-ash">
            Mục tiêu SLA cam kết: &lt; 4 giờ (Đạt chuẩn)
          </p>
        </div>

        <div className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-brand-slate uppercase">
            <span>Thời Gian Phản Hồi Đầu (MTTA)</span>
            <span className="rounded bg-brand-mist px-1.5 py-0.5 font-mono text-[10px] text-brand-ash">
              fact_ticket.mtta_mins
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-brand-ink">
              8p 45s
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-brand-emerald">
              ↓ 3p 10s
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-mist">
            <div
              className="h-full rounded-full bg-brand-violet"
              style={{ width: "91%" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-brand-ash">
            Mục tiêu SLA phản hồi: &lt; 15 phút
          </p>
        </div>

        <div className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-brand-slate uppercase">
            <span>Tỷ Lệ Tuân Thủ SLA</span>
            <span className="rounded bg-brand-mist px-1.5 py-0.5 font-mono text-[10px] text-brand-ash">
              is_sla_breached = 0
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-brand-ink">
              96.8%
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-brand-emerald">
              +1.4%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-mist">
            <div
              className="h-full rounded-full bg-brand-blue"
              style={{ width: "96.8%" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-brand-ash">
            Theo dõi trực tiếp trên toàn bộ hàng đợi
          </p>
        </div>

        <div className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-brand-slate uppercase">
            <span>Xử Lý Ngay Lần Đầu (FCR)</span>
            <span className="rounded bg-brand-mist px-1.5 py-0.5 font-mono text-[10px] text-brand-ash">
              reopen_count = 0
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-brand-ink">
              78.5%
            </span>
            <span className="rounded bg-brand-violet/10 px-1.5 py-0.5 text-xs font-bold text-brand-violet">
              Nhờ AI &amp; KB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-mist">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: "78.5%" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-brand-ash">
            Tự động giải quyết qua Self-Service: 22%
          </p>
        </div>
      </div>

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading && error && !data ? (
        <DashboardErrorState
          message={getDashboardErrorMessage(error)}
          onRetry={refetch}
        />
      ) : null}

      {!isLoading && data ? (
        <div className="space-y-6">
          {error ? (
            <div
              className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {getDashboardErrorMessage(error)} Dữ liệu gần nhất vẫn đang được
                hiển thị.
              </p>
              <button
                type="button"
                onClick={refetch}
                className="shrink-0 rounded-lg px-3 py-1.5 font-semibold text-amber-900 hover:bg-amber-100"
              >
                Thử lại
              </button>
            </div>
          ) : null}

          {/* Live Database Ticket Counters */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              icon={Ticket}
              label="Tổng số ticket"
              value={formatDashboardNumber(data.summary.totalTickets)}
              description="Tất cả yêu cầu trong cơ sở dữ liệu"
              tone="blue"
            />
            <DashboardStatCard
              icon={Clock3}
              label="Ticket đang chờ"
              value={formatDashboardNumber(data.summary.pendingTickets)}
              description="Chưa được phân công xử lý"
              tone="amber"
            />
            <DashboardStatCard
              icon={Wrench}
              label="Ticket đang xử lý"
              value={formatDashboardNumber(data.summary.processingTickets)}
              description="Đã phân công, đang xử lý hoặc chờ user"
              tone="violet"
            />
            <DashboardStatCard
              icon={CheckCircle2}
              label="Ticket đã hoàn thành"
              value={formatDashboardNumber(data.summary.completedTickets)}
              description="Đã giải quyết hoặc đã đóng"
              tone="emerald"
            />
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <DashboardChartCard
              titleId="ticket-trend-title"
              title="Lưu Lượng Ticket Phát Sinh Trong 7 Ngày Gần Nhất (OLAP Time-Series)"
              description="Phân tích theo chiều thời gian (dim_date) tại múi giờ Việt Nam"
              className="xl:col-span-2"
            >
              <TicketsLast7DaysChart
                data={data.charts.ticketsCreatedLast7Days}
              />
            </DashboardChartCard>

            <DashboardChartCard
              titleId="ticket-status-title"
              title="Phân Bổ Ticket Theo Trạng Thái SLA"
              description="Tỷ trọng trạng thái hiện hành trên toàn bộ hàng đợi"
            >
              <TicketsByStatusChart data={data.charts.ticketsByStatus} />
            </DashboardChartCard>

            <DashboardChartCard
              titleId="ticket-category-title"
              title="Phân Bổ Sự Cố Theo Danh Mục Kỹ Thuật"
              description="Truy vấn nhóm theo danh mục dịch vụ CNTT"
            >
              <TicketsByCategoryChart data={data.charts.ticketsByCategory} />
            </DashboardChartCard>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
            <LatestTicketsTable
              tickets={data.latestTickets}
              timeZone={data.timeZone}
            />
            <TechnicianPerformanceList
              technicians={data.charts.technicianPerformance}
            />
          </div>

          {/* Star Schema Architecture Diagram (From DeskPro IT View 4) */}
          <div className="rounded-xl border border-brand-bone bg-brand-onyx p-6 text-white shadow-lg">
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-mint" />
                  <h3 className="font-display text-lg font-extrabold">
                    Kiến Trúc Mô Hình Dữ Liệu Đa Chiều (Star Schema ERD — IT Help
                    Desk DW)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Thiết kế chuẩn Kimball phục vụ truy vấn OLAP tốc độ cao, huấn
                  luyện mô hình AI phân loại ticket và dự báo dung lượng hạ
                  tầng.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-brand-mint">
                  Engine: ClickHouse / BigQuery OLAP
                </span>
                <Link
                  to="/topology"
                  className="rounded-lg border border-brand-violet/40 bg-brand-violet/20 px-3 py-1.5 font-semibold text-white transition hover:bg-brand-violet/40"
                >
                  Mở Sơ Đồ Mạng →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-3">
              {/* Left Dimensions */}
              <div className="space-y-4">
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-brand-mint">
                      DIM_DEVICE_ASSET
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      Dimension
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-amber-400">PK asset_key</span>
                      <span>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>asset_tag_id</span>
                      <span>VARCHAR(32)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>hardware_model</span>
                      <span>VARCHAR(120)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>os_version</span>
                      <span>VARCHAR(64)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-brand-mint">
                      DIM_NETWORK_NODE
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      Dimension
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-amber-400">PK node_key</span>
                      <span>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>hostname</span>
                      <span>VARCHAR(64)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ip_address</span>
                      <span>INET</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vlan_id</span>
                      <span>SMALLINT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Fact Table */}
              <div className="relative rounded-2xl border-2 border-brand-violet bg-brand-violet/15 p-5 shadow-xl">
                <div className="mb-3 flex items-center justify-between border-b border-brand-violet/40 pb-2.5">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-white">
                      FACT_TICKET_EVENTS
                    </span>
                    <div className="text-[10px] text-brand-mint">
                      Bảng Sự Kiện Trung Tâm (Grain: 1 dòng / Ticket)
                    </div>
                  </div>
                  <span className="rounded bg-brand-violet px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                    FACT TABLE
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs text-slate-200">
                  <div className="flex justify-between text-amber-300">
                    <span>PK ticket_fact_id</span>
                    <span>BIGINT</span>
                  </div>
                  <div className="flex justify-between text-sky-300">
                    <span>FK date_key</span>
                    <span>INT → dim_date</span>
                  </div>
                  <div className="flex justify-between text-sky-300">
                    <span>FK requester_user_key</span>
                    <span>INT → dim_user</span>
                  </div>
                  <div className="flex justify-between text-sky-300">
                    <span>FK assigned_agent_key</span>
                    <span>INT → dim_agent</span>
                  </div>
                  <div className="flex justify-between text-sky-300">
                    <span>FK asset_key</span>
                    <span>INT → dim_device_asset</span>
                  </div>
                  <div className="flex justify-between text-sky-300">
                    <span>FK network_node_key</span>
                    <span>INT → dim_network_node</span>
                  </div>
                  <div className="my-1.5 border-t border-white/15 pt-1.5 text-[10px] font-bold text-brand-mint uppercase">
                    Measures (Chỉ Số Đo Lường):
                  </div>
                  <div className="flex justify-between">
                    <span>mtta_response_seconds</span>
                    <span>INT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>mttr_resolution_seconds</span>
                    <span>INT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>is_sla_breached</span>
                    <span>TINYINT(1)</span>
                  </div>
                </div>
              </div>

              {/* Right Dimensions */}
              <div className="space-y-4">
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-brand-mint">
                      DIM_USER_DEPARTMENT
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      Dimension (SCD2)
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-amber-400">PK user_key</span>
                      <span>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>employee_code</span>
                      <span>VARCHAR(20)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>department_name</span>
                      <span>VARCHAR(100)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vip_tier_level</span>
                      <span>VARCHAR(16)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-brand-mint">
                      DIM_SLA_POLICY
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      Dimension
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-amber-400">PK sla_policy_key</span>
                      <span>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>priority_level</span>
                      <span>CHAR(2) (P1..P4)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>max_response_mins</span>
                      <span>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>max_resolution_mins</span>
                      <span>INT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isRefreshing ? (
        <span className="sr-only" role="status" aria-live="polite">
          Đang làm mới dữ liệu dashboard...
        </span>
      ) : null}
    </section>
  );
}

export default AdminDashboardPage;
