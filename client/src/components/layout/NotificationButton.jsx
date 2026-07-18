import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
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
        className="relative flex size-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          role="dialog"
          aria-label="Danh sách thông báo"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Thông báo</h2>
          </div>
          <div className="px-5 py-8 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-800">
              Chưa có thông báo
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Dữ liệu thông báo sẽ được kết nối ở module API sau.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationButton;
