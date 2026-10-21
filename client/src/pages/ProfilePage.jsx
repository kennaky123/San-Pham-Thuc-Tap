import {
  Camera,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import WorkspacePageHeader from "../components/common/WorkspacePageHeader.jsx";
import useAuth from "../hooks/useAuth.js";
import {
  changePassword,
  getUserServiceErrorMessage,
  updateUserAvatar,
  updateUserProfile,
} from "../services/userService.js";
import { getAvatarUrl, getInitials } from "../utils/adminUserFormatters.js";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-brand-bone bg-brand-mist px-3.5 py-2.5 text-xs font-medium text-brand-ink outline-none transition focus:border-brand-violet focus:bg-white disabled:opacity-60";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

function ProfilePage() {
  const { user, updateUserSession } = useAuth();
  const avatarInputRef = useRef(null);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  function updateProfileField(name, value) {
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function updatePasswordField(name, value) {
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    setAvatarSubmitting(true);
    try {
      const result = await updateUserAvatar(file);
      if (typeof updateUserSession === "function") {
        updateUserSession(result);
      }
      toast.success("Cập nhật ảnh đại diện thành công.");
    } catch (error) {
      toast.error(getUserServiceErrorMessage(error));
    } finally {
      setAvatarSubmitting(false);
      event.target.value = "";
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSubmitting(true);

    try {
      const result = await updateUserProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        department: profileForm.department.trim(),
      });

      if (typeof updateUserSession === "function") {
        updateUserSession(result);
      }

      toast.success("Cập nhật thông tin cá nhân thành công.");
    } catch (error) {
      toast.error(getUserServiceErrorMessage(error));
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      if (typeof updateUserSession === "function") {
        updateUserSession(result);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      toast.success("Đổi mật khẩu thành công.");
    } catch (error) {
      toast.error(getUserServiceErrorMessage(error));
    } finally {
      setPasswordSubmitting(false);
    }
  }

  const roleLabel =
    user?.role === "admin"
      ? "Quản trị viên IT"
      : user?.role === "technician"
        ? "Kỹ thuật viên IT"
        : "Nhân viên nội bộ";

  const memberSince = user?.createdAt
    ? dateFormatter.format(new Date(user.createdAt))
    : "05/2025";

  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <section>
      <WorkspacePageHeader
        eyebrow="Tài khoản DeskPro IT"
        title="Hồ sơ cá nhân & Bảo mật"
        description="Quản lý thông tin liên hệ, phòng ban và mật khẩu xác thực của bạn."
      />

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-brand-bone bg-white p-6 text-center shadow-xs">
          <div className="relative mx-auto w-fit">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.fullName || "Avatar"}
                className="size-24 rounded-3xl object-cover shadow-inner"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-3xl bg-brand-violet text-2xl font-bold text-white">
                {getInitials(user?.fullName || profileForm.fullName)}
              </span>
            )}
            <button
              type="button"
              disabled={avatarSubmitting}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-full border-4 border-white bg-brand-ink text-white shadow-xs hover:bg-brand-carbon disabled:opacity-60"
              aria-label="Đổi ảnh đại diện"
            >
              {avatarSubmitting ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
            </button>
          </div>
          <h2 className="mt-4 font-display text-base font-extrabold text-brand-ink">
            {user?.fullName || profileForm.fullName}
          </h2>
          <p className="mt-0.5 font-mono text-xs text-brand-ash">
            {user?.email || profileForm.email}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-bold text-brand-violet">
            {roleLabel}
          </span>
          <div className="mt-5 space-y-2.5 border-t border-brand-bone pt-4 text-left text-xs">
            <p className="flex items-center gap-2.5 text-brand-slate">
              <ShieldCheck className="size-4 text-brand-emerald" />
              Tài khoản SSO đã xác thực
            </p>
            <p className="flex items-center gap-2.5 text-brand-slate">
              <UserRound className="size-4 text-brand-violet" />
              Thành viên từ {memberSince}
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <form
            onSubmit={handleProfileSubmit}
            className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs"
          >
            <div className="border-b border-brand-bone px-5 py-4">
              <h2 className="font-display text-sm font-bold text-brand-ink">
                Thông tin cá nhân
              </h2>
              <p className="mt-0.5 text-xs text-brand-slate">
                Thông tin hiển thị trên phiếu yêu cầu hỗ trợ (Ticket)
              </p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Họ và tên
                </span>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) =>
                    updateProfileField("fullName", e.target.value)
                  }
                  disabled={profileSubmitting}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-xs font-bold text-brand-ink">Email</span>
                <span className="relative block">
                  <Mail className="absolute top-1/2 left-3 mt-0.5 size-4 -translate-y-1/2 text-brand-ash" />
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className={`${inputClass} cursor-not-allowed pl-10 text-brand-ash`}
                  />
                </span>
              </label>
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Số điện thoại
                </span>
                <span className="relative block">
                  <Phone className="absolute top-1/2 left-3 mt-0.5 size-4 -translate-y-1/2 text-brand-ash" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      updateProfileField("phone", e.target.value)
                    }
                    disabled={profileSubmitting}
                    placeholder="0910000001"
                    className={`${inputClass} pl-10`}
                  />
                </span>
              </label>
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Phòng ban
                </span>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) =>
                    updateProfileField("department", e.target.value)
                  }
                  disabled={profileSubmitting}
                  placeholder="Khối Tài Chính - Kế Toán"
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex justify-end border-t border-brand-bone bg-brand-mist/40 px-5 py-3.5">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 text-xs font-semibold text-white hover:bg-brand-carbon disabled:opacity-60"
              >
                {profileSubmitting ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs"
          >
            <div className="border-b border-brand-bone px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-brand-ink">
                <KeyRound className="size-4 text-brand-violet" />
                Đổi mật khẩu
              </h2>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Mật khẩu hiện tại
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    updatePasswordField("currentPassword", e.target.value)
                  }
                  disabled={passwordSubmitting}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Mật khẩu mới
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    updatePasswordField("newPassword", e.target.value)
                  }
                  disabled={passwordSubmitting}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-xs font-bold text-brand-ink">
                  Xác nhận mật khẩu
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    updatePasswordField("confirmNewPassword", e.target.value)
                  }
                  disabled={passwordSubmitting}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex justify-end border-t border-brand-bone bg-brand-mist/40 px-5 py-3.5">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-bone bg-white px-4 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-mist disabled:opacity-60"
              >
                {passwordSubmitting ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : null}
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
