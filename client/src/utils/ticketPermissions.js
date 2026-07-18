const STATUS_TRANSITIONS = Object.freeze({
  assigned: Object.freeze(["in_progress"]),
  in_progress: Object.freeze(["waiting_user", "resolved"]),
  waiting_user: Object.freeze(["in_progress"]),
});

const TERMINAL_STATUSES = new Set(["resolved", "closed", "cancelled"]);
const READ_ONLY_COMMENT_STATUSES = new Set(["closed", "cancelled"]);
const STATUS_LABELS = Object.freeze({
  pending: "Đang chờ",
  assigned: "Đã phân công",
  in_progress: "Đang xử lý",
  waiting_user: "Chờ người dùng",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
  cancelled: "Đã hủy",
});
const PRIORITY_LABELS = Object.freeze({
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
});
const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function referenceId(value) {
  if (!value) {
    return null;
  }

  return String(value._id ?? value);
}

export function getStatusTransitions(status) {
  return STATUS_TRANSITIONS[status] ?? [];
}

export function getTicketStatusLabel(status) {
  return STATUS_LABELS[status] ?? status ?? "Không xác định";
}

export function getTicketPriorityLabel(priority) {
  return PRIORITY_LABELS[priority] ?? priority ?? "Không xác định";
}

export function formatTicketDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

export function getTicketPermissions(ticket, user) {
  const userId = referenceId(user?._id);
  const isOwner = Boolean(userId) && referenceId(ticket?.createdBy) === userId;
  const isAssignee =
    Boolean(userId) && referenceId(ticket?.assignedTo) === userId;
  const isAdmin = user?.role === "admin";
  const isTechnician = user?.role === "technician" && isAssignee;
  const isUserOwner = user?.role === "user" && isOwner;
  const status = ticket?.status;
  const transitions = getStatusTransitions(status);

  return {
    isOwner,
    isAssignee,
    canAssign: isAdmin && !TERMINAL_STATUSES.has(status),
    canUpdateStatus:
      (isAdmin || isTechnician) && transitions.length > 0,
    canEditResolution:
      isTechnician && ["in_progress", "waiting_user"].includes(status),
    canComment:
      (isUserOwner || isTechnician) &&
      !READ_ONLY_COMMENT_STATUSES.has(status),
    canCreateInternalNote:
      isTechnician && !READ_ONLY_COMMENT_STATUSES.has(status),
    canCancel:
      (isUserOwner && ["pending", "assigned"].includes(status)) ||
      (isAdmin &&
        ["pending", "assigned", "in_progress", "waiting_user"].includes(
          status,
        )),
    canClose: (isUserOwner || isAdmin) && status === "resolved",
    canViewInternalContent: isAdmin || isTechnician,
    statusTransitions: transitions,
  };
}
