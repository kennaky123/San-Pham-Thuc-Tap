import { ExternalLink, ImageOff, LoaderCircle, Paperclip } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    () =>
      `${ticketId}:${attachments.map((attachment) => attachment._id).join(",")}`,
    [attachments, ticketId],
  );
  const [state, setState] = useState({ key: null, items: [] });

  useEffect(() => {
    const abortController = new AbortController();
    const objectUrls = [];

    Promise.all(
      attachments.map(async (attachment) => {
        try {
          const blob = await getTicketAttachmentBlob(ticketId, attachment._id, {
            signal: abortController.signal,
          });
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

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const isLoading = state.key !== attachmentKey;

  return (
    <section className="rounded-xl border border-brand-bone bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xs font-bold tracking-wider text-brand-slate uppercase">
          <Paperclip className="size-4 text-brand-violet" aria-hidden="true" />
          Tệp Đính Kèm & Ảnh Chụp Màn Hình
        </h2>
        <span className="rounded-full bg-brand-mist px-2.5 py-0.5 font-mono text-xs font-semibold text-brand-ink">
          {attachments.length} tệp
        </span>
      </div>

      {isLoading ? (
        <div
          className="mt-4 flex min-h-24 items-center justify-center rounded-xl bg-brand-mist text-xs text-brand-slate"
          role="status"
        >
          <LoaderCircle
            className="mr-2 size-4 animate-spin"
            aria-hidden="true"
          />
          Đang tải tệp đính kèm...
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {state.items.map(({ attachment, url, error }) => (
            <li
              key={attachment._id}
              className="min-w-0 overflow-hidden rounded-xl border border-brand-bone bg-brand-mist/50"
            >
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  aria-label={`Mở ảnh ${attachment.originalName}`}
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-mist">
                    <img
                      src={url}
                      alt={attachment.originalName}
                      className="size-full object-cover transition group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-lg bg-brand-ink/80 text-white">
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-brand-mist px-3 text-center text-brand-ash">
                  <ImageOff className="size-5" aria-hidden="true" />
                  <span className="mt-1 text-[11px]">
                    {error ? "Không tải được ảnh" : "Ảnh không khả dụng"}
                  </span>
                </div>
              )}
              <div className="min-w-0 px-3 py-2">
                <p className="truncate text-xs font-semibold text-brand-ink">
                  {attachment.originalName}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-brand-ash">
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
