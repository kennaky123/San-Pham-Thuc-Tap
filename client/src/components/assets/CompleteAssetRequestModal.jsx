import { useEffect, useState } from "react";
import { CheckCircle2, Laptop, PackageCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import { completeAssetRequest, getAssets } from "../../services/assetService.js";

function CompleteAssetRequestModal({ request, onClose, onCompleted }) {
  const [stockAssets, setStockAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getAssets(
      { status: "in_stock", type: request.assetType },
      { signal: controller.signal },
    )
      .then((res) => setStockAssets(res.assets || []))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          toast.error("Không thể tải danh sách thiết bị trong kho.");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [request.assetType]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedAssetId) {
      toast.warning("Vui lòng chọn 1 thiết bị từ kho để bàn giao.");
      return;
    }

    setIsSubmitting(true);
    try {
      const completed = await completeAssetRequest(request._id, {
        assetId: selectedAssetId,
        note: note.trim() || undefined,
      });
      toast.success(
        `Đã xuất kho và bàn giao thiết bị thành công cho ${request.employee?.fullName}!`,
      );
      onCompleted?.(completed);
    } catch (error) {
      toast.error(error.response?.data?.message || "Hoàn tất bàn giao thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-brand-bone shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                Bàn Giao Thiết Bị Từ Kho
              </h2>
              <p className="text-xs text-brand-slate">
                Yêu cầu: <span className="font-mono font-bold text-brand-violet">{request.requestCode}</span>
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
          {/* Request summary */}
          <div className="rounded-xl border border-brand-bone bg-brand-mist/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-slate">Nhân viên tiếp nhận:</span>
              <span className="font-bold text-brand-onyx">{request.employee?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Phòng ban:</span>
              <span className="text-brand-slate">{request.employee?.department || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate">Loại thiết bị yêu cầu:</span>
              <span className="font-semibold text-brand-violet uppercase">{request.assetType}</span>
            </div>
            {request.note && (
              <div className="pt-1.5 border-t border-brand-bone text-brand-slate">
                <span className="font-medium text-brand-ink">Yêu cầu từ Admin: </span>
                {request.note}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1.5">
              Chọn Thiết Bị Sẵn Sàng Trong Kho <span className="text-red-500">*</span>
            </label>
            {isLoading ? (
              <div className="text-xs text-brand-slate py-2">Đang kiểm tra kho...</div>
            ) : stockAssets.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                Hiện tại trong kho không còn thiết bị loại{" "}
                <span className="font-bold uppercase">{request.assetType}</span> nào ở trạng thái Trong kho.
                Vui lòng nhập kho thêm thiết bị trước khi bàn giao.
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                <option value="">-- Chọn máy trong kho để xuất bàn giao --</option>
                {stockAssets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    [{asset.assetTag}] {asset.name} {asset.specs ? `(${asset.specs})` : ""}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-[11px] text-brand-ash">
              Sau khi xác nhận, máy sẽ tự động gán cho nhân viên này và chuyển sang trạng thái &quot;Đang sử dụng&quot;.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Ghi Chú Bàn Giao
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Đã cài đầy đủ phần mềm công ty, bàn giao máy kèm sạc và chuột không dây..."
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
              disabled={isSubmitting || !selectedAssetId || stockAssets.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang xử lý..." : "Xác Nhận Xuất Kho & Bàn Giao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteAssetRequestModal;
