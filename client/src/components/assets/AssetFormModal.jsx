import { useState } from "react";
import { Laptop, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { createAsset, updateAsset } from "../../services/assetService.js";

const ASSET_TYPES = [
  { value: "laptop", label: "Laptop (Máy tính xách tay)" },
  { value: "desktop", label: "Desktop (Máy tính bàn / PC)" },
  { value: "monitor", label: "Màn hình hiển thị" },
  { value: "accessory", label: "Phụ kiện (Bàn phím, Chuột, Dock)" },
  { value: "other", label: "Thiết bị khác" },
];

function AssetFormModal({ asset, onClose, onSaved }) {
  const isEdit = Boolean(asset?._id);

  const [formData, setFormData] = useState({
    assetTag: asset?.assetTag || "",
    name: asset?.name || "",
    type: asset?.type || "laptop",
    serialNumber: asset?.serialNumber || "",
    specs: asset?.specs || "",
    os: asset?.os || "Windows 11 Pro",
    status: asset?.status || "in_stock",
    remoteTool: asset?.remoteTool || "anydesk",
    remoteId: asset?.remoteId || "",
    notes: asset?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.assetTag.trim() || !formData.name.trim()) {
      toast.warning("Vui lòng nhập Mã thiết bị và Tên thiết bị.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        assetTag: formData.assetTag.trim().toUpperCase(),
        name: formData.name.trim(),
        serialNumber: formData.serialNumber.trim() || null,
        specs: formData.specs.trim() || null,
        os: formData.os.trim() || null,
        remoteId: formData.remoteId.trim() || null,
        notes: formData.notes.trim() || null,
      };

      let result;
      if (isEdit) {
        result = await updateAsset(asset._id, payload);
        toast.success(`Cập nhật thiết bị ${result.assetTag} thành công!`);
      } else {
        result = await createAsset(payload);
        toast.success(`Thêm mới thiết bị ${result.assetTag} vào kho thành công!`);
      }
      onSaved?.(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu thiết bị thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-brand-bone shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-brand-violet">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                {isEdit ? "Chỉnh Sửa Thiết Bị" : "Nhập Thiết Bị Mới Vào Kho"}
              </h2>
              <p className="text-xs text-brand-slate">
                {isEdit
                  ? `Cập nhật thông tin mã ${asset.assetTag}`
                  : "Thêm laptop/thiết bị vào hệ thống kho quản lý IT"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Mã Thiết Bị (Asset Tag) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                required
                placeholder="VD: LP-2026-001"
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
              <p className="mt-1 text-[11px] text-brand-ash">
                Mã vạch / Tag định danh duy nhất in dán trên thân máy.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Loại Thiết Bị <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Tên / Model Thiết Bị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="VD: Lenovo ThinkPad T14s Gen 4 hoặc Dell Latitude 7420"
              className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Số Serial (S/N)
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="VD: PF2ABC1234"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Hệ Điều Hành (OS)
              </label>
              <input
                type="text"
                name="os"
                value={formData.os}
                onChange={handleChange}
                placeholder="VD: Windows 11 Pro 64-bit, macOS 14..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Thông Số Kỹ Thuật (Specs)
            </label>
            <input
              type="text"
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              placeholder="VD: Core i7-1365U, 32GB LPDDR5, 1TB NVMe, 14 inch 2.2K IPS"
              className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
            />
          </div>

          {/* Remote Assistance Info */}
          <div className="p-4 rounded-xl border border-brand-violet/20 bg-purple-50/40 space-y-3">
            <div className="text-xs font-bold text-brand-violet uppercase tracking-wider">
              Cấu Hình Điều Khiển Từ Xa (Remote Support)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Phần mềm hỗ trợ từ xa
                </label>
                <select
                  name="remoteTool"
                  value={formData.remoteTool}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
                >
                  <option value="anydesk">AnyDesk</option>
                  <option value="teamviewer">TeamViewer</option>
                  <option value="none">Không dùng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Mã kết nối (Remote ID)
                </label>
                <input
                  type="text"
                  name="remoteId"
                  value={formData.remoteId}
                  onChange={handleChange}
                  placeholder="VD: 123 456 789"
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Ghi Chú Thêm
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú về nguồn gốc xuất xứ, thời hạn bảo hành, phụ kiện đi kèm..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-bone shrink-0">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu Thay Đổi" : "Nhập Kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetFormModal;

