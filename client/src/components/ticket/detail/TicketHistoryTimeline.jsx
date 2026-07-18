import { ArrowRight, Clock3, RefreshCw, UserRoundCheck } from "lucide-react";
import {
  formatTicketDateTime,
  getTicketStatusLabel,
} from "../../../utils/ticketPermissions.js";

function getPersonName(person, fallback = "Hệ thống") {
  return person?.fullName ?? fallback;
}

function HistoryItemContent({ item }) {
  if (item.type === "assignment") {
    return (
      <>
        <p className="text-sm font-semibold text-slate-800">
          {item.fromTechnician ? "Phân công lại technician" : "Phân công technician"}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {item.fromTechnician ? (
            <>
              {getPersonName(item.fromTechnician, "Chưa phân công")}
              <ArrowRight className="mx-1.5 inline size-3.5" aria-hidden="true" />
            </>
          ) : null}
          <span className="font-semibold text-slate-800">
            {getPersonName(item.toTechnician, "Không xác định")}
          </span>
        </p>
        {item.reason ? (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
            {item.reason}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
          Bởi {getPersonName(item.assignedBy)} · {formatTicketDateTime(item.occurredAt)}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-semibold text-slate-800">Cập nhật trạng thái</p>
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
        {item.fromStatus ? (
          <>
            <span>{getTicketStatusLabel(item.fromStatus)}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </>
        ) : null}
        <span className="font-semibold text-slate-800">
          {getTicketStatusLabel(item.toStatus)}
        </span>
      </p>
      {item.note ? (
        <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          {item.note}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Bởi {getPersonName(item.changedBy)} · {formatTicketDateTime(item.occurredAt)}
      </p>
    </>
  );
}

function TicketHistoryTimeline({ history, error, loading, onRetry }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Clock3 className="size-5 text-slate-500" aria-hidden="true" />
          Lịch sử xử lý
        </h2>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 space-y-4" aria-label="Đang tải lịch sử">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex animate-pulse gap-3">
              <div className="size-9 shrink-0 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && history?.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Chưa có lịch sử xử lý.</p>
      ) : null}

      {!loading && !error && history?.length > 0 ? (
        <ol className="mt-5 space-y-0">
          {history.map((item, index) => (
            <li key={item._id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < history.length - 1 ? (
                <span className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-slate-200" aria-hidden="true" />
              ) : null}
              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-4 ring-white">
                {item.type === "assignment" ? (
                  <UserRoundCheck className="size-4" aria-hidden="true" />
                ) : (
                  <Clock3 className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <HistoryItemContent item={item} />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

export default TicketHistoryTimeline;
