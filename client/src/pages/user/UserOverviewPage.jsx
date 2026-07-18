import { CheckCircle2, Clock3, Plus, Ticket, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import { TicketPriorityBadge, TicketStatusBadge } from "../../components/ticket/TicketBadges.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function UserOverviewPage() {
  const recent = MOCK_TICKETS.slice(0, 5);
  return (
    <section>
      <WorkspacePageHeader eyebrow="Không gian của bạn" title="Tổng quan" description="Theo dõi nhanh tình trạng yêu cầu hỗ trợ và những cập nhật mới nhất." actions={<Link to="/user/tickets/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="size-4" />Tạo yêu cầu</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatCard icon={Ticket} label="Tổng yêu cầu" value="12" description="Từ khi bắt đầu sử dụng" /><WorkspaceStatCard icon={Clock3} label="Đang xử lý" value="3" description="Có kỹ thuật viên phụ trách" tone="violet" /><WorkspaceStatCard icon={TriangleAlert} label="Chờ phản hồi" value="1" description="Cần bạn bổ sung thông tin" tone="amber" /><WorkspaceStatCard icon={CheckCircle2} label="Đã hoàn thành" value="8" description="Tỷ lệ hài lòng 96%" tone="emerald" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)]">
        <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold text-slate-900">Yêu cầu gần đây</h2><p className="mt-1 text-xs text-slate-500">Các cập nhật mới nhất của bạn</p></div><Link to="/user/tickets" className="text-sm font-semibold text-blue-700">Xem tất cả</Link></div><ul className="divide-y divide-slate-100">{recent.map((ticket) => <li key={ticket.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold text-blue-700">{ticket.ticketCode}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">{ticket.category}</p></div><div className="flex shrink-0 gap-2"><TicketPriorityBadge priority={ticket.priority} /><TicketStatusBadge status={ticket.status} /></div></li>)}</ul></section>
        <aside className="space-y-4"><section className="rounded-xl border border-blue-200 bg-blue-600 p-5 text-white shadow-sm"><h2 className="font-bold">Cần hỗ trợ ngay?</h2><p className="mt-2 text-sm leading-6 text-blue-100">Mô tả chi tiết sự cố để đội ngũ kỹ thuật xử lý nhanh hơn.</p><Link to="/user/tickets/new" className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-blue-700">Tạo ticket mới</Link></section><section className="rounded-xl border border-[#E2E8F0] bg-white p-5"><h2 className="font-bold text-slate-900">Mẹo gửi yêu cầu</h2><ul className="mt-3 space-y-3 text-sm leading-5 text-slate-600"><li>• Chụp lại màn hình lỗi.</li><li>• Ghi rõ thời điểm xảy ra.</li><li>• Chọn đúng mức độ ưu tiên.</li></ul></section></aside>
      </div>
    </section>
  );
}

export default UserOverviewPage;
