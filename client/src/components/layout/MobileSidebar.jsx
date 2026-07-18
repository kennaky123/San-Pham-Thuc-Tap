import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SidebarContent } from "./Sidebar.jsx";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function MobileSidebar({ open, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previouslyFocusedElement = document.activeElement;
    const pageContent = document.querySelector("[data-app-shell-content]");
    const previousOverflow = document.body.style.overflow;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    document.body.style.overflow = "hidden";
    pageContent?.setAttribute("inert", "");

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
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
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleDesktopViewport(event) {
      if (event.matches) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleDesktopViewport);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleDesktopViewport);
      document.body.style.overflow = previousOverflow;
      pageContent?.removeAttribute("inert");

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Đóng menu điều hướng"
      />
      <aside
        ref={dialogRef}
        id="mobile-sidebar"
        className="relative h-full w-[min(20rem,88vw)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-sidebar-title"
      >
        <h2 id="mobile-sidebar-title" className="sr-only">
          Menu điều hướng
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-label="Đóng menu"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}

export default MobileSidebar;
