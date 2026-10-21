const STATUS_STYLES = {
  pending: {
    label: "Mới Tiếp Nhận",
    classes:
      "bg-brand-mist text-brand-blue border border-brand-blue/30 font-semibold",
  },
  assigned: {
    label: "Đã Phân Công",
    classes: "bg-blue-50 text-brand-blue border border-blue-200 font-semibold",
  },
  in_progress: {
    label: "Đang Xử Lý",
    classes:
      "bg-purple-50 text-brand-violet border border-purple-200 font-semibold",
  },
  waiting_user: {
    label: "Chờ User",
    classes:
      "bg-brand-mist text-brand-slate border border-dashed border-brand-ash font-medium",
  },
  resolved: {
    label: "Đã Xong",
    classes:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
  },
  closed: {
    label: "Đã Đóng",
    classes:
      "bg-slate-100 text-slate-700 border border-slate-200 font-semibold",
  },
  cancelled: {
    label: "Đã Hủy",
    classes: "bg-red-50 text-red-700 border border-red-200 font-semibold",
  },
};

const PRIORITY_STYLES = {
  urgent: {
    label: "P1 - Khẩn Cấp",
    classes: "bg-red-100 text-red-700 border border-red-200 font-semibold",
    dot: "w-1.5 h-1.5 rounded-full bg-red-600 pulse-sla",
  },
  high: {
    label: "P2 - Cao",
    classes:
      "bg-orange-100 text-orange-700 border border-orange-200 font-semibold",
    dot: "w-1.5 h-1.5 rounded-full bg-orange-600",
  },
  medium: {
    label: "P3 - Vừa",
    classes:
      "bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium",
    dot: null,
  },
  low: {
    label: "P4 - Thấp",
    classes: "bg-slate-100 text-slate-600 border border-slate-200 font-medium",
    dot: null,
  },
};

function TicketStatusBadge({ status, label }) {
  const presentation = STATUS_STYLES[status] ?? {
    label: label || status || "Không xác định",
    classes: "bg-brand-mist text-brand-slate border border-brand-bone font-medium",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] ${presentation.classes}`}
    >
      {label || presentation.label}
    </span>
  );
}

function TicketPriorityBadge({ priority, label }) {
  const presentation = PRIORITY_STYLES[priority] ?? {
    label: label || priority || "Không xác định",
    classes: "bg-slate-100 text-slate-600 border border-slate-200 font-medium",
    dot: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] ${presentation.classes}`}
    >
      {presentation.dot ? (
        <span className={presentation.dot} aria-hidden="true" />
      ) : null}
      {label || presentation.label}
    </span>
  );
}

export { TicketPriorityBadge, TicketStatusBadge };
