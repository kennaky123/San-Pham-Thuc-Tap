import { Copy, Download, Laptop, Network, Sparkles, Terminal } from "lucide-react";
import { toast } from "react-toastify";
import { getAgentDownloadUrl } from "../../services/usbService.js";

function UsbAgentConnectionBanner({ networkInfo, onSimulateEvent, isSimulating }) {
  const lanList = networkInfo?.lanAddresses || [];
  const primaryServerUrl = networkInfo?.primaryServerUrl || "http://192.168.1.16:5000";
  const primaryWebUrl = networkInfo?.primaryWebUrl || "http://192.168.1.16:5173";

  async function copyToClipboard(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã sao chép ${label}: ${text}`);
    } catch {
      toast.info(`${label}: ${text}`);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-bone p-5 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-violet flex items-center justify-center shrink-0 mt-0.5">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-brand-onyx">
                Trạm Giám Sát Đầu Cuối (Windows USB Agent .EXE & Kết Nối 2 Máy)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Lắng nghe WMI Realtime
              </span>
            </div>
            <p className="text-xs text-brand-slate mt-1">
              Tải và chạy file <code className="font-mono font-bold text-brand-violet bg-purple-50 px-1.5 py-0.5 rounded">ITHelpdeskUSBAgent.exe</code> trên máy nhân viên (Máy 1 hoặc Máy 2 cùng mạng LAN). Khi nhân viên cắm/rút USB, Agent sẽ tự động gửi thông tin phần cứng về Server và phát cảnh báo cho Admin & Technician.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSimulateEvent}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/70 text-brand-violet hover:bg-purple-100 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulating ? "Đang gửi..." : "Test Giả Lập Cắm USB"}</span>
          </button>

          <a
            href={getAgentDownloadUrl()}
            download="ITHelpdeskUSBAgent.exe"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Tải ITHelpdeskUSBAgent.exe</span>
          </a>
        </div>
      </div>

      {/* Multi-machine LAN Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-brand-bone">
        <div className="rounded-xl bg-brand-mist/50 border border-brand-bone p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-brand-slate flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-brand-violet" />
              <span>IP Server nhập vào USB Agent (.exe)</span>
            </div>
            <div className="text-xs font-mono font-bold text-brand-onyx truncate mt-0.5">
              {primaryServerUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(primaryServerUrl, "Địa chỉ Server API")}
            className="p-1.5 rounded-lg border border-brand-bone bg-white text-brand-slate hover:text-brand-violet hover:border-purple-200 transition-colors shrink-0"
            title="Sao chép URL Server"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-xl bg-brand-mist/50 border border-brand-bone p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-brand-slate flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-emerald-600" />
              <span>Địa chỉ mở Web trên Máy thứ 2 (LAN)</span>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-700 truncate mt-0.5">
              {primaryWebUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(primaryWebUrl, "Địa chỉ Web LAN")}
            className="p-1.5 rounded-lg border border-brand-bone bg-white text-brand-slate hover:text-emerald-600 hover:border-emerald-200 transition-colors shrink-0"
            title="Sao chép URL Web LAN"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-xl bg-brand-mist/50 border border-brand-bone p-3">
          <div className="text-[11px] font-semibold text-brand-slate">
            Các card mạng LAN đang lắng nghe ({networkInfo?.serverHostname || "Server"})
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {lanList.length === 0 ? (
              <span className="text-xs font-mono text-brand-onyx">127.0.0.1:5000</span>
            ) : (
              lanList.map((item) => (
                <button
                  key={item.ip}
                  type="button"
                  onClick={() => copyToClipboard(item.ip, `IP ${item.interfaceName}`)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-brand-bone text-[11px] font-mono font-semibold text-brand-onyx hover:border-purple-300 transition-colors"
                  title="Bấm để sao chép IP"
                >
                  <span className="text-brand-slate font-sans">{item.interfaceName}:</span>
                  <span>{item.ip}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsbAgentConnectionBanner;
