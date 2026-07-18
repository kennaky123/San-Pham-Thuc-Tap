import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import MobileSidebar from "../components/layout/MobileSidebar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { getNavigationItemByPath } from "../constants/navigation.js";
import useAuth from "../hooks/useAuth.js";

const SPECIAL_PAGE_TITLES = {
  "/profile": "Hồ sơ cá nhân",
  "/unauthorized": "Không có quyền truy cập",
};

function getSpecialPageTitle(pathname) {
  if (/^\/(?:admin|user|technician)\/tickets\/[^/]+$/.test(pathname)) {
    return pathname.startsWith("/user/")
      ? "Chi tiết yêu cầu"
      : "Chi tiết ticket";
  }

  return SPECIAL_PAGE_TITLES[pathname];
}

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const mainContentRef = useRef(null);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    const navigationItem = getNavigationItemByPath(user?.role, pathname);
    const pageTitle =
      navigationItem?.label ??
      getSpecialPageTitle(pathname) ??
      "Không tìm thấy trang";

    document.title = `${pageTitle} | IT Helpdesk`;
    mainContentRef.current?.focus({ preventScroll: true });
  }, [pathname, user?.role]);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 motion-reduce:transition-none"
      >
        Chuyển đến nội dung chính
      </a>

      <Sidebar />
      <MobileSidebar open={mobileMenuOpen} onClose={closeMobileMenu} />

      <div className="min-w-0 lg:pl-64" data-app-shell-content>
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onOpenMobileMenu={openMobileMenu}
        />
        <main
          ref={mainContentRef}
          id="main-content"
          tabIndex={-1}
          className="min-h-[calc(100vh-4rem)] p-4 outline-none sm:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
