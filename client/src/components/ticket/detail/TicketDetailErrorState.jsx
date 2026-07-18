import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

function TicketDetailErrorState({ message, backPath, onRetry }) {
  return (
    <section className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-900">
        Không thể tải chi tiết ticket
      </h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {message}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to={backPath}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Thử lại
        </button>
      </div>
    </section>
  );
}

export default TicketDetailErrorState;
