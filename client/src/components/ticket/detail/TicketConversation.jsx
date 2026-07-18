import { useState } from "react";
import {
  LoaderCircle,
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import { getTicketActionError } from "../../../services/ticketService.js";
import { formatTicketDateTime } from "../../../utils/ticketPermissions.js";

const ROLE_LABELS = {
  user: "Người dùng",
  technician: "Kỹ thuật viên",
  admin: "Quản trị viên",
};

function getInitials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CommentItem({ comment }) {
  return (
    <li
      className={[
        "rounded-xl border p-4",
        comment.isInternal
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            comment.isInternal
              ? "bg-amber-200 text-amber-900"
              : "bg-blue-100 text-blue-800",
          ].join(" ")}
          aria-hidden="true"
        >
          {getInitials(comment.sender.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-bold text-slate-900">
              {comment.sender.fullName}
            </p>
            <span className="text-xs text-slate-500">
              {ROLE_LABELS[comment.sender.role] ?? "Thành viên"}
            </span>
            {comment.isInternal ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-semibold text-amber-900">
                <LockKeyhole className="size-3" aria-hidden="true" />
                Ghi chú nội bộ
              </span>
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {comment.content}
          </p>
          <time className="mt-2 block text-xs text-slate-500" dateTime={comment.createdAt}>
            {formatTicketDateTime(comment.createdAt)}
          </time>
        </div>
      </div>
    </li>
  );
}

function TicketConversation({
  comments,
  error,
  loading,
  canComment,
  canCreateInternalNote,
  onRetry,
  onSubmit,
}) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedContent = content.trim();

    if (!normalizedContent || normalizedContent.length > 5000) {
      setSubmitError({
        message: "Nội dung trao đổi phải có từ 1 đến 5000 ký tự.",
        details: [],
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(normalizedContent, isInternal);
      setContent("");
      setIsInternal(false);
    } catch (requestError) {
      setSubmitError(getTicketActionError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <MessageSquare className="size-5 text-slate-500" aria-hidden="true" />
            Trao đổi
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Bình luận công khai và ghi chú xử lý liên quan đến ticket.
          </p>
        </div>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3" aria-label="Đang tải trao đổi">
          {[1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <p className="mt-5 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && comments?.comments.length === 0 ? (
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center">
          <MessageSquare className="mx-auto size-6 text-slate-400" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có trao đổi</p>
          <p className="mt-1 text-xs text-slate-500">Hãy gửi bình luận đầu tiên cho ticket này.</p>
        </div>
      ) : null}

      {!loading && !error && comments?.comments.length > 0 ? (
        <>
          {comments.pagination.hasNextPage ? (
            <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Đang hiển thị 100 trao đổi mới nhất.
            </p>
          ) : null}
          <ol className="mt-5 space-y-3">
            {comments.comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </ol>
        </>
      ) : null}

      {canComment ? (
        <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-200 pt-5">
          <label htmlFor="ticket-comment" className="text-sm font-semibold text-slate-800">
            Nội dung trao đổi
          </label>
          <textarea
            id="ticket-comment"
            value={content}
            maxLength={5000}
            rows={4}
            disabled={submitting}
            onChange={(event) => {
              setContent(event.target.value);
              setSubmitError(null);
            }}
            placeholder={
              isInternal
                ? "Nhập ghi chú chỉ kỹ thuật viên và Admin nhìn thấy..."
                : "Nhập nội dung trao đổi với người liên quan..."
            }
            className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100 sm:text-sm"
          />
          <div className="mt-1.5 flex justify-end text-xs text-slate-500">
            {content.length}/5000
          </div>

          {canCreateInternalNote ? (
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={isInternal}
                disabled={submitting}
                onChange={(event) => setIsInternal(event.target.checked)}
                className="size-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
              Gửi dưới dạng ghi chú nội bộ
            </label>
          ) : null}

          {submitError ? (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              <p>{submitError.message}</p>
              {submitError.details.length > 0 ? (
                <ul className="mt-1 list-disc pl-5">
                  {submitError.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting || content.trim().length === 0}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {submitting ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {submitting
                ? "Đang gửi..."
                : isInternal
                  ? "Lưu ghi chú nội bộ"
                  : "Gửi bình luận"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-6 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
          Ticket đang ở chế độ chỉ đọc hoặc vai trò của bạn không được gửi bình luận.
        </p>
      )}
    </section>
  );
}

export default TicketConversation;
