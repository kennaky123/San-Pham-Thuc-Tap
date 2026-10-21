import { NavLink, useLocation } from "react-router-dom";
import { getNavigationForRole } from "../../constants/navigation.js";
import { getRoleLabel } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";

function SidebarContent({ onNavigate }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigationItems = getNavigationForRole(user?.role);

  function isItemActive(item, routerIsActive) {
    if (routerIsActive) return true;
    if (user?.role === "user" && item.path === "/user/tickets") {
      return /^\/user\/tickets\/[^/]+$/.test(location.pathname);
    }
    if (
      user?.role === "technician" &&
      /^\/technician\/tickets\/[^/]+$/.test(location.pathname)
    ) {
      return location.state?.navigationPath === item.path;
    }
    return false;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white border-r border-brand-bone text-brand-ink">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-brand-bone px-5">
        <div className="w-8 h-8 rounded-lg bg-brand-violet flex items-center justify-center text-white shadow-xs font-display font-extrabold text-base tracking-tight">
          IT
        </div>
        <div className="min-w-0">
          <span className="font-display font-bold text-brand-onyx tracking-tight text-base leading-none">
            DeskPro
          </span>
          <span className="text-[10px] font-mono text-brand-ash ml-1.5 px-1.5 py-0.5 bg-brand-mist rounded border border-brand-bone">
            AIOps v3.0
          </span>
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        aria-label="Điều hướng di động"
      >
        <p className="px-3 pb-2 text-[10px] font-mono font-bold tracking-wider text-brand-ash uppercase">
          Không gian làm việc
        </p>
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive: routerIsActive }) =>
                    [
                      "group flex items-center gap-2.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all",
                      isItemActive(item, routerIsActive)
                        ? "bg-brand-ink text-white font-semibold shadow-xs"
                        : "text-brand-slate hover:bg-brand-mist hover:text-brand-ink",
                    ].join(" ")
                  }
                >
                  {({ isActive: routerIsActive }) => {
                    const isActive = isItemActive(item, routerIsActive);
                    return (
                      <>
                        <Icon
                          className={[
                            "size-4 shrink-0",
                            isActive
                              ? "text-brand-mint"
                              : item.iconColor ||
                                "text-brand-slate group-hover:text-brand-ink",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                        {item.alertDot ? (
                          <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        ) : null}
                      </>
                    );
                  }}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-brand-bone p-4">
        <div className="rounded-xl bg-brand-mist border border-brand-bone px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full bg-brand-emerald"
              aria-hidden="true"
            />
            <p className="truncate text-xs font-semibold text-brand-onyx">
              {getRoleLabel(user?.role)}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[11px] font-mono text-brand-slate">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return null;
}

export { SidebarContent };
export default Sidebar;
