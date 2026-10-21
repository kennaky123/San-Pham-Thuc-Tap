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
        <p className="text-xs font-bold text-brand-ink">
          {item.fromTechnician
            ? "Điều phối lại kỹ thuật viên"
            : "Phân công kỹ thuật viên"}
        </p>
        <p className="mt-0.5 text-xs text-brand-slate">
          {item.fromTechnician ? (
            <>
              {getPersonName(item.fromTechnician, "Chưa phân công")}
              <ArrowRight
                className="mx-1 inline size-3"
                aria-hidden="true"
              />
            </>
          ) : null}
          <span className="font-semibold text-brand-violet">
            {getPersonName(item.toTechnician, "Không xác định")}
          </span>
        </p>
        {item.reason ? (
          <p className="mt-1.5 rounded-lg bg-brand-mist px-2.5 py-1.5 text-xs text-brand-slate">
            {item.reason}
          </p>
        ) : null}
        <p className="mt-1 font-mono text-[11px] text-brand-ash">
          Bởi {getPersonName(item.assignedBy)} •{" "}
          {formatTicketDateTime(item.occurredAt)}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-xs font-bold text-brand-ink">Chuyển trạng thái SLA</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-brand-slate">
        {item.fromStatus ? (
          <>
            <span>{getTicketStatusLabel(item.fromStatus)}</span>
            <ArrowRight className="size-3" aria-hidden="true" />
          </>
        ) : null}
        <span className="font-semibold text-brand-violet">
          {getTicketStatusLabel(item.toStatus)}
        </span>
      </p>
      {item.note ? (
        <p className="mt-1.5 rounded-lg bg-brand-mist px-2.5 py-1.5 text-xs whitespace-pre-wrap wrap-break-word text-brand-slate">
          {item.note}
        </p>
      ) : null}
      <p className="mt-1 font-mono text-[11px] text-brand-ash">
        Bởi {getPersonName(item.changedBy)} •{" "}
        {formatTicketDateTime(item.occurredAt)}
      </p>
    </>
  );
}

function TicketHistoryTimeline({ history, error, loading, onRetry }) {
  if (!loading && !error && (!history || history.length === 0)) {
    return null;
  }

  return (
    <section className="rounded-xl border border-brand-bone bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-wider text-brand-slate uppercase">
          <Clock3 className="size-4 text-brand-violet" aria-hidden="true" />
          Nhật Ký Hệ Thống (Audit Trail)
        </h2>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-violet hover:bg-brand-violet/10"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Thử lại
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" aria-label="Đang tải lịch sử">
          {[1, 2].map((item) => (
            <div key={item} className="flex animate-pulse gap-3">
              <div className="size-7 shrink-0 rounded-full bg-brand-bone" />
              <div className="flex-1 space-y-1.5 py-1">
                <div className="h-3 w-36 rounded bg-brand-bone" />
                <div className="h-2.5 w-full rounded bg-brand-mist" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!loading && !error && history?.length > 0 ? (
        <ol className="mt-4 space-y-0">
          {history.map((item, index) => (
            <li key={item._id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < history.length - 1 ? (
                <span
                  className="absolute top-7 bottom-0 left-3.5 w-px bg-brand-bone"
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet ring-4 ring-white">
                {item.type === "assignment" ? (
                  <UserRoundCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock3 className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
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
