import { LoaderCircle, UserCog, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  status: "online",
  password: "",
};

const inputClasses =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

function validate(values, technicians, editingId, isEditing) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Họ và tên phải có ít nhất 2 ký tự.";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Email không đúng định dạng.";
  } else if (
    technicians.some(
      (item) =>
        item.id !== editingId &&
        item.email.toLowerCase() === values.email.trim().toLowerCase(),
    )
  ) {
    errors.email = "Email này đã được sử dụng.";
  }

  if (!/^(?:\+84|0)[0-9 ]{8,13}$/.test(values.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (values.specialization.trim().length < 2) {
    errors.specialization = "Vui lòng nhập chuyên môn của kỹ thuật viên.";
  }

  if (!isEditing && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(values.password)) {
    errors.password = "Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.";
  }

  return errors;
}

function FieldError({ children }) {
  return children ? (
    <p className="mt-1.5 text-xs text-red-600" role="alert">
      {children}
    </p>
  ) : null;
}

function TechnicianFormModal({ technician, technicians, onClose, onSave }) {
  const isEditing = Boolean(technician);
  const [values, setValues] = useState(() =>
    technician ? { ...EMPTY_FORM, ...technician } : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const firstInputRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose, submitting]);

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values, technicians, technician?.id, isEditing);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        specialization: values.specialization.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/60"
        onClick={submitting ? undefined : onClose}
        aria-label="Đóng hộp thoại"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserCog className="size-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900">
                {isEditing ? "Chỉnh sửa kỹ thuật viên" : "Thêm kỹ thuật viên"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Cập nhật thông tin và trạng thái làm việc."
                  : "Thêm thành viên mới vào đội hỗ trợ."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-500">*</span></span>
              <input ref={firstInputRef} value={values.name} onChange={(event) => updateField("name", event.target.value)} className={inputClasses} placeholder="Nguyễn Văn An" aria-invalid={Boolean(errors.name)} />
              <FieldError>{errors.name}</FieldError>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></span>
              <input type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} className={inputClasses} placeholder="kythuat@company.vn" aria-invalid={Boolean(errors.email)} />
              <FieldError>{errors.email}</FieldError>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Số điện thoại <span className="text-red-500">*</span></span>
              <input type="tel" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClasses} placeholder="0901 234 567" aria-invalid={Boolean(errors.phone)} />
              <FieldError>{errors.phone}</FieldError>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Chuyên môn <span className="text-red-500">*</span></span>
              <input value={values.specialization} onChange={(event) => updateField("specialization", event.target.value)} className={inputClasses} placeholder="Phần cứng · Mạng" aria-invalid={Boolean(errors.specialization)} />
              <FieldError>{errors.specialization}</FieldError>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Trạng thái</span>
              <select value={values.status} onChange={(event) => updateField("status", event.target.value)} className={inputClasses}>
                <option value="online">Sẵn sàng</option>
                <option value="busy">Đang bận</option>
                <option value="offline">Ngoại tuyến</option>
              </select>
            </label>
            {!isEditing ? (
              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Mật khẩu ban đầu <span className="text-red-500">*</span></span>
                <input type="password" value={values.password} onChange={(event) => updateField("password", event.target.value)} className={inputClasses} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự, có chữ hoa và số" aria-invalid={Boolean(errors.password)} />
                <FieldError>{errors.password}</FieldError>
              </label>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} disabled={submitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isEditing ? "Lưu thay đổi" : "Thêm kỹ thuật viên"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default TechnicianFormModal;
