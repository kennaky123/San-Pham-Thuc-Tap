import {
  BarChart3,
  ChartNoAxesColumn,
  CirclePlus,
  Clock3,
  HelpCircle,
  History,
  Laptop,
  LayoutDashboard,
  Layers,
  Network,
  Tags,
  UserCog,
  UserRound,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const NAVIGATION_BY_ROLE = {
  user: [
    {
      label: "Cổng Người Dùng",
      path: "/user/overview",
      icon: HelpCircle,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Yêu Cầu Của Tôi",
      path: "/user/tickets",
      icon: Layers,
      iconColor: "text-brand-blue",
      end: true,
    },
    {
      label: "Tạo Ticket Mới",
      path: "/user/tickets/new",
      icon: CirclePlus,
      iconColor: "text-emerald-600",
      end: true,
    },
    {
      label: "Mô Hình Mạng",
      path: "/topology",
      icon: Network,
      iconColor: "text-brand-blue",
      alertDot: true,
      end: true,
    },
    {
      label: "Thiết Bị Của Tôi",
      path: "/user/assets",
      icon: Laptop,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Hồ Sơ Cá Nhân",
      path: "/profile",
      icon: UserRound,
      end: true,
    },
  ],
  technician: [
    {
      label: "Tổng Quan",
      path: "/technician/overview",
      icon: LayoutDashboard,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Tất Cả Ticket",
      path: "/technician/tickets/all",
      icon: Layers,
      iconColor: "text-brand-blue",
      end: true,
    },
    {
      label: "Hàng Đợi Được Giao",
      path: "/technician/tickets/assigned",
      icon: UserRoundCheck,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Đang Xử Lý",
      path: "/technician/tickets/in-progress",
      icon: Clock3,
      iconColor: "text-brand-blue",
      end: true,
    },
    {
      label: "Lịch Sử Xử Lý",
      path: "/technician/history",
      icon: History,
      end: true,
    },
    {
      label: "Mô Hình Mạng",
      path: "/topology",
      icon: Network,
      iconColor: "text-brand-blue",
      alertDot: true,
      end: true,
    },
    {
      label: "Kho & Cấp Phát Laptop",
      path: "/technician/assets",
      icon: Laptop,
      iconColor: "text-brand-violet",
      end: true,
    },
  ],
  admin: [
    {
      label: "Hàng Đợi Ticket",
      path: "/admin/tickets",
      icon: Layers,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Kho & Thiết Bị",
      path: "/admin/assets",
      icon: Laptop,
      iconColor: "text-brand-violet",
      end: true,
    },
    {
      label: "Kho Dữ Liệu & BI",
      path: "/admin/dashboard",
      icon: BarChart3,
      iconColor: "text-emerald-600",
      end: true,
    },
    {
      label: "Mô Hình Mạng",
      path: "/topology",
      icon: Network,
      iconColor: "text-brand-blue",
      alertDot: true,
      end: true,
    },
    {
      label: "Người Dùng",
      path: "/admin/users",
      icon: Users,
      end: true,
    },
    {
      label: "Kỹ Thuật Viên",
      path: "/admin/technicians",
      icon: UserCog,
      end: true,
    },
    {
      label: "Danh Mục",
      path: "/admin/categories",
      icon: Tags,
      end: true,
    },
    {
      label: "Báo Cáo",
      path: "/admin/reports",
      icon: ChartNoAxesColumn,
      end: true,
    },
  ],
};

export function getNavigationForRole(role) {
  return NAVIGATION_BY_ROLE[role] ?? [];
}

export function getNavigationItemByPath(role, pathname) {
  return getNavigationForRole(role).find((item) => item.path === pathname);
}
