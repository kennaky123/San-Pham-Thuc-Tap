import { Menu } from "lucide-react";
import Breadcrumb from "./Breadcrumb.jsx";
import NotificationButton from "./NotificationButton.jsx";
import UserDropdown from "./UserDropdown.jsx";

function Header({ mobileMenuOpen, onOpenMobileMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="flex h-16 min-w-0 items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
          aria-label="Mở menu điều hướng"
          aria-controls="mobile-sidebar"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumb />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationButton />
          <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

export default Header;
