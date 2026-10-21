import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    (pathname !== "/profile" &&
      pathname !== "/topology" &&
      !pathname.startsWith(allowedPrefix))
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
    document.title = "Đăng nhập | DeskPro IT — AIOps v3.0";
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
    "h-11 w-full rounded-xl border bg-brand-mist pr-4 pl-10 text-sm text-brand-ink outline-none transition placeholder:text-brand-ash focus:bg-white disabled:cursor-not-allowed disabled:opacity-60",
    fieldErrors.email
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-brand-bone focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20",
  ].join(" ");
  const passwordInputClasses = [
    "h-11 w-full rounded-xl border bg-brand-mist pr-11 pl-10 text-sm text-brand-ink outline-none transition placeholder:text-brand-ash focus:bg-white disabled:cursor-not-allowed disabled:opacity-60",
    fieldErrors.password
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-brand-bone focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20",
  ].join(" ");

  return (
    <main className="grid min-h-svh bg-brand-mist lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
      {/* Left Brand Showcase (DeskPro IT AIOps v3.0) */}
      <section className="relative hidden overflow-hidden bg-brand-onyx p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#6647f0 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-40 -left-32 size-96 rounded-full bg-brand-violet/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 bottom-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full bg-brand-blue/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet font-display text-sm font-extrabold text-white shadow-lg">
            IT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-extrabold tracking-tight">
                DeskPro
              </span>
              <span className="rounded-md border border-brand-mint/30 bg-brand-mint/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-mint">
                AIOps v3.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enterprise ITSM, Network Topology &amp; Data Warehouse
            </p>
          </div>
        </div>

        <div className="relative max-w-xl py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/40 bg-brand-violet/20 px-3 py-1 text-xs font-semibold text-brand-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
            Hệ thống quản lý sự cố &amp; hạ tầng CNTT chuẩn ITIL v4
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
            Điều phối sự cố, giám sát mạng &amp; phân tích BI hợp nhất.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
            Kết nối Cổng tự phục vụ nhân viên, Bàn làm việc 3 cột của kỹ thuật
            viên, Sơ đồ mạng Campus và Kho dữ liệu Star Schema trên một nền
            tảng duy nhất.
          </p>

          <ul className="mt-8 space-y-3.5 text-xs font-medium text-slate-200">
            {[
              "Hàng đợi Ticket mật độ cao với cảnh báo SLA P1–P4 thời gian thực",
              "Bàn làm việc 3 cột tích hợp Telemetry thiết bị & Canned Responses",
              "Bản đồ mạng Campus tương tác & Kho dữ liệu OLAP Star Schema",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2
                  className="size-4 shrink-0 text-brand-mint"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 pt-6 font-mono text-xs text-slate-400">
          <span>DeskPro IT Service Management</span>
          <span className="text-brand-mint">SLA Uptime: 99.98%</span>
        </div>
      </section>

      {/* Right Login Card */}
      <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-16">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-ink font-display text-sm font-extrabold text-white">
              IT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-extrabold text-brand-ink">
                  DeskPro
                </span>
                <span className="rounded bg-brand-violet/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-violet">
                  AIOps v3.0
                </span>
              </div>
              <p className="text-xs text-brand-slate">
                Enterprise ITSM Platform
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-bone bg-white p-6 shadow-xs sm:p-8">
            <div>
              <span className="inline-flex items-center rounded-md bg-brand-violet/10 px-2 py-0.5 text-[11px] font-bold text-brand-violet uppercase">
                Xác thực SSO / Nội bộ
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
                Đăng nhập DeskPro IT
              </h1>
              <p className="mt-1.5 text-xs leading-5 text-brand-slate">
                Sử dụng tài khoản doanh nghiệp để truy cập không gian làm việc
                theo phân quyền.
              </p>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              {apiError ? (
                <div
                  ref={apiErrorRef}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 outline-none"
                  role="alert"
                  tabIndex={-1}
                >
                  <p className="font-bold">{apiError.message}</p>
                  {apiError.details.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-1 pl-4">
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
                  className="mb-1.5 block text-xs font-bold text-brand-ink"
                >
                  Email doanh nghiệp
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-ash"
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
                  <p id="email-error" className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold text-brand-ink"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-ash"
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
                    className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-ash transition hover:bg-brand-bone/60 hover:text-brand-ink"
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-1 text-xs text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-slate">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-3.5 rounded border-brand-ash accent-brand-violet"
                    disabled={isSubmitting}
                  />
                  Duy trì đăng nhập
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-violet hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-ink px-4 text-xs font-bold text-white shadow-xs transition hover:bg-brand-carbon disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng Nhập Hệ Thống →"
                )}
              </button>

              <p className="flex items-start gap-2 pt-2 text-[11px] leading-5 text-brand-ash">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-brand-emerald"
                  aria-hidden="true"
                />
                Phiên làm việc được bảo vệ bằng JWT &amp; kiểm soát truy cập
                RBAC theo vai trò.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
