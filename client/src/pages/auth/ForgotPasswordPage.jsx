import { useEffect } from "react";
import { ArrowLeft, Headset, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  useEffect(() => {
    document.title = "Quên mật khẩu | IT Helpdesk";
  }, []);

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Headset className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-900">
              IT HELPDESK
            </p>
            <p className="text-xs text-slate-500">Internal Support Center</p>
          </div>
        </div>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
          aria-labelledby="forgot-password-title"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <KeyRound className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 text-sm font-semibold text-blue-700">
            Khôi phục tài khoản
          </p>
          <h1
            id="forgot-password-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
          >
            Quên mật khẩu
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Chức năng đặt lại mật khẩu qua email chưa được kết nối ở phiên bản
            hiện tại. Vui lòng liên hệ quản trị viên để xác minh và khôi phục tài
            khoản.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại đăng nhập
          </Link>
        </section>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
