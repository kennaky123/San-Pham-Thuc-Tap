import { LoaderCircle } from "lucide-react";

function AuthLoadingScreen() {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <LoaderCircle
          className="size-5 animate-spin text-blue-600 motion-reduce:animate-none"
          aria-hidden="true"
        />
        Đang kiểm tra phiên đăng nhập...
      </div>
    </main>
  );
}

export default AuthLoadingScreen;
