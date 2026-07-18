const STATUS_STYLES = {
  pending: {
    label: "Đang chờ",
    classes: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  assigned: {
    label: "Đã phân công",
    classes: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  in_progress: {
    label: "Đang xử lý",
    classes: "bg-violet-50 text-violet-700 ring-violet-600/20",
  },
  waiting_user: {
    label: "Chờ người dùng",
    classes: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
  resolved: {
    label: "Đã giải quyết",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  closed: {
    label: "Đã đóng",
    classes: "bg-slate-100 text-slate-700 ring-slate-500/20",
  },
  cancelled: {
    label: "Đã hủy",
    classes: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

const PRIORITY_STYLES = {
  low: {
    label: "Thấp",
    classes: "bg-slate-100 text-slate-700 ring-slate-500/20",
  },
  medium: {
    label: "Trung bình",
    classes: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  high: {
    label: "Cao",
    classes: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
  urgent: {
    label: "Khẩn cấp",
    classes: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

function Badge({ label, classes }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}

function TicketStatusBadge({ status, label }) {
  const presentation = STATUS_STYLES[status] ?? {
    label: label || status || "Không xác định",
    classes: "bg-slate-100 text-slate-700 ring-slate-500/20",
  };

  return (
    <Badge
      label={label || presentation.label}
      classes={presentation.classes}
    />
  );
}

function TicketPriorityBadge({ priority, label }) {
  const presentation = PRIORITY_STYLES[priority] ?? {
    label: label || priority || "Không xác định",
    classes: "bg-slate-100 text-slate-700 ring-slate-500/20",
  };

  return (
    <Badge
      label={label || presentation.label}
      classes={presentation.classes}
    />
  );
}

export { TicketPriorityBadge, TicketStatusBadge };
