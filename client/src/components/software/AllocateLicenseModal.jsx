import { useEffect, useState } from "react";
import { Check, ShieldCheck, User, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import { allocateLicense } from "../../services/softwareService.js";
import { getAssignableEmployees } from "../../services/assetService.js";

function AllocateLicenseModal({ license, onClose, onAllocated }) {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [note, setNote] = useState("");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getAssignableEmployees({ signal: controller.signal })
      .then(setEmployees)
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          toast.error("Không thể tải danh sách nhân viên.");
        }
      })
      .finally(() => setIsLoadingEmployees(false));
    return () => controller.abort();
  }, []);

  const assignedUserIds = new Set(
    (license?.assignedUsers || []).map((entry) =>
      typeof entry.user === "object" ? entry.user?._id : entry.user
    )
  );

  const availableEmployees = employees.filter((emp) => !assignedUserIds.has(emp._id));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedUserId) {
      toast.warning("Vui lòng chọn nhân viên tiếp nhận bản quyền.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await allocateLicense(license._id, {
        userId: selectedUserId,
        note: note.trim() || undefined,
      });
      toast.success(`Đã cấp phát bản quyền ${license.name} thành công!`);
      onAllocated?.(updated);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cấp phát bản quyền thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const remainingSeats =
    license.availableSeats !== undefined
      ? license.availableSeats
      : Math.max(0, (license.totalSeats || 0) - (license.assignedUsers?.length || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-brand-bone shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-brand-violet">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                Cấp Phát Bản Quyền Phần Mềm
              </h2>
              <p className="text-xs text-brand-slate">
                Gán tài khoản/license seat cho nhân viên công ty
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-brand-slate hover:text-brand-ink hover:bg-brand-mist transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Software Info Card */}
          <div className="rounded-xl border border-brand-bone bg-brand-mist/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-slate">Phần mềm & Nhà cung cấp:</span>
              <span className="font-semibold text-brand-onyx">
                {license.name} ({license.vendor})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Phân loại & Hình thức:</span>
              <span className="text-brand-slate">{license.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-slate">Số lượng seat còn trống:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Users className="w-3.5 h-3.5" />
                {remainingSeats} / {license.totalSeats} seats trống
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-onyx mb-1">
              Chọn nhân viên tiếp nhận bản quyền <span className="text-red-500">*</span>
            </label>
            {isLoadingEmployees ? (
              <div className="h-10 flex items-center justify-center bg-brand-mist/40 rounded-xl text-xs text-brand-slate border border-brand-bone">
                Đang tải danh sách nhân viên...
              </div>
            ) : availableEmployees.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
                Tất cả nhân viên đủ điều kiện hiện đã được cấp bản quyền này hoặc danh sách rỗng.
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2.5 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
              >
                <option value="">-- Chọn nhân viên --</option>
                {availableEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.email}) - {emp.department || "Nhân viên"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-onyx mb-1">
              Ghi chú cấp phát (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Phục vụ dự án thiết kế UI/UX Q4, account SSO công ty..."
              className="w-full text-xs rounded-xl border border-brand-bone p-3 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-bone">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-brand-bone text-xs font-medium text-brand-slate hover:bg-brand-mist transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingEmployees || availableEmployees.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận cấp phát"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllocateLicenseModal;
