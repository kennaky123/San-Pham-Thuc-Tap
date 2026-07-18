import { CalendarPlus, LockKeyhole, UserCheck, Users } from "lucide-react";

const CARDS = [
  { key: "total", label: "Tổng người dùng", icon: Users, tone: "bg-blue-50 text-blue-700", description: "Tất cả tài khoản hệ thống" },
  { key: "active", label: "Đang hoạt động", icon: UserCheck, tone: "bg-emerald-50 text-emerald-700", description: "Có thể đăng nhập hệ thống" },
  { key: "locked", label: "Tài khoản bị khóa", icon: LockKeyhole, tone: "bg-red-50 text-red-700", description: "Cần quản trị viên xử lý" },
  { key: "newThisMonth", label: "Mới trong tháng", icon: CalendarPlus, tone: "bg-violet-50 text-violet-700", description: "Tài khoản đăng ký mới" },
];

function UserStatsGrid({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Thống kê người dùng">
      {CARDS.map(({ key, label, icon: Icon, tone, description }) => (
        <article key={key} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stats[key]}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default UserStatsGrid;
