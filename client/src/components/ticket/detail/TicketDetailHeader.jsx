import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "../TicketBadges.jsx";

function TicketDetailHeader({ ticket, backPath, refreshing, onRefresh }) {
  return (
    <header>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={backPath}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
        <button
          type="button"
          disabled={refreshing}
          onClick={onRefresh}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {refreshing ? "Đang làm mới..." : "Làm mới"}
        </button>
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold tracking-wide text-blue-700">
          {ticket.ticketCode}
        </p>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {ticket.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>
    </header>
  );
}

export default TicketDetailHeader;
