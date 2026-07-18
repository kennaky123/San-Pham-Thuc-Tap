import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Ticket,
  TriangleAlert,
  Wrench,
} from "lucide-react";
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

  return (
    <section aria-labelledby="admin-dashboard-title" aria-busy={isRefreshing}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Quản trị hệ thống
          </p>
          <h1
            id="admin-dashboard-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tổng quan tình hình tiếp nhận và xử lý yêu cầu hỗ trợ nội bộ.
          </p>
          {data ? (
            <p className="mt-1 text-xs text-slate-500">
              Cập nhật lúc {formatDashboardGeneratedAt(data.generatedAt, data.timeZone)}
            </p>
          ) : null}
        </div>

        {data ? (
          <button
            type="button"
            onClick={refetch}
            disabled={isRefreshing}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              className={[
                "size-4",
                isRefreshing
                  ? "animate-spin motion-reduce:animate-none"
                  : "",
              ].join(" ")}
              aria-hidden="true"
            />
            {isRefreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
          </button>
        ) : null}
      </div>

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading && error && !data ? (
        <DashboardErrorState
          message={getDashboardErrorMessage(error)}
          onRetry={refetch}
        />
      ) : null}

      {!isLoading && data ? (
        <div>
          {error ? (
            <div
              className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
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
                className="min-h-10 shrink-0 self-start rounded-lg px-3 py-2 font-semibold text-amber-900 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-700 sm:self-auto"
              >
                Thử lại
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              icon={Ticket}
              label="Tổng số ticket"
              value={formatDashboardNumber(data.summary.totalTickets)}
              description="Tất cả yêu cầu trong hệ thống"
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

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <DashboardChartCard
              titleId="ticket-trend-title"
              title="Ticket trong 7 ngày gần nhất"
              description="Số lượng yêu cầu mới theo ngày, múi giờ Việt Nam"
              className="xl:col-span-2"
            >
              <TicketsLast7DaysChart
                data={data.charts.ticketsCreatedLast7Days}
              />
            </DashboardChartCard>

            <DashboardChartCard
              titleId="ticket-status-title"
              title="Ticket theo trạng thái"
              description="Phân bổ toàn bộ ticket theo trạng thái hiện tại"
            >
              <TicketsByStatusChart data={data.charts.ticketsByStatus} />
            </DashboardChartCard>

            <DashboardChartCard
              titleId="ticket-category-title"
              title="Ticket theo danh mục"
              description="Các danh mục có phát sinh yêu cầu hỗ trợ"
            >
              <TicketsByCategoryChart data={data.charts.ticketsByCategory} />
            </DashboardChartCard>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
            <LatestTicketsTable
              tickets={data.latestTickets}
              timeZone={data.timeZone}
            />
            <TechnicianPerformanceList
              technicians={data.charts.technicianPerformance}
            />
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
