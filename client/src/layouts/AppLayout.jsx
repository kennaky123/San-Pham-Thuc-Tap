import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CommandMenuModal from "../components/layout/CommandMenuModal.jsx";
import Header from "../components/layout/Header.jsx";
import MobileSidebar from "../components/layout/MobileSidebar.jsx";
import { getNavigationItemByPath } from "../constants/navigation.js";
import useAuth from "../hooks/useAuth.js";
import useRealtimeUpdates from "../hooks/useRealtimeUpdates.js";

const SPECIAL_PAGE_TITLES = {
  "/profile": "Hồ sơ cá nhân",
  "/topology": "Mô Hình Mạng (Topology)",
  "/unauthorized": "Không có quyền truy cập",
};

function getSpecialPageTitle(pathname) {
  if (/^\/(?:admin|user|technician)\/tickets\/[^/]+$/.test(pathname)) {
    return pathname.startsWith("/user/")
      ? "Chi tiết yêu cầu"
      : "Chi tiết ticket (3 Cột)";
  }

  return SPECIAL_PAGE_TITLES[pathname];
}

function isFullBleedWorkspace(pathname) {
  if (pathname === "/topology" || pathname === "/user/overview") {
    return true;
  }
  if (
    pathname === "/admin/tickets" ||
    pathname === "/technician/tickets/all" ||
    pathname === "/technician/tickets/assigned" ||
    pathname === "/technician/tickets/in-progress" ||
    pathname === "/technician/history" ||
    pathname === "/user/tickets"
  ) {
    return true;
  }
  if (
    /^\/(?:admin|user|technician)\/tickets\/[^/]+$/.test(pathname) &&
    pathname !== "/user/tickets/new"
  ) {
    return true;
  }
  return false;
}

function AppLayout() {
  useRealtimeUpdates();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const mainContentRef = useRef(null);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const openCommandMenu = useCallback(() => setCommandMenuOpen(true), []);
  const closeCommandMenu = useCallback(() => setCommandMenuOpen(false), []);

  useEffect(() => {
    const navigationItem = getNavigationItemByPath(user?.role, pathname);
    const pageTitle =
      navigationItem?.label ??
      getSpecialPageTitle(pathname) ??
      "Không tìm thấy trang";

    document.title = `${pageTitle} | DeskPro IT`;
    mainContentRef.current?.focus({ preventScroll: true });
  }, [pathname, user?.role]);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      } else if (event.key === "Escape") {
        setCommandMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fullBleed = isFullBleedWorkspace(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-brand-mist text-brand-ink">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-brand-violet px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Chuyển đến nội dung chính
      </a>

      <MobileSidebar open={mobileMenuOpen} onClose={closeMobileMenu} />
      <CommandMenuModal open={commandMenuOpen} onClose={closeCommandMenu} />

      <div className="flex-1 flex flex-col min-w-0" data-app-shell-content>
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onOpenMobileMenu={openMobileMenu}
          onOpenCommandMenu={openCommandMenu}
        />
        <main
          ref={mainContentRef}
          id="main-content"
          tabIndex={-1}
          className={
            fullBleed
              ? "flex-1 flex flex-col min-h-[calc(100vh-3.5rem)] outline-none"
              : "flex-1 min-h-[calc(100vh-3.5rem)] p-4 outline-none sm:p-6"
          }
        >
          {fullBleed ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-screen-2xl">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
