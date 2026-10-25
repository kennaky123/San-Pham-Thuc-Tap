import { useState } from "react";
import { AppWindow, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { createSoftwareLicense, updateSoftwareLicense } from "../../services/softwareService.js";

const CATEGORIES = [
  "Văn phòng & Email",
  "Thiết kế & Đồ họa",
  "Lập trình & Phát triển",
  "Bảo mật & Tiện ích",
  "Giao tiếp & Cộng tác",
  "Hệ điều hành & Máy chủ",
  "Khác",
];

const TYPES = [
  { value: "saas_subscription", label: "Thuê bao định kỳ (SaaS Cloud)" },
  { value: "perpetual", label: "Mua đứt vĩnh viễn (Perpetual)" },
  { value: "volume", label: "Giấy phép số lượng lớn (Volume Licensing)" },
  { value: "oem", label: "Bản quyền gắn liền phần cứng (OEM)" },
];

const CYCLES = [
  { value: "monthly", label: "Hàng tháng (Monthly)" },
  { value: "yearly", label: "Hàng năm (Yearly)" },
  { value: "one_time", label: "Một lần duy nhất (One-time)" },
];

function SoftwareFormModal({ license, onClose, onSaved }) {
  const isEdit = Boolean(license?._id);

  const [formData, setFormData] = useState({
    name: license?.name || "",
    vendor: license?.vendor || "",
    category: license?.category || "Văn phòng & Email",
    type: license?.type || "saas_subscription",
    totalSeats: license?.totalSeats || 10,
    costPerSeat: license?.costPerSeat || 0,
    currency: license?.currency || "VND",
    billingCycle: license?.billingCycle || "yearly",
    licenseKey: license?.licenseKey || "",
    portalUrl: license?.portalUrl || "",
    purchaseDate: license?.purchaseDate ? license.purchaseDate.slice(0, 10) : "",
    expiryDate: license?.expiryDate ? license.expiryDate.slice(0, 10) : "",
    notes: license?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vendor.trim()) {
      toast.warning("Vui lòng nhập Tên phần mềm và Nhà cung cấp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        vendor: formData.vendor.trim(),
        totalSeats: Number(formData.totalSeats),
        costPerSeat: Number(formData.costPerSeat || 0),
        licenseKey: formData.licenseKey.trim() || null,
        portalUrl: formData.portalUrl.trim() || null,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        notes: formData.notes.trim() || null,
      };

      let result;
      if (isEdit) {
        result = await updateSoftwareLicense(license._id, payload);
        toast.success(`Cập nhật bản quyền ${result.name} thành công!`);
      } else {
        result = await createSoftwareLicense(payload);
        toast.success(`Thêm mới bản quyền ${result.name} thành công!`);
      }
      onSaved?.(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu bản quyền thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-brand-bone shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-brand-violet">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                {isEdit ? "Cập Nhật Bản Quyền Phần Mềm" : "Thêm Bản Quyền Phần Mềm Mới"}
              </h2>
              <p className="text-xs text-brand-slate">
                Quản lý số lượng giấy phép (Seats), chi phí FinOps và hạn gia hạn
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Tên Gói Phần Mềm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="VD: Microsoft 365 Business Standard"
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Hãng / Nhà Cung Cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                required
                placeholder="VD: Microsoft, Adobe, JetBrains, Google..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Danh Mục Phần Mềm
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Hình Thức Bản Quyền (License Type)
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seats & Cost Section (FinOps) */}
          <div className="p-4 rounded-xl border border-brand-bone bg-brand-mist/40 space-y-3">
            <div className="text-xs font-bold text-brand-violet uppercase tracking-wider">
              Chi Phí &amp; Số Lượng Cấp Phép (FinOps)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Tổng Số Bản Quyền (Seats) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  min={1}
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Đơn Giá Mỗi Seat ({formData.currency})
                </label>
                <input
                  type="number"
                  name="costPerSeat"
                  min={0}
                  step={1000}
                  value={formData.costPerSeat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-ink mb-1">
                  Chu Kỳ Tính Phí
                </label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                >
                  {CYCLES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Ngày Bắt Đầu / Mua
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Ngày Hết Hạn Gia Hạn (Expiry Date)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
              <p className="mt-1 text-[11px] text-brand-ash">
                Để trống nếu là bản quyền vĩnh viễn (Perpetual).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Mã Bản Quyền / Key Kích Hoạt
              </label>
              <input
                type="text"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                placeholder="VD: XXXXX-XXXXX-XXXXX hoặc Subscription ID"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Link Trang Quản Trị Hãng (Portal URL)
              </label>
              <input
                type="url"
                name="portalUrl"
                value={formData.portalUrl}
                onChange={handleChange}
                placeholder="VD: https://admin.microsoft.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink mb-1">
              Ghi Chú Điều Khoản / Phạm Vi Sử Dụng
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Quy định sử dụng, số máy cho phép cài đặt hoặc thông tin liên hệ đại lý cung cấp..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>

          {/* Footer */}
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
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu Thay Đổi" : "Thêm Bản Quyền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SoftwareFormModal;

