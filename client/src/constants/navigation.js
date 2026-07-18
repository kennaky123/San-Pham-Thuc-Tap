import {
  ChartNoAxesColumn,
  CirclePlus,
  ClipboardList,
  Clock3,
  History,
  LayoutDashboard,
  Tags,
  Ticket,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

export const NAVIGATION_BY_ROLE = {
  user: [
    {
      label: "Tổng quan",
      path: "/user/overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Tạo yêu cầu",
      path: "/user/tickets/new",
      icon: CirclePlus,
      end: true,
    },
    {
      label: "Yêu cầu của tôi",
      path: "/user/tickets",
      icon: Ticket,
      end: true,
    },
    {
      label: "Hồ sơ cá nhân",
      path: "/profile",
      icon: UserRound,
      end: true,
    },
  ],
  technician: [
    {
      label: "Tổng quan",
      path: "/technician/overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Ticket được phân công",
      path: "/technician/tickets/assigned",
      icon: ClipboardList,
      end: true,
    },
    {
      label: "Ticket đang xử lý",
      path: "/technician/tickets/in-progress",
      icon: Clock3,
      end: true,
    },
    {
      label: "Lịch sử xử lý",
      path: "/technician/history",
      icon: History,
      end: true,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Quản lý ticket",
      path: "/admin/tickets",
      icon: Ticket,
      end: true,
    },
    {
      label: "Người dùng",
      path: "/admin/users",
      icon: Users,
      end: true,
    },
    {
      label: "Nhân viên kỹ thuật",
      path: "/admin/technicians",
      icon: UserCog,
      end: true,
    },
    {
      label: "Danh mục",
      path: "/admin/categories",
      icon: Tags,
      end: true,
    },
    {
      label: "Báo cáo",
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
