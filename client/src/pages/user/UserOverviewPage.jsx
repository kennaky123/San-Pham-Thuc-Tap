import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Plus,
  Search,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "../../components/ticket/TicketBadges.jsx";
import TicketListErrorState from "../../components/ticket/TicketListErrorState.jsx";
import TicketListSkeleton from "../../components/ticket/TicketListSkeleton.jsx";
import { KB_ARTICLES } from "../../data/itsmData.js";
import useUserDashboard from "../../hooks/useUserDashboard.js";
import { getDashboardErrorMessage } from "../../services/dashboardService.js";

function UserOverviewPage() {
  const dashboard = useUserDashboard();
  const recent = dashboard.data?.recentTickets ?? [];
  const summary = dashboard.data?.summary ?? {};

  const [kbQuery, setKbQuery] = useState("");
  const [openKbId, setOpenKbId] = useState(KB_ARTICLES[0]?.id ?? null);

  const filteredKb = useMemo(() => {
    const q = kbQuery.trim().toLowerCase();
    if (!q) return KB_ARTICLES;
    return KB_ARTICLES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [kbQuery]);

  return (
    <section className="space-y-8 pb-12">
      {/* Hero Banner with Search (Matches DeskPro IT View 5) */}
      <div className="relative overflow-hidden border-b border-brand-bone bg-brand-onyx px-4 py-12 text-white sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#6647f0 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/40 bg-brand-violet/20 px-3 py-1 text-xs font-semibold text-brand-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
            Tất cả hệ thống ERP, Email &amp; VPN đang hoạt động 100% bình thường
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Xin chào, Trung tâm Hỗ trợ CNTT giúp gì được cho bạn?
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Tra cứu tài liệu hướng dẫn khắc phục nhanh hoặc gửi yêu cầu trực
            tiếp tới đội ngũ kỹ thuật DeskPro IT.
          </p>

          <div className="relative mx-auto mt-6 max-w-2xl">
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-ash" />
            <input
              type="text"
              value={kbQuery}
              onChange={(e) => setKbQuery(e.target.value)}
              placeholder="Nhập vấn đề của bạn (VD: Quên mật khẩu Windows, Lỗi VPN Fortinet, Cài máy in...)"
              className="w-full rounded-2xl border border-white/15 bg-white py-3.5 pr-32 pl-12 text-sm font-medium text-brand-ink shadow-xl outline-none placeholder:text-brand-ash focus:ring-4 focus:ring-brand-violet/40"
            />
            <Link
              to="/user/tickets/new"
              className="absolute top-1.5 right-1.5 bottom-1.5 inline-flex items-center rounded-xl bg-brand-violet px-4 text-xs font-bold text-white transition-colors hover:bg-brand-violet/90"
            >
              + Gửi Ticket
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Tìm kiếm phổ biến:</span>
            {["VPN Fortinet", "Mật khẩu AD", "Máy in", "Office 365"].map(
              (chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setKbQuery(chip)}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-white transition-colors hover:bg-white/20"
                >
                  {chip}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        {/* Category Quick Cards (4 Columns from DeskPro IT View 5) */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-brand-ink">
              Danh Mục Hỗ Trợ Nhanh
            </h2>
            <Link
              to="/user/tickets/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-carbon"
            >
              <Plus className="size-3.5" /> Tạo Ticket Mới
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/user/tickets/new"
              className="group rounded-xl border border-brand-bone bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-violet hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet transition-colors group-hover:bg-brand-violet group-hover:text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-brand-ink">
                Phần Cứng &amp; Thiết Bị
              </h3>
              <p className="mt-1 text-xs text-brand-slate">
                Laptop, màn hình, máy in, chuột, bàn phím, cấp phát thiết bị mới.
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-brand-violet">
                Tạo yêu cầu →
              </span>
            </Link>

            <Link
              to="/user/tickets/new"
              className="group rounded-xl border border-brand-bone bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-brand-ink">
                Phần Mềm &amp; Bản Quyền
              </h3>
              <p className="mt-1 text-xs text-brand-slate">
                Microsoft 365, SAP ERP, CRM, Adobe, cài đặt ứng dụng chuyên
                dụng.
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-brand-blue">
                Tạo yêu cầu →
              </span>
            </Link>

            <Link
              to="/user/tickets/new"
              className="group rounded-xl border border-brand-bone bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-emerald hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-emerald/10 text-brand-emerald transition-colors group-hover:bg-brand-emerald group-hover:text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-brand-ink">
                Mạng, Wi-Fi &amp; VPN
              </h3>
              <p className="mt-1 text-xs text-brand-slate">
                Kết nối Internet chập chờn, cấu hình VPN làm việc từ xa, quyền
                truy cập LAN.
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-brand-emerald">
                Tạo yêu cầu →
              </span>
            </Link>

            <Link
              to="/user/tickets/new"
              className="group rounded-xl border border-brand-bone bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-brand-ink">
                Tài Khoản &amp; Phân Quyền
              </h3>
              <p className="mt-1 text-xs text-brand-slate">
                Reset mật khẩu AD, mở khóa MFA, phân quyền thư mục SharePoint.
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-amber-600">
                Tạo yêu cầu →
              </span>
            </Link>
          </div>
        </div>

        {/* Live User Ticket Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <WorkspaceStatCard
            icon={Ticket}
            label="Tổng yêu cầu của bạn"
            value={String(summary.totalTickets ?? 0)}
            description="Từ khi bắt đầu sử dụng"
          />
          <WorkspaceStatCard
            icon={Clock3}
            label="Đang xử lý"
            value={String(summary.processingTickets ?? 0)}
            description="Có kỹ thuật viên phụ trách"
            tone="violet"
          />
          <WorkspaceStatCard
            icon={TriangleAlert}
            label="Chờ phản hồi"
            value={String(summary.waitingUserTickets ?? 0)}
            description="Cần bạn bổ sung thông tin"
            tone="amber"
          />
          <WorkspaceStatCard
            icon={CheckCircle2}
            label="Đã hoàn thành"
            value={String(summary.completedTickets ?? 0)}
            description="Ticket đã được xử lý"
            tone="emerald"
          />
        </div>

        {/* Recent Tickets + Knowledge Base Accordion */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Recent Tickets */}
          <section className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-brand-bone px-5 py-4">
              <div>
                <h2 className="font-display text-sm font-bold text-brand-ink">
                  Yêu Cầu Gần Đây Của Bạn
                </h2>
                <p className="mt-0.5 text-xs text-brand-slate">
                  Theo dõi tiến độ SLA theo thời gian thực
                </p>
              </div>
              <Link
                to="/user/tickets"
                className="text-xs font-semibold text-brand-violet hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>

            {dashboard.isLoading ? (
              <div className="p-4">
                <TicketListSkeleton />
              </div>
            ) : dashboard.error && !dashboard.data ? (
              <div className="p-4">
                <TicketListErrorState
                  message={getDashboardErrorMessage(dashboard.error)}
                  onRetry={dashboard.refetch}
                />
              </div>
            ) : recent.length ? (
              <ul className="divide-y divide-brand-bone">
                {recent.map((ticket) => (
                  <li key={ticket._id}>
                    <Link
                      to={`/user/tickets/${ticket._id}`}
                      className="group flex flex-col gap-2.5 px-5 py-3.5 transition hover:bg-brand-violet/[0.03] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-brand-ink group-hover:text-brand-violet">
                          {ticket.ticketCode}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-brand-ink">
                          {ticket.title}
                        </p>
                        <p className="mt-0.5 text-xs text-brand-ash">
                          {ticket.category?.name ??
                            ticket.category ??
                            "Không xác định"}
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
              <div className="py-12 text-center text-xs text-brand-slate">
                Bạn chưa gửi yêu cầu hỗ trợ nào.
              </div>
            )}
          </section>

          {/* Right: Interactive Knowledge Base FAQ Accordion */}
          <section className="rounded-xl border border-brand-bone bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-bold text-brand-ink">
                  Cẩm Nang Khắc Phục Sự Cố Thường Gặp (Knowledge Base)
                </h2>
                <p className="mt-0.5 text-xs text-brand-slate">
                  {filteredKb.length} bài viết hướng dẫn tự xử lý nhanh
                </p>
              </div>
              {kbQuery ? (
                <button
                  type="button"
                  onClick={() => setKbQuery("")}
                  className="text-xs font-semibold text-brand-violet hover:underline"
                >
                  Xóa lọc
                </button>
              ) : null}
            </div>

            <div className="space-y-2.5">
              {filteredKb.map((article) => {
                const isOpen = openKbId === article.id;
                return (
                  <div
                    key={article.id}
                    className="overflow-hidden rounded-xl border border-brand-bone transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenKbId(isOpen ? null : article.id)
                      }
                      className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-brand-mist/50"
                    >
                      <div className="min-w-0">
                        <span className="rounded bg-brand-violet/10 px-2 py-0.5 text-[10px] font-bold text-brand-violet">
                          {article.category}
                        </span>
                        <h3 className="mt-1 text-xs font-bold text-brand-ink">
                          {article.title}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`size-4 shrink-0 text-brand-ash transition-transform ${
                          isOpen ? "rotate-180 text-brand-violet" : ""
                        }`}
                      />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-brand-bone bg-brand-mist/40 px-4 py-3 text-xs leading-relaxed text-brand-slate">
                        <p>{article.answer}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-brand-ash">
                          <span>Lượt xem: {article.views}</span>
                          <Link
                            to="/user/tickets/new"
                            className="font-semibold text-brand-violet hover:underline"
                          >
                            Vẫn chưa khắc phục được? Tạo ticket →
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom Direct Support Callout */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-bone bg-white p-6 shadow-xs sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-ink text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-ink">
                Không tìm thấy câu trả lời phù hợp?
              </h3>
              <p className="text-xs text-brand-slate">
                Đội ngũ kỹ sư IT trực ca 24/7 sẵn sàng hỗ trợ qua Ticket hoặc
                Hotline nội bộ <strong className="text-brand-ink">Ext: 8888</strong>.
              </p>
            </div>
          </div>
          <Link
            to="/user/tickets/new"
            className="shrink-0 rounded-full bg-brand-ink px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-carbon"
          >
            + Tạo Ticket Yêu Cầu Hỗ Trợ
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UserOverviewPage;
