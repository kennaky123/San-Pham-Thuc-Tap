import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleLabel } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";
import useClickOutside from "../../hooks/useClickOutside.js";

function getInitials(fullName = "") {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

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
        className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-3 sm:pr-2"
        aria-label="Mở tùy chọn tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {getInitials(user?.fullName)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-slate-800">
            {user?.fullName}
          </span>
          <span className="block max-w-36 truncate text-xs text-slate-500">
            {getRoleLabel(user?.role)}
          </span>
        </span>
        <ChevronDown
          className={[
            "hidden size-4 text-slate-400 transition-transform sm:block",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          role="dialog"
          aria-label="Tùy chọn tài khoản"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.fullName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              to="/profile"
              onClick={closeDropdown}
              className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <UserRound className="size-4 text-slate-500" aria-hidden="true" />
              Hồ sơ cá nhân
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default UserDropdown;
