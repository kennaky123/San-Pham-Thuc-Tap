import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  noteLabel,
  notePlaceholder,
  submitting,
  error,
  onCancel,
  onConfirm,
}) {
  const [note, setNote] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const cancelHandlerRef = useRef(onCancel);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    cancelHandlerRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const appRoot = document.getElementById("root");
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    document.body.style.overflow = "hidden";
    appRoot?.setAttribute("inert", "");

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submittingRef.current) {
        event.preventDefault();
        cancelHandlerRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute("inert");

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[1px]"
        onClick={submitting ? undefined : onCancel}
        aria-label="Đóng hộp thoại xác nhận"
      />
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start gap-4 border-b border-slate-200 p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1.5 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(note.trim());
          }}
        >
          <div className="p-5 sm:p-6">
            {noteLabel ? (
              <div>
                <label htmlFor="confirm-action-note" className="text-sm font-semibold text-slate-800">
                  {noteLabel}
                </label>
                <textarea
                  id="confirm-action-note"
                  value={note}
                  maxLength={500}
                  rows={4}
                  disabled={submitting}
                  placeholder={notePlaceholder}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100 sm:text-sm"
                />
                <p className="mt-1.5 text-right text-xs text-slate-500">
                  {note.length}/500
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
                <p>{error.message}</p>
                {error.details?.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5">
                    {error.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              ref={cancelButtonRef}
              type="button"
              disabled={submitting}
              onClick={onCancel}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-red-400"
            >
              {submitting ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : null}
              {submitting ? "Đang xử lý..." : confirmLabel}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default ConfirmActionModal;
