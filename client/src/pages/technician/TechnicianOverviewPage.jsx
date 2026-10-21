import {
  CheckCircle2,
  CircleGauge,
  Clock3,
  Network,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import DashboardErrorState from "../../components/dashboard/DashboardErrorState.jsx";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton.jsx";
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "../../components/ticket/TicketBadges.jsx";
import useTechnicianDashboard from "../../hooks/useTechnicianDashboard.js";
import { getDashboardErrorMessage } from "../../services/dashboardService.js";

function TechnicianOverviewPage() {
  const { data, error, isLoading, refetch } = useTechnicianDashboard();

  return (
    <section>
      <WorkspacePageHeader
        eyebrow="Kỹ thuật viên DeskPro IT"
        title="Bàn Làm Việc Kỹ Thuật (Agent Workspace)"
        description="Theo dõi các ticket đang được phân công cho bạn, thời hạn SLA và trạng thái hạ tầng mạng."
        actions={
          <Link
            to="/topology"
            className="inline-flex items-center gap-2 rounded-full border border-brand-bone bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-2xs transition hover:border-brand-violet hover:text-brand-violet"
          >
            <Network className="size-3.5 text-brand-violet" />
            Sơ Đồ Mạng Campus
          </Link>
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
        <TechnicianDashboardContent dashboard={data} />
      ) : null}
    </section>
  );
}

function TechnicianDashboardContent({ dashboard }) {
  const { summary, workTickets } = dashboard;
  const completionRate = Math.min(100, summary.completionRate);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          icon={Ticket}
          label="Chờ tiếp nhận"
          value={summary.assignedTickets}
          description={`${summary.assignedToday} ticket được phân công hôm nay`}
        />
        <WorkspaceStatCard
          icon={Clock3}
          label="Đang xử lý"
          value={summary.inProgressTickets}
          description={`${summary.waitingUserTickets} ticket đang chờ người dùng`}
          tone="violet"
        />
        <WorkspaceStatCard
          icon={TriangleAlert}
          label="Khẩn cấp (P1)"
          value={summary.urgentTickets}
          description="Ticket khẩn cấp đang được giao cho bạn"
          tone="red"
        />
        <WorkspaceStatCard
          icon={CheckCircle2}
          label="Hoàn thành tuần này"
          value={summary.completedThisWeek}
          description="Ticket đã giải quyết hoặc đã đóng"
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,.6fr)]">
        <section className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
          <div className="flex items-center justify-between gap-4 border-b border-brand-bone px-5 py-4">
            <div>
              <h2 className="font-display text-sm font-bold text-brand-ink">
                Hàng Đợi Ticket Cần Xử Lý Ngay
              </h2>
              <p className="mt-0.5 text-xs text-brand-slate">
                Sắp xếp theo mức độ ưu tiên SLA và cập nhật mới nhất
              </p>
            </div>
            <Link
              to="/technician/tickets/assigned"
              className="text-xs font-semibold text-brand-violet hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          {workTickets.length ? (
            <ul className="divide-y divide-brand-bone">
              {workTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    to={`/technician/tickets/${ticket.id}`}
                    state={{
                      navigationPath:
                        ticket.status === "assigned"
                          ? "/technician/tickets/assigned"
                          : "/technician/tickets/in-progress",
                    }}
                    className="group flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-brand-violet/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-bold text-brand-ink group-hover:text-brand-violet">
                        {ticket.ticketCode}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-brand-ink">
                        {ticket.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-brand-ash">
                        Người yêu cầu:{" "}
                        {ticket.requester?.fullName ?? "Không xác định"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <TicketPriorityBadge priority={ticket.priority} />
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-16 text-center text-xs text-brand-slate">
              Bạn không có ticket nào cần xử lý trong hàng đợi.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-wider text-brand-slate uppercase">
                  Tỷ lệ hoàn tất SLA tháng này
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold text-brand-ink">
                  {completionRate}%
                </p>
              </div>
              <CircleGauge className="size-9 text-brand-emerald" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-mist">
              <div
                className="h-full rounded-full bg-brand-emerald transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-brand-slate">
              Đã hoàn tất{" "}
              <strong className="font-mono text-brand-ink">
                {summary.completedThisMonth}/{summary.assignedThisMonth}
              </strong>{" "}
              ticket được phân công trong tháng.
            </p>
          </section>

          <section className="rounded-xl border border-brand-bone bg-brand-onyx p-5 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-mint" />
              <h2 className="font-display text-sm font-bold">
                AIOps Infrastructure Intelligence
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Kiểm tra trực tiếp sơ đồ mạng Campus, trạng thái Switch/AP và
              xử lý hàng loạt các sự cố hạ tầng.
            </p>
            <Link
              to="/topology"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-violet px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-violet/90"
            >
              Mở Bản Đồ Mạng →
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default TechnicianOverviewPage;
