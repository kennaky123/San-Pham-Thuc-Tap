import { useEffect, useState } from "react";
import { Laptop, Send, User, X } from "lucide-react";
import { toast } from "react-toastify";
import { assignAsset, getAssignableEmployees } from "../../services/assetService.js";

function AssignAssetModal({ asset, onClose, onAssigned }) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedUserId) {
      toast.warning("Vui lòng chọn nhân viên tiếp nhận thiết bị.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await assignAsset(asset._id, {
        userId: selectedUserId,
        note: note.trim() || undefined,
      });
      toast.success(`Cấp phát thành công thiết bị ${asset.assetTag}!`);
      onAssigned?.(updated);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cấp phát thiết bị thất bại.");
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
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                Cấp Phát Thiết Bị Cho Nhân Viên
              </h2>
              <p className="text-xs text-brand-slate">
                Gán quyền sử dụng laptop/thiết bị từ kho lưu trữ
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
          {/* Asset Info Card */}
          <div className="rounded-xl border border-brand-bone bg-brand-mist/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-slate">Mã thiết bị (Asset Tag):</span>
              <span className="font-mono font-bold text-brand-violet">{asset.assetTag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Tên thiết bị:</span>
              <span className="font-semibold text-brand-onyx">{asset.name}</span>
            </div>
            {asset.specs && (
              <div className="flex justify-between">
                <span className="text-brand-slate">Cấu hình:</span>
                <span className="text-brand-slate">{asset.specs}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brand-slate">Trạng thái hiện tại:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Trong kho (Sẵn sàng)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1.5">
              Chọn Nhân Viên Tiếp Nhận <span className="text-red-500">*</span>
            </label>
            {isLoadingEmployees ? (
              <div className="text-xs text-brand-slate py-2">Đang tải danh sách nhân viên...</div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                <option value="">-- Chọn nhân viên từ danh sách --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.email}) - {emp.department || "Nhân viên"}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-[11px] text-brand-ash">
              Sau khi cấp phát, tag của thiết bị sẽ tự động chuyển thành &quot;Đang được sử dụng bởi nhân viên&quot;.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Ghi Chú Bàn Giao / Lý Do Cấp Phát
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Cấp phát laptop ThinkPad phục vụ dự án mới, máy nguyên seal..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-bone">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-brand-bone text-xs font-semibold text-brand-slate hover:bg-brand-mist transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang xử lý..." : "Xác Nhận Bàn Giao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignAssetModal;
