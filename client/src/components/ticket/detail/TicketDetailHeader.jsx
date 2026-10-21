import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { getSlaDisplayForTicket } from "../../../data/itsmData.js";
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "../TicketBadges.jsx";

function TicketDetailHeader({ ticket, backPath, refreshing, onRefresh }) {
  const sla = getSlaDisplayForTicket(ticket);

  return (
    <header className="border-b border-brand-bone bg-white px-6 py-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-bone bg-brand-mist px-2.5 py-1 text-xs font-semibold text-brand-ink transition hover:bg-brand-bone lg:hidden"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Danh sách
          </Link>
          <span className="rounded bg-brand-mist px-2 py-0.5 font-mono text-xs font-bold text-brand-slate">
            {ticket.ticketCode}
          </span>
          <TicketPriorityBadge priority={ticket.priority} />
          <span className="rounded bg-brand-mist px-2 py-0.5 text-xs font-medium text-brand-slate">
            {ticket.category?.name ?? "Hạ tầng IT"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-brand-bone bg-brand-mist px-2.5 py-1 font-mono text-xs font-semibold">
            <span className="text-brand-slate">SLA:</span>
            <span className={`h-2 w-2 rounded-full ${sla.dot}`} />
            <span className={sla.color}>{sla.label}</span>
          </div>
          <TicketStatusBadge status={ticket.status} />
          <button
            type="button"
            disabled={refreshing}
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-bone bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-mist disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <h1 className="mt-2.5 font-display text-lg font-extrabold tracking-tight wrap-break-word text-brand-ink sm:text-xl">
        {ticket.title}
      </h1>
    </header>
  );
}

export default TicketDetailHeader;
