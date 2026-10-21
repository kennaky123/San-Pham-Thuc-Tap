import {
  LoaderCircle,
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import { useState } from "react";
import { CANNED_RESPONSES } from "../../../data/itsmData.js";
import { getTicketActionError } from "../../../services/ticketService.js";
import { formatTicketDateTime } from "../../../utils/ticketPermissions.js";

const ROLE_LABELS = {
  user: "Người yêu cầu",
  technician: "Kỹ thuật viên IT",
  admin: "Quản trị viên IT",
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
        "rounded-xl border p-4 shadow-2xs transition-all",
        comment.isInternal
          ? "border-amber-300 bg-amber-50/70"
          : "border-brand-bone bg-white",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
              comment.isInternal ? "bg-amber-600" : "bg-brand-violet",
            ].join(" ")}
            aria-hidden="true"
          >
            {getInitials(comment.sender.fullName)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-brand-ink">
              {comment.sender.fullName}
            </span>
            {comment.isInternal ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                <LockKeyhole className="size-3" aria-hidden="true" />
                Ghi Chú Nội Bộ IT
              </span>
            ) : (
              <span className="rounded bg-brand-violet/10 px-2 py-0.5 text-[10px] font-bold text-brand-violet">
                {ROLE_LABELS[comment.sender.role] ?? "Phản Hồi Công Khai"}
              </span>
            )}
          </div>
        </div>
        <time
          className="font-mono text-xs text-brand-ash"
          dateTime={comment.createdAt}
        >
          {formatTicketDateTime(comment.createdAt)}
        </time>
      </div>
      <p className="pl-9 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-brand-ink">
        {comment.content}
      </p>
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

  async function submitComment() {
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
    } catch (requestError) {
      setSubmitError(getTicketActionError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitComment();
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (!submitting && content.trim().length > 0) {
        submitComment();
      }
    }
  }

  function handleInsertCannedResponse(event) {
    const idx = event.target.value;
    if (idx === "") return;
    const template = CANNED_RESPONSES[Number(idx)];
    if (template) {
      setContent((prev) => (prev ? `${prev}\n${template}` : template));
      setSubmitError(null);
    }
    event.target.value = "";
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare
            className="size-4 text-brand-violet"
            aria-hidden="true"
          />
          <h2 className="font-display text-sm font-bold text-brand-ink">
            Luồng Trao Đổi & Ghi Chú Kỹ Thuật
          </h2>
        </div>
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
        <div className="space-y-3" aria-label="Đang tải trao đổi">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-white/80"
            />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!loading && !error && comments?.comments.length === 0 ? (
        <div className="rounded-xl border border-brand-bone bg-white px-4 py-6 text-center">
          <p className="text-xs font-semibold text-brand-slate">
            Chưa có phản hồi hoặc ghi chú nào trên ticket này.
          </p>
        </div>
      ) : null}

      {!loading && !error && comments?.comments.length > 0 ? (
        <ol className="space-y-3">
          {comments.comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </ol>
      ) : null}

      {/* Reply Composer Box (Matches DeskPro IT View 2) */}
      {canComment ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-brand-bone bg-white p-4 shadow-xs"
        >
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  !isInternal
                    ? "bg-brand-ink text-white"
                    : "text-brand-slate hover:bg-brand-mist"
                }`}
              >
                Phản Hồi Công Khai (Gửi User)
              </button>
              {canCreateInternalNote ? (
                <button
                  type="button"
                  onClick={() => setIsInternal(true)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isInternal
                      ? " border border-amber-300 bg-amber-100 text-amber-900"
                      : "text-brand-slate hover:bg-brand-mist"
                  }`}
                >
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                  Ghi Chú Nội Bộ (Chỉ IT Thấy)
                </button>
              ) : null}
            </div>

            {/* Canned Responses Dropdown */}
            <select
              onChange={handleInsertCannedResponse}
              defaultValue=""
              aria-label="Mẫu câu trả lời nhanh"
              className="rounded-lg border border-brand-bone bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-slate outline-none hover:text-brand-ink"
            >
              <option value="">
                + Mẫu câu trả lời nhanh (Canned Responses)...
              </option>
              <option value="0">Xác nhận đã tiếp nhận & đang kiểm tra</option>
              <option value="1">Yêu cầu cung cấp TeamViewer / UltraViewer</option>
              <option value="2">Thông báo đã reset mật khẩu / quyền AD</option>
              <option value="3">Xác nhận hoàn tất & xin đánh giá CSAT</option>
            </select>
          </div>

          <div
            className={`overflow-hidden rounded-xl border transition-all focus-within:ring-2 ${
              isInternal
                ? "border-amber-300 bg-amber-50/40 focus-within:border-amber-500 focus-within:ring-amber-200"
                : "border-brand-bone bg-brand-mist/50 focus-within:border-brand-violet focus-within:ring-brand-violet/20"
            }`}
          >
            <textarea
              id="ticket-comment"
              value={content}
              maxLength={5000}
              rows={3}
              disabled={submitting}
              onKeyDown={handleKeyDown}
              onChange={(event) => {
                setContent(event.target.value);
                setSubmitError(null);
              }}
              placeholder={
                isInternal
                  ? "Ghi chú kỹ thuật nội bộ (Người yêu cầu sẽ KHÔNG nhìn thấy nội dung này)..."
                  : "Nhập phản hồi cho người yêu cầu (Nhấn Ctrl + Enter để gửi nhanh)..."
              }
              className="w-full resize-none bg-transparent p-3 text-sm text-brand-ink outline-none placeholder:text-brand-ash"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-bone bg-white px-3 py-2">
              <span className="text-[11px] text-brand-ash">
                {content.length}/5000 ký tự • Nhấn{" "}
                <kbd className="rounded bg-brand-mist px-1 py-0.5 font-mono text-[10px] text-brand-slate">
                  Ctrl+Enter
                </kbd>{" "}
                để gửi
              </span>
              <button
                type="submit"
                disabled={submitting || content.trim().length === 0}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInternal
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-brand-violet hover:bg-brand-violet/90"
                }`}
              >
                {submitting ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="size-3.5" aria-hidden="true" />
                )}
                {submitting
                  ? "Đang gửi..."
                  : isInternal
                    ? "Lưu Ghi Chú Nội Bộ"
                    : "Gửi Phản Hồi"}
              </button>
            </div>
          </div>

          {submitError ? (
            <div
              className="mt-2.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
              role="alert"
            >
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
        </form>
      ) : (
        <p className="rounded-xl border border-brand-bone bg-white px-4 py-3 text-xs text-brand-slate">
          Ticket đang ở chế độ chỉ đọc hoặc vai trò của bạn không được gửi bình
          luận.
        </p>
      )}
    </section>
  );
}

export default TicketConversation;
