export const USER_ROLES = ["user", "technician", "admin"];

export const ROLE_LABELS = {
  user: "Người dùng",
  technician: "Nhân viên kỹ thuật",
  admin: "Quản trị viên",
};

export const DEFAULT_ROLE_PATHS = {
  user: "/user/overview",
  technician: "/technician/overview",
  admin: "/admin/dashboard",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? "Tài khoản";
}

export function getDefaultPathForRole(role) {
  return DEFAULT_ROLE_PATHS[role] ?? "/login";
}
