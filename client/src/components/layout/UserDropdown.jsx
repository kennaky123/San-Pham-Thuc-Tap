import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleLabel } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";
import useClickOutside from "../../hooks/useClickOutside.js";
import { getAvatarUrl, getInitials } from "../../utils/adminUserFormatters.js";

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const avatarUrl = getAvatarUrl(user?.avatar);

  useClickOutside(containerRef, closeDropdown, isOpen);

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

  function handleLogout() {
    setIsOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex items-center gap-2 rounded-full px-1.5 py-1 text-left transition hover:bg-brand-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-violet sm:pr-2.5"
        aria-label="Mở tùy chọn tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.fullName || "Avatar"}
              className="size-7 rounded-full object-cover ring-1 ring-brand-bone"
            />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-brand-violet ring-1 ring-brand-bone">
              {getInitials(user?.fullName)}
            </span>
          )}
          <span
            className="absolute bottom-0 right-0 size-2 rounded-full bg-brand-emerald ring-1 ring-white"
            aria-hidden="true"
          />
        </div>

        <span className="hidden min-w-0 sm:block text-left text-xs leading-tight">
          <span className="block max-w-32 truncate font-semibold text-brand-ink">
            {user?.fullName}
          </span>
          <span className="block max-w-32 truncate text-[10px] font-mono text-brand-slate">
            {getRoleLabel(user?.role)}
          </span>
        </span>
        <ChevronDown
          className={[
            "hidden size-3.5 text-brand-ash transition-transform sm:block",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-brand-bone bg-white shadow-xl shadow-black/10"
          role="dialog"
          aria-label="Tùy chọn tài khoản"
        >
          <div className="border-b border-brand-bone bg-brand-mist/50 px-4 py-3">
            <p className="truncate text-xs font-bold text-brand-onyx">
              {user?.fullName}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-mono text-brand-slate">
              {user?.email}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              to="/profile"
              onClick={closeDropdown}
              className="flex min-h-9 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-brand-ink transition hover:bg-brand-mist"
            >
              <UserRound className="size-3.5 text-brand-violet" aria-hidden="true" />
              Hồ sơ cá nhân
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-9 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default UserDropdown;
