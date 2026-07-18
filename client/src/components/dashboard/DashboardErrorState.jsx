import { RefreshCw, TriangleAlert } from "lucide-react";

function DashboardErrorState({ message, onRetry }) {
  return (
    <section
      className="flex min-h-96 items-center justify-center rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm"
      role="alert"
      aria-labelledby="dashboard-error-title"
    >
      <div className="max-w-md">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <h2
          id="dashboard-error-title"
          className="mt-5 text-lg font-semibold text-slate-900"
        >
          Không thể tải dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Thử lại
        </button>
      </div>
    </section>
  );
}

export default DashboardErrorState;
