import { useEffect, useMemo, useState } from "react";
import { ExternalLink, ImageOff, LoaderCircle, Paperclip } from "lucide-react";
import { getTicketAttachmentBlob } from "../../../services/ticketService.js";

function formatFileSize(sizeBytes) {
  if (!Number.isFinite(sizeBytes)) {
    return "";
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TicketAttachmentGallery({ ticketId, attachments }) {
  const attachmentKey = useMemo(
    () => `${ticketId}:${attachments.map((attachment) => attachment._id).join(",")}`,
    [attachments, ticketId],
  );
  const [state, setState] = useState({ key: null, items: [] });

  useEffect(() => {
    const abortController = new AbortController();
    const objectUrls = [];

    Promise.all(
      attachments.map(async (attachment) => {
        try {
          const blob = await getTicketAttachmentBlob(
            ticketId,
            attachment._id,
            { signal: abortController.signal },
          );
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          return { attachment, url, error: false };
        } catch (error) {
          return {
            attachment,
            url: null,
            error: error.code !== "ERR_CANCELED",
          };
        }
      }),
    ).then((items) => {
      if (!abortController.signal.aborted) {
        setState({ key: attachmentKey, items });
      }
    });

    return () => {
      abortController.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachmentKey, attachments, ticketId]);

  if (attachments.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Paperclip className="size-5 text-slate-500" aria-hidden="true" />
          Hình ảnh đính kèm
        </h2>
        <p className="mt-4 text-sm text-slate-500">Ticket này không có ảnh đính kèm.</p>
      </section>
    );
  }

  const isLoading = state.key !== attachmentKey;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Paperclip className="size-5 text-slate-500" aria-hidden="true" />
          Hình ảnh đính kèm
        </h2>
        <span className="text-xs font-medium text-slate-500">
          {attachments.length} ảnh
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 flex min-h-32 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500" role="status">
          <LoaderCircle className="mr-2 size-5 animate-spin" aria-hidden="true" />
          Đang tải ảnh...
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {state.items.map(({ attachment, url, error }) => (
            <li key={attachment._id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
                  aria-label={`Mở ảnh ${attachment.originalName}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={url}
                      alt={attachment.originalName}
                      className="size-full object-cover transition group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-lg bg-slate-950/70 text-white">
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center bg-slate-100 px-3 text-center text-slate-500">
                  <ImageOff className="size-6" aria-hidden="true" />
                  <span className="mt-2 text-xs">
                    {error ? "Không tải được ảnh" : "Ảnh không khả dụng"}
                  </span>
                </div>
              )}
              <div className="min-w-0 px-3 py-2.5">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {attachment.originalName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatFileSize(attachment.sizeBytes)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TicketAttachmentGallery;
