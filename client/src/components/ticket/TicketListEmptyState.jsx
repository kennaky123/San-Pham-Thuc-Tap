import { Inbox, RotateCcw } from "lucide-react";

function TicketListEmptyState({ hasActiveFilters, onReset }) {
  return (
    <section className="flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="max-w-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Inbox className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-slate-900">
          {hasActiveFilters ? "Không tìm thấy ticket phù hợp" : "Chưa có ticket nào"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {hasActiveFilters
            ? "Hãy thay đổi từ khóa hoặc xóa bớt bộ lọc để xem kết quả khác."
            : "Các yêu cầu hỗ trợ mới sẽ xuất hiện tại đây sau khi được tạo."}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Xóa bộ lọc
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default TicketListEmptyState;
