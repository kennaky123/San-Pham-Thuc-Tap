import { useState } from "react";
import { Check, Copy, ExternalLink, Laptop, Tv, X } from "lucide-react";
import { toast } from "react-toastify";
import { launchRemoteDesktop, updateAsset } from "../../services/assetService.js";

function RemoteConnectModal({ asset, onClose, onUpdated }) {
  const [copied, setCopied] = useState(false);
  const [remoteTool, setRemoteTool] = useState(asset.remoteTool || "anydesk");
  const [remoteId, setRemoteId] = useState(asset.remoteId || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleLaunch() {
    if (!remoteId.trim()) {
      toast.warning("Vui lòng nhập ID Remote Desktop trước khi kết nối.");
      return;
    }
    try {
      const { appName, id } = await launchRemoteDesktop(remoteTool, remoteId);
      toast.success(
        `Đã sao chép ID ${id} và mở liên kết ${appName}! Nếu máy chưa tự mở, bạn có thể dán ID vào phần mềm ${appName}.`,
      );
    } catch (error) {
      toast.error(error.message || "Không thể khởi chạy Remote Desktop.");
    }
  }

  async function handleCopy() {
    if (!remoteId.trim()) return;
    try {
      await navigator.clipboard.writeText(remoteId.trim());
      setCopied(true);
      toast.info(`Đã sao chép ID: ${remoteId.trim()}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép ID.");
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateAsset(asset._id, {
        remoteTool,
        remoteId: remoteId.trim() || null,
      });
      toast.success("Cập nhật thông tin Remote Desktop thành công.");
      onUpdated?.(updated);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-brand-bone shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-brand-bone bg-brand-mist/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-brand-violet">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-onyx">
                Remote Desktop Hỗ Trợ
              </h2>
              <p className="text-xs text-brand-slate">
                {asset.name} • <span className="font-mono font-semibold text-brand-violet">{asset.assetTag}</span>
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

        <div className="p-5 space-y-4">
          {/* Quick Connect Action Box */}
          <div className="rounded-xl border border-brand-violet/20 bg-purple-50/50 p-4">
            <div className="text-xs font-semibold text-brand-violet uppercase tracking-wider mb-2">
              Kết Nối Nhanh 1-Click
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-brand-slate">
                  Phần mềm: <span className="font-semibold text-brand-onyx uppercase">{remoteTool}</span>
                </div>
                <div className="font-mono text-base font-bold text-brand-onyx tracking-wider mt-0.5">
                  {remoteId || "Chưa có ID"}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Sao chép ID"
                  disabled={!remoteId}
                  className="inline-flex items-center justify-center p-2 rounded-lg border border-brand-bone bg-white text-brand-slate hover:text-brand-ink hover:bg-brand-mist disabled:opacity-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!remoteId}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-violet text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở {remoteTool === "teamviewer" ? "TeamViewer" : "AnyDesk"}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSettings} className="space-y-3 pt-2 border-t border-brand-bone">
            <div className="text-xs font-bold text-brand-slate uppercase tracking-wider">
              Cấu Hình & Đổi ID Từ Xa
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Công cụ Remote Desktop
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRemoteTool("anydesk")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    remoteTool === "anydesk"
                      ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500"
                      : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  AnyDesk
                </button>
                <button
                  type="button"
                  onClick={() => setRemoteTool("teamviewer")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    remoteTool === "teamviewer"
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                      : "border-brand-bone bg-white text-brand-slate hover:bg-brand-mist"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  TeamViewer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-ink mb-1">
                Mã Số Kết Nối (AnyDesk / TeamViewer ID)
              </label>
              <input
                type="text"
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
                placeholder="Ví dụ: 123 456 789 hoặc 123456789"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-brand-bone bg-white focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet"
              />
              <p className="mt-1 text-[11px] text-brand-ash">
                Nhân viên có thể đọc 9 chữ số trên màn hình AnyDesk/TeamViewer để IT lưu và kết nối hỗ trợ từ xa.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-brand-bone text-xs font-semibold text-brand-slate hover:bg-brand-mist transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-brand-onyx text-white text-xs font-bold hover:bg-black disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RemoteConnectModal;

