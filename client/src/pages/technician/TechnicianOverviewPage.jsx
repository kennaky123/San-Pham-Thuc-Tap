import { CheckCircle2, CircleGauge, Clock3, Ticket, TriangleAlert } from "lucide-react";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import { TicketPriorityBadge } from "../../components/ticket/TicketBadges.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function TechnicianOverviewPage() {
  const work = MOCK_TICKETS.filter((ticket) => ["assigned", "in_progress", "waiting_user"].includes(ticket.status)).slice(0, 4);
  return (
    <section><WorkspacePageHeader eyebrow="Nhân viên kỹ thuật" title="Tổng quan công việc" description="Nắm bắt khối lượng ticket, mức SLA và tiến độ xử lý trong ngày." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatCard icon={Ticket} label="Được phân công" value="7" description="2 ticket mới hôm nay" /><WorkspaceStatCard icon={Clock3} label="Đang xử lý" value="4" description="1 ticket đang chờ user" tone="violet" /><WorkspaceStatCard icon={TriangleAlert} label="Sắp quá hạn SLA" value="1" description="Cần ưu tiên xử lý ngay" tone="red" /><WorkspaceStatCard icon={CheckCircle2} label="Hoàn thành tuần này" value="18" description="Tăng 12% so với tuần trước" tone="emerald" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,.6fr)]"><section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-900">Cần xử lý hôm nay</h2><p className="mt-1 text-xs text-slate-500">Sắp xếp theo mức ưu tiên và SLA</p></div><ul className="divide-y divide-slate-100">{work.map((ticket) => <li key={ticket.id} className="flex items-center gap-4 px-5 py-4"><span className={`size-2 shrink-0 rounded-full ${ticket.priority === "urgent" ? "bg-red-500" : ticket.priority === "high" ? "bg-orange-500" : "bg-blue-500"}`} /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-blue-700">{ticket.ticketCode}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{ticket.title}</p></div><div className="hidden text-right sm:block"><TicketPriorityBadge priority={ticket.priority} /><p className="mt-1 text-xs text-slate-500">{ticket.sla}</p></div></li>)}</ul></section><aside className="space-y-4"><section className="rounded-xl border border-[#E2E8F0] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">SLA tháng này</p><p className="mt-2 text-3xl font-bold text-slate-900">96%</p></div><CircleGauge className="size-10 text-emerald-600" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[96%] rounded-full bg-emerald-500" /></div><p className="mt-3 text-xs text-slate-500">Mục tiêu của đội: ≥ 90%</p></section><section className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h2 className="font-bold text-blue-900">Ca làm việc</h2><p className="mt-2 text-sm text-blue-800">08:00 – 17:30 · Thứ Hai đến Thứ Sáu</p><p className="mt-3 text-xs text-blue-700">Trực hỗ trợ khẩn cấp đến 20:00 hôm nay.</p></section></aside></div>
    </section>
  );
}

export default TechnicianOverviewPage;
