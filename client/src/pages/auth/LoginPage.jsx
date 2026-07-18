import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Headset,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AuthLoadingScreen from "../../components/auth/AuthLoadingScreen.jsx";
import { getDefaultPathForRole } from "../../constants/roles.js";
import useAuth from "../../hooks/useAuth.js";
import { getLoginError } from "../../services/authService.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_PATH_PREFIXES = {
  user: "/user/",
  technician: "/technician/",
  admin: "/admin/",
};

function validateField(fieldName, value) {
  if (fieldName === "email") {
    const normalizedEmail = value.trim();

    if (!normalizedEmail) {
      return "Email là bắt buộc.";
    }

    if (
      normalizedEmail.length > 254 ||
      !EMAIL_PATTERN.test(normalizedEmail)
    ) {
      return "Email không đúng định dạng.";
    }
  }

  if (fieldName === "password" && value.length === 0) {
    return "Mật khẩu là bắt buộc.";
  }

  return "";
}

function validateForm(formValues) {
  const errors = {};
  const emailError = validateField("email", formValues.email);
  const passwordError = validateField("password", formValues.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

function getRedirectPath(role, previousLocation) {
  const defaultPath = getDefaultPathForRole(role);
  const pathname = previousLocation?.pathname;
  const allowedPrefix = ROLE_PATH_PREFIXES[role];

  if (
    !pathname ||
    (pathname !== "/profile" && !pathname.startsWith(allowedPrefix))
  ) {
    return defaultPath;
  }

  return `${pathname}${previousLocation.search ?? ""}${
    previousLocation.hash ?? ""
  }`;
}

function LoginPage() {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const apiErrorRef = useRef(null);

  useEffect(() => {
    document.title = "Đăng nhập | IT Helpdesk";
  }, []);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setApiError(null);

    if (Object.hasOwn(fieldErrors, name)) {
      const nextError = validateField(name, value);

      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };

        if (nextError) {
          nextErrors[name] = nextError;
        } else {
          delete nextErrors[name];
        }

        return nextErrors;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateForm(formValues);
    setFieldErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.email) {
        emailInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        rememberMe,
      });
      const redirectPath = getRedirectPath(
        authenticatedUser.role,
        location.state?.from,
      );

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setApiError(getLoginError(error));
      window.requestAnimationFrame(() => apiErrorRef.current?.focus());
    } finally {
      setIsSubmitting(false);
    }
  }

  const emailInputClasses = [
    "h-12 w-full rounded-lg border bg-white pr-4 pl-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100",
    fieldErrors.email
      ? "border-red-400 focus:border-red-500 focus:ring-3 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100",
  ].join(" ");
  const passwordInputClasses = [
    "h-12 w-full rounded-lg border bg-white pr-12 pl-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100",
    fieldErrors.password
      ? "border-red-400 focus:border-red-500 focus:ring-3 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100",
  ].join(" ");

  return (
    <main className="grid min-h-svh bg-slate-50 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          className="absolute -top-40 -left-32 size-96 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 bottom-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/30">
            <Headset className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide">IT HELPDESK</p>
            <p className="text-xs text-slate-400">Internal Support Center</p>
          </div>
        </div>

        <div className="relative max-w-xl py-16">
          <p className="text-sm font-semibold tracking-wider text-blue-300 uppercase">
            Hỗ trợ nội bộ hiệu quả
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
            Kết nối nhanh với đội ngũ kỹ thuật
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Tạo yêu cầu, theo dõi tiến độ và trao đổi với bộ phận IT trên một
            hệ thống thống nhất, minh bạch.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-slate-200">
            {[
              "Theo dõi trạng thái ticket theo thời gian thực",
              "Trao đổi tập trung trong từng yêu cầu",
              "Phân quyền rõ ràng cho từng vai trò",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2
                  className="size-5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Hệ thống quản lý yêu cầu hỗ trợ nội bộ doanh nghiệp
        </p>
      </section>

      <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Chào mừng trở lại
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Đăng nhập
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sử dụng tài khoản nội bộ để truy cập hệ thống hỗ trợ IT.
              </p>
            </div>

            <form
              className="mt-7 space-y-5"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              {apiError ? (
                <div
                  ref={apiErrorRef}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  role="alert"
                  tabIndex={-1}
                >
                  <p className="font-semibold">{apiError.message}</p>
                  {apiError.details.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {apiError.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className={emailInputClasses}
                    placeholder="tenban@congty.com"
                    autoComplete="username"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
                  />
                </div>
                {fieldErrors.email ? (
                  <p id="email-error" className="mt-1.5 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={passwordInputRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={handleInputChange}
                    className={passwordInputClasses}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-1.5 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 rounded border-slate-300 accent-blue-600"
                    disabled={isSubmitting}
                  />
                  Ghi nhớ đăng nhập
                </label>
                <Link
                  to="/forgot-password"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      className="size-5 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>

              <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                Phiên đăng nhập được bảo vệ và tự hết hạn theo chính sách của hệ
                thống.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Cần hỗ trợ truy cập? Vui lòng liên hệ quản trị viên hệ thống.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
