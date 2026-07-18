import { Eye, EyeOff, LoaderCircle, UserPlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EMPTY_FORM = { fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "user", status: "active" };
const inputClasses = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

function validate(values, users, editingId) {
  const errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Họ và tên phải có ít nhất 2 ký tự.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Email không đúng định dạng.";
  else if (users.some((user) => user.id !== editingId && user.email.toLowerCase() === values.email.trim().toLowerCase())) errors.email = "Email này đã được sử dụng.";
  if (!/^(?:\+84|0)[0-9 ]{8,13}$/.test(values.phone.trim())) errors.phone = "Số điện thoại không hợp lệ.";
  if (!editingId && values.password.length < 8) errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
  if (values.password && values.password.length < 8) errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
  if (values.password !== values.confirmPassword) errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  return errors;
}

function FieldError({ children }) {
  return children ? <p className="mt-1.5 text-xs text-red-600" role="alert">{children}</p> : null;
}

function UserFormModal({ user, users, onClose, onSave }) {
  const isEditing = Boolean(user);
  const [values, setValues] = useState(() => user ? { ...EMPTY_FORM, ...user, password: "", confirmPassword: "" } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values, users, user?.id);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => onSave({ ...values, fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim() }), 350);
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/60" onClick={onClose} aria-label="Đóng hộp thoại" />
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserPlus className="size-5" /></span>
            <div><h2 id={titleId} className="text-lg font-bold text-slate-900">{isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}</h2><p className="text-xs text-slate-500">{isEditing ? "Cập nhật thông tin tài khoản." : "Tạo tài khoản mới trong hệ thống."}</p></div>
          </div>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <label className="sm:col-span-2"><span className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-500">*</span></span><input ref={firstInputRef} value={values.fullName} onChange={(event) => updateField("fullName", event.target.value)} className={inputClasses} placeholder="Nguyễn Văn An" aria-invalid={Boolean(errors.fullName)} /><FieldError>{errors.fullName}</FieldError></label>
            <label><span className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></span><input type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} className={inputClasses} placeholder="user@company.vn" aria-invalid={Boolean(errors.email)} /><FieldError>{errors.email}</FieldError></label>
            <label><span className="text-sm font-semibold text-slate-700">Số điện thoại <span className="text-red-500">*</span></span><input type="tel" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClasses} placeholder="0901 234 567" aria-invalid={Boolean(errors.phone)} /><FieldError>{errors.phone}</FieldError></label>
            <label><span className="text-sm font-semibold text-slate-700">Mật khẩu {isEditing ? <span className="font-normal text-slate-400">(không bắt buộc)</span> : <span className="text-red-500">*</span>}</span><span className="relative block"><input type={showPassword ? "text" : "password"} value={values.password} onChange={(event) => updateField("password", event.target.value)} className={`${inputClasses} pr-11`} placeholder="Tối thiểu 8 ký tự" aria-invalid={Boolean(errors.password)} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 right-1 mt-1 flex size-10 -translate-y-1/2 items-center justify-center text-slate-500" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span><FieldError>{errors.password}</FieldError></label>
            <label><span className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu {!isEditing ? <span className="text-red-500">*</span> : null}</span><input type={showPassword ? "text" : "password"} value={values.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} className={inputClasses} placeholder="Nhập lại mật khẩu" aria-invalid={Boolean(errors.confirmPassword)} /><FieldError>{errors.confirmPassword}</FieldError></label>
            <label><span className="text-sm font-semibold text-slate-700">Vai trò</span><select value={values.role} onChange={(event) => updateField("role", event.target.value)} className={inputClasses}><option value="user">Người dùng</option><option value="admin">Quản trị viên</option></select></label>
            <label><span className="text-sm font-semibold text-slate-700">Trạng thái</span><select value={values.status} onChange={(event) => updateField("status", event.target.value)} className={inputClasses}><option value="active">Đang hoạt động</option><option value="locked">Bị khóa</option><option value="unverified">Chưa xác thực</option></select></label>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} disabled={submitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}{submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm người dùng"}</button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default UserFormModal;
