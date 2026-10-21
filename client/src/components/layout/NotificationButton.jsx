import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import useClickOutside from "../../hooks/useClickOutside.js";

function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const closePopover = useCallback(() => setIsOpen(false), []);

  useClickOutside(containerRef, closePopover, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative flex size-8 items-center justify-center rounded-full bg-brand-mist border border-brand-bone text-brand-slate transition hover:bg-brand-bone/60 hover:text-brand-ink"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="size-3.5" aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand-violet ring-2 ring-white" />
      </button>

      {isOpen ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-brand-bone bg-white shadow-xl shadow-black/10 overflow-hidden"
          role="dialog"
          aria-label="Danh sách thông báo"
        >
          <div className="border-b border-brand-bone bg-brand-mist/60 px-4 py-3 flex items-center justify-between">
            <h2 className="text-xs font-display font-bold text-brand-onyx uppercase tracking-wider">
              Thông báo AIOps & SLA
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-brand-violet font-semibold">
              Trực tuyến
            </span>
          </div>
          <div className="divide-y divide-brand-bone text-xs">
            <div className="p-3.5 hover:bg-brand-mist/50 flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="font-semibold text-brand-onyx">
                  Cảnh báo tải Switch Tầng 3 (91% CPU)
                </p>
                <p className="text-[11px] text-brand-slate mt-0.5">
                  AIOps phát hiện tương quan sự cố trên VLAN 30 (192.168.30.1).
                </p>
              </div>
            </div>
            <div className="p-3.5 hover:bg-brand-mist/50 flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="font-semibold text-brand-onyx">
                  Đồng bộ Star Schema DW hoàn tất
                </p>
                <p className="text-[11px] text-brand-slate mt-0.5">
                  Dữ liệu vận hành ITSM BI đang được cập nhật theo thời gian thực.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationButton;
