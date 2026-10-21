import { ArrowLeft, KeyRound } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  useEffect(() => {
    document.title = "Quên mật khẩu | DeskPro IT";
  }, []);

  return (
    <main className="flex min-h-svh items-center justify-center bg-brand-mist px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-ink font-display text-sm font-extrabold text-white">
            IT
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-extrabold tracking-tight text-brand-ink">
              DeskPro
            </span>
            <span className="rounded-md border border-brand-violet/20 bg-brand-violet/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-violet">
              AIOps v3.0
            </span>
          </div>
        </div>

        <section
          className="rounded-2xl border border-brand-bone bg-white p-6 text-center shadow-xs sm:p-8"
          aria-labelledby="forgot-password-title"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet">
            <KeyRound className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-bold tracking-wider text-brand-violet uppercase">
            Khôi phục tài khoản Active Directory
          </p>
          <h1
            id="forgot-password-title"
            className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-brand-ink"
          >
            Quên mật khẩu
          </h1>
          <p className="mt-2.5 text-xs leading-5 text-brand-slate">
            Để đảm bảo an toàn bảo mật nội bộ, vui lòng liên hệ Quản trị viên
            IT (Hotline <strong className="text-brand-ink">Ext: 8888</strong>) để
            xác minh danh tính và cấp lại mật khẩu.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-carbon"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Quay lại đăng nhập
          </Link>
        </section>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
