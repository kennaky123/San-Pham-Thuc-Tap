import { Columns3, Menu, Plus, Search } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getNavigationForRole } from "../../constants/navigation.js";
import { getDefaultPathForRole } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";
import NotificationButton from "./NotificationButton.jsx";
import UserDropdown from "./UserDropdown.jsx";

function Header({ mobileMenuOpen, onOpenMobileMenu, onOpenCommandMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const homePath = getDefaultPathForRole(user?.role);
  const navigationItems = getNavigationForRole(user?.role);
  const isTicketDetail =
    /^\/(?:admin|user|technician)\/tickets\/[^/]+$/.test(location.pathname) &&
    location.pathname !== "/user/tickets/new" &&
    location.pathname !== "/technician/tickets/assigned" &&
    location.pathname !== "/technician/tickets/in-progress";

  const primaryActionPath =
    user?.role === "user"
      ? "/user/tickets/new"
      : user?.role === "technician"
        ? "/technician/tickets/assigned"
        : "/admin/tickets";
  const primaryActionLabel =
    user?.role === "user" ? "Tạo Ticket Mới" : "Xử Lý Sự Cố";

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-brand-bone px-4 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-slate transition hover:bg-brand-mist hover:text-brand-ink lg:hidden"
          aria-label="Mở menu điều hướng"
          aria-controls="mobile-sidebar"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        {/* App Brand & Identity */}
        <Link
          to={homePath}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-violet flex items-center justify-center text-white shadow-xs font-display font-extrabold text-base tracking-tight">
            IT
          </div>
          <div className="flex items-center">
            <span className="font-display font-bold text-brand-onyx tracking-tight text-base leading-none">
              DeskPro
            </span>
            <span className="text-[10px] font-mono text-brand-ash ml-1.5 px-1.5 py-0.5 bg-brand-mist rounded border border-brand-bone">
              AIOps v3.0
            </span>
          </div>
        </Link>

        {/* Navigation Pill Tabs */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden lg:flex items-center gap-0.5 bg-brand-mist p-1 rounded-full border border-brand-bone text-xs font-medium overflow-x-auto"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap",
                    isActive
                      ? "bg-white text-brand-ink font-semibold shadow-xs"
                      : "text-brand-slate hover:text-brand-ink",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive
                          ? item.iconColor || "text-brand-violet"
                          : "text-brand-slate"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                    {item.alertDot ? (
                      <span
                        className="w-2 h-2 rounded-full bg-red-500 animate-ping"
                        title="1 node cảnh báo"
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}

          {isTicketDetail ? (
            <span className="px-3 py-1.5 rounded-full bg-white text-brand-ink font-semibold shadow-xs flex items-center gap-1.5 whitespace-nowrap">
              <Columns3 className="w-3.5 h-3.5 text-brand-violet" />
              <span>Chi Tiết (3 Cột)</span>
            </span>
          ) : null}
        </nav>
      </div>

      {/* Center Search Trigger */}
      <div className="hidden xl:flex items-center">
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-brand-mist hover:bg-brand-bone/60 border border-brand-bone rounded-full text-xs text-brand-slate transition-all w-64 2xl:w-72"
        >
          <Search className="w-3.5 h-3.5 text-brand-ash shrink-0" />
          <span className="truncate">
            Tìm ticket, IP, switch port, asset...
          </span>
          <kbd className="ml-auto font-mono text-[10px] bg-white border border-brand-bone px-1.5 py-0.5 rounded text-brand-ash">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="flex xl:hidden size-8 items-center justify-center rounded-full bg-brand-mist border border-brand-bone text-brand-slate hover:text-brand-ink"
          aria-label="Tìm kiếm nhanh"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <Link
          to={primaryActionPath}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-ink hover:bg-brand-carbon text-white rounded-full text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{primaryActionLabel}</span>
        </Link>

        <NotificationButton />

        <div className="h-5 w-px bg-brand-bone" aria-hidden="true" />

        <UserDropdown />
      </div>
    </header>
  );
}

export default Header;
