import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getDefaultPathForRole } from "../constants/roles.js";
import useAuth from "../hooks/useAuth.js";

function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <section
      className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center"
      aria-labelledby="unauthorized-title"
    >
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-semibold text-red-600">Lỗi 403</p>
        <h1
          id="unauthorized-title"
          className="mt-2 text-2xl font-bold text-slate-900"
        >
          Bạn không có quyền truy cập
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Vai trò hiện tại không được phép mở trang này. Hãy quay lại khu vực làm
          việc phù hợp với tài khoản của bạn.
        </p>
        <Link
          to={getDefaultPathForRole(user?.role)}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về trang tổng quan
        </Link>
      </div>
    </section>
  );
}

export default UnauthorizedPage;
