import { Headset } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getNavigationForRole } from "../../constants/navigation.js";
import { getRoleLabel } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";

function SidebarContent({ onNavigate }) {
  const { user } = useAuth();
  const navigationItems = getNavigationForRole(user?.role);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0F1A33] text-slate-100">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
          <Headset className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-wide text-white">
            IT HELPDESK
          </p>
          <p className="truncate text-xs text-slate-400">Support Center</p>
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5"
        aria-label="Điều hướng chính"
      >
        <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-wider text-slate-500 uppercase">
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
                  className={({ isActive }) =>
                    [
                      "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={[
                          "size-5 shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-200",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/[0.06] px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <p className="truncate text-xs font-medium text-slate-200">
              {getRoleLabel(user?.role)}
            </p>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

export { SidebarContent };
export default Sidebar;
