import { useEffect, useState } from "react";
import { Save, ShieldCheck, Usb, X } from "lucide-react";
import { toast } from "react-toastify";
import { getAssignableEmployees } from "../../services/assetService.js";
import { updateUsbDevicePolicy } from "../../services/usbService.js";

function UsbPolicyModal({ device, onClose, onSaved }) {
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState(device?.status || "unverified");
  const [assignedUserId, setAssignedUserId] = useState(
    device?.assignedUser?._id || "",
  );
  const [note, setNote] = useState(device?.note || "");
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

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await updateUsbDevicePolicy(device._id, {
        status,
        assignedUserId: assignedUserId || null,
        note: note.trim() || null,
      });
      toast.success(`Đã cập nhật chính sách bảo mật cho ${device.deviceName}!`);
      onSaved?.(updated);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Cập nhật chính sách USB thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
                Cấu Hình Chính Sách Bảo Mật USB (DLP)
              </h2>
              <p className="text-xs text-brand-slate">
                Phê duyệt Whitelist, chặn Blacklist hoặc gán nhân viên quản lý
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
          <div className="rounded-xl border border-brand-bone bg-brand-mist/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-brand-slate shrink-0">Tên thiết bị:</span>
              <span className="font-bold text-brand-onyx text-right truncate">
                {device.deviceName}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-brand-slate shrink-0">Mã phần cứng:</span>
              <span className="font-mono text-[11px] text-brand-violet truncate max-w-[280px]">
                {device.deviceId}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-brand-slate shrink-0">Máy trạm kết nối gần nhất:</span>
              <span className="font-semibold text-brand-onyx">
                {device.lastHost?.hostname || "UNKNOWN-PC"}{" "}
                {device.lastHost?.ipAddress ? `(${device.lastHost.ipAddress})` : ""}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-onyx mb-1.5">
              Trạng thái chính sách bảo mật <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("trusted")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  status === "trusted"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20"
                    : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                Đã Phê Duyệt (Whitelist)
              </button>
              <button
                type="button"
                onClick={() => setStatus("unverified")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  status === "unverified"
                    ? "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20"
                    : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                Chưa Xác Minh
              </button>
              <button
                type="button"
                onClick={() => setStatus("blocked")}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  status === "blocked"
                    ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                    : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                Chặn (Blacklist)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-onyx mb-1">
              Nhân viên được phép sử dụng (tùy chọn)
            </label>
            {isLoadingEmployees ? (
              <div className="h-10 flex items-center justify-center bg-brand-mist/40 rounded-xl text-xs text-brand-slate border border-brand-bone">
                Đang tải danh sách nhân viên...
              </div>
            ) : (
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full text-xs rounded-xl border border-brand-bone px-3 py-2.5 bg-white text-brand-onyx focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-hidden"
              >
                <option value="">-- Không gán cố định --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.email}) - {emp.department || "Nhân viên"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-onyx mb-1">
              Ghi chú kiểm duyệt An toàn thông tin (DLP Note)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: USB BitLocker đã mã hóa của phòng Kế toán, cho phép sao lưu chứng từ..."
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu chính sách"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsbPolicyModal;
