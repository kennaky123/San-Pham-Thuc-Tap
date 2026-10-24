import { useState } from "react";
import { HardDrive, RotateCcw, Wrench, X } from "lucide-react";
import { toast } from "react-toastify";
import { returnAsset } from "../../services/assetService.js";

function ReturnAssetModal({ asset, onClose, onReturned }) {
  const [status, setStatus] = useState("in_stock");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await returnAsset(asset._id, {
        status,
        note: note.trim() || undefined,
      });
      toast.success(
        status === "maintenance"
          ? `Đã thu hồi thiết bị ${asset.assetTag} và chuyển sang Bảo trì!`
          : `Đã thu hồi thiết bị ${asset.assetTag} về kho thành công!`,
      );
      onReturned?.(updated);
    } catch (error) {
      toast.error(error.response?.data?.message || "Thu hồi thiết bị thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-brand-bone shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                Thu Hồi Thiết Bị Về Kho
              </h2>
              <p className="text-xs text-brand-slate">
                Thu hồi laptop từ nhân viên và cập nhật trạng thái kho
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
              <span className="text-brand-slate">Mã thiết bị:</span>
              <span className="font-mono font-bold text-brand-violet">{asset.assetTag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Tên thiết bị:</span>
              <span className="font-semibold text-brand-onyx">{asset.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Đang được dùng bởi:</span>
              <span className="font-bold text-brand-violet">
                {asset.assignedTo?.fullName || "Nhân viên"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-2">
              Trạng Thái Sau Khi Thu Hồi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("in_stock")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === "in_stock"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500"
                    : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                <HardDrive className="w-5 h-5 text-emerald-600" />
                Về Kho (Sẵn sàng)
              </button>
              <button
                type="button"
                onClick={() => setStatus("maintenance")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === "maintenance"
                    ? "border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500"
                    : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                }`}
              >
                <Wrench className="w-5 h-5 text-amber-600" />
                Cần Bảo Trì / Sửa Chữa
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Ghi Chú Thu Hồi / Tình Trạng Thiết Bị
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nhân viên hoàn tất bàn giao dự án, máy hoạt động bình thường, đầy đủ sạc..."
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang xử lý..." : "Xác Nhận Thu Hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnAssetModal;
