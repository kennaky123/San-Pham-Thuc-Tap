import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

function TroubleshootingConfirmationModal({
  categoryName = "Sự cố kỹ thuật",
  guides = [],
  ticketTitle = "",
  isSubmitting = false,
  onClose,
  onSelfResolved,
  onConfirmSendToHelpDesk,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [triedGuides, setTriedGuides] = useState(() => new Set());

  function handleCopyCommand(command, id) {
    if (!command) return;
    navigator.clipboard?.writeText(command);
    setCopiedId(id);
    toast.info(`Đã sao chép: ${command}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleTried(guideId) {
    setTriedGuides((prev) => {
      const next = new Set(prev);
      if (next.has(guideId)) next.delete(guideId);
      else next.add(guideId);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-brand-bone shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-brand-bone bg-brand-mist/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-brand-violet ring-4 ring-purple-50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-brand-violet uppercase tracking-wider">
                  Trợ Lý Tự Phục Vụ (Self-Service)
                </span>
                <span className="text-xs font-semibold text-brand-slate">
                  • Danh mục: <strong className="text-brand-onyx">{categoryName}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-brand-onyx mt-0.5">
                Các Cách Khắc Phục Nhanh Thông Dụng Trước Khi Gửi Ticket
              </h2>
              <p className="text-xs text-brand-slate mt-0.5">
                Rất nhiều nhân viên đã tự xử lý thành công trong 1-2 phút với các bước dưới đây.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guides Scroll Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-900">
            <Lightbulb className="w-4 h-4 shrink-0 text-blue-600" />
            <span>
              Sự cố bạn đang gặp: <strong className="font-semibold">&quot;{ticketTitle || "Yêu cầu hỗ trợ"}&quot;</strong>.
              Hãy thử làm theo hướng dẫn dưới đây trước khi gửi lên IT Help Desk:
            </span>
          </div>

          <div className="space-y-4">
            {guides.map((guide, idx) => {
              const isTried = triedGuides.has(guide.id);

              return (
                <div
                  key={guide.id || idx}
                  className={`rounded-xl border transition-all ${
                    isTried
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-brand-bone bg-white hover:border-brand-violet/30"
                  } p-4 shadow-2xs`}
                >
                  {/* Guide Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 font-bold text-xs text-brand-violet">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-brand-onyx">
                        {guide.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-slate bg-brand-mist px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-brand-ash" />
                        {guide.timeToFix}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTried(guide.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                          isTried
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-white text-brand-slate border-brand-bone hover:bg-brand-mist"
                        }`}
                      >
                        {isTried ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Đã thử cách này
                          </>
                        ) : (
                          "+ Đánh dấu đã thử"
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-brand-slate mb-3 pl-8">
                    {guide.summary}
                  </p>

                  {/* Steps List */}
                  <div className="pl-8 space-y-2.5 border-t border-brand-bone/60 pt-3">
                    {guide.steps?.map((step) => (
                      <div key={step.stepNumber} className="text-xs space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-brand-violet shrink-0">
                            Bước {step.stepNumber}:
                          </span>
                          <span className="text-brand-ink font-medium">
                            {step.title}
                          </span>
                        </div>
                        <p className="text-brand-slate pl-5 leading-relaxed">
                          {step.detail}
                        </p>

                        {step.command && (
                          <div className="pl-5 pt-1">
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-brand-onyx px-3 py-1.5 text-xs text-brand-mist font-mono">
                              <span className="truncate">{step.command}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCommand(step.command, `${guide.id}-${step.stepNumber}`)}
                                title="Sao chép lệnh"
                                className="inline-flex items-center gap-1 text-[10px] text-brand-slate hover:text-white shrink-0 transition-colors"
                              >
                                {copiedId === `${guide.id}-${step.stepNumber}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao chép</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Confirmation Actions */}
        <div className="p-5 border-t border-brand-bone bg-brand-mist/40 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <div className="text-xs font-bold text-brand-onyx">
                Sự cố của bạn đã được giải quyết chưa?
              </div>
              <div className="text-[11px] text-brand-slate">
                Nếu đã sửa được, bạn không cần phải chờ đợi IT tiếp nhận xử lý.
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
              {/* Option 1: Resolved via Self-Service */}
              <button
                type="button"
                onClick={onSelfResolved}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Đã Sửa Được (Xong)
              </button>

              {/* Option 2: Still not resolved -> Submit to Help Desk */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmSendToHelpDesk}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-2xs"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Đang gửi..." : "Vẫn Không Được, Gửi IT Helpdesk"}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-brand-slate hover:text-brand-ink underline"
            >
              Quay lại chỉnh sửa biểu mẫu yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TroubleshootingConfirmationModal;
