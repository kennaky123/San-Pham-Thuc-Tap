import {
  CalendarDays,
  FolderOpen,
  Mail,
  UserRound,
  Wrench,
} from "lucide-react";
import { formatTicketDateTime } from "../../../utils/ticketPermissions.js";

function MetadataRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
          {children}
        </dd>
      </div>
    </div>
  );
}

function TicketMetadataCard({ ticket }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Thông tin ticket</h2>
      <dl className="mt-5 space-y-5">
        <MetadataRow icon={UserRound} label="Người gửi">
          {ticket.createdBy?.fullName ?? "Không xác định"}
        </MetadataRow>
        {ticket.createdBy?.email ? (
          <MetadataRow icon={Mail} label="Email">
            {ticket.createdBy.email}
          </MetadataRow>
        ) : null}
        <MetadataRow icon={FolderOpen} label="Danh mục">
          {ticket.category?.name ?? "Không xác định"}
        </MetadataRow>
        <MetadataRow icon={Wrench} label="Technician phụ trách">
          {ticket.assignedTo?.fullName ?? "Chưa phân công"}
        </MetadataRow>
        <MetadataRow icon={CalendarDays} label="Ngày tạo">
          <time dateTime={ticket.createdAt}>
            {formatTicketDateTime(ticket.createdAt)}
          </time>
        </MetadataRow>
        {ticket.assignedAt ? (
          <MetadataRow icon={CalendarDays} label="Ngày phân công">
            <time dateTime={ticket.assignedAt}>
              {formatTicketDateTime(ticket.assignedAt)}
            </time>
          </MetadataRow>
        ) : null}
      </dl>
    </section>
  );
}

function TicketDescriptionCard({ ticket }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Mô tả sự cố</h2>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
        {ticket.description}
      </p>

      {ticket.resolution ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-bold text-emerald-900">Cách giải quyết</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-emerald-900/90">
            {ticket.resolution}
          </p>
          {ticket.resolvedAt ? (
            <p className="mt-3 text-xs text-emerald-800">
              Hoàn thành lúc {formatTicketDateTime(ticket.resolvedAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {ticket.status === "cancelled" ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-bold text-red-900">Ticket đã bị hủy</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-red-800">
            {ticket.cancellationReason || "Không có lý do hủy."}
          </p>
          {ticket.cancelledAt ? (
            <p className="mt-3 text-xs text-red-700">
              Hủy lúc {formatTicketDateTime(ticket.cancelledAt)}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { TicketDescriptionCard, TicketMetadataCard };
