import { ChevronRight, House } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  getNavigationForRole,
  getNavigationItemByPath,
} from "../../constants/navigation.js";
import { getDefaultPathForRole } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";

const SPECIAL_PAGE_LABELS = {
  "/profile": "Hồ sơ cá nhân",
  "/unauthorized": "Không có quyền truy cập",
};

function getSpecialPageLabel(pathname) {
  if (/^\/(?:admin|user|technician)\/tickets\/[^/]+$/.test(pathname)) {
    return pathname.startsWith("/user/")
      ? "Chi tiết yêu cầu"
      : "Chi tiết ticket";
  }

  return SPECIAL_PAGE_LABELS[pathname];
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const homePath = getDefaultPathForRole(user?.role);
  const navigationItems = getNavigationForRole(user?.role);
  const homeItem = navigationItems.find((item) => item.path === homePath);
  const currentItem = getNavigationItemByPath(user?.role, pathname);
  const homeLabel = homeItem?.label ?? "Tổng quan";
  const currentLabel =
    currentItem?.label ?? getSpecialPageLabel(pathname) ?? "Không tìm thấy trang";
  const isHomePage = pathname === homePath;

  return (
    <nav className="min-w-0" aria-label="Điều hướng phân cấp">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="min-w-0">
          {isHomePage ? (
            <span
              className="flex min-w-0 items-center gap-2 font-medium text-slate-700"
              aria-current="page"
            >
              <House className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{homeLabel}</span>
            </span>
          ) : (
            <Link
              to={homePath}
              className="flex items-center gap-2 text-slate-500 transition hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <House className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{homeLabel}</span>
            </Link>
          )}
        </li>
        {!isHomePage ? (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </li>
            <li className="min-w-0" aria-current="page">
              <span className="block truncate font-medium text-slate-700">
                {currentLabel}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
