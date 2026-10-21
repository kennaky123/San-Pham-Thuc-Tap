import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Cpu,
  Network,
  Play,
  RefreshCw,
  Table,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NETWORK_NODES, VLAN_SUBNETS } from "../data/itsmData.js";
import useAuth from "../hooks/useAuth.js";

function NetworkTopologyPage() {
  const [selectedNodeId, setSelectedNodeId] = useState("sw-floor3");
  const [vlanModalOpen, setVlanModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const node = NETWORK_NODES[selectedNodeId] ?? NETWORK_NODES["sw-floor3"];

  function handleGlobalPing() {
    toast.success(
      "Đang quét ICMP toàn bộ 12 node trong mạng Campus... Tất cả gateway phản hồi tốt!",
    );
  }

  function handlePingNode(ip) {
    toast.success(
      `Ping ${ip}: 5 packets transmitted, 0% packet loss, avg rtt = 1.4ms`,
    );
  }

  function handleBouncePort(nodeName) {
    toast.info(
      `Đã gửi lệnh SSH bounce cổng switch trên ${nodeName}. Chờ đồng bộ 10s...`,
    );
  }

  function handleNavigateToTickets() {
    if (user?.role === "admin") {
      navigate("/admin/tickets");
    } else if (user?.role === "technician") {
      navigate("/technician/tickets/assigned");
    } else {
      navigate("/user/tickets");
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-brand-mist">
      {/* Top Alert Banner: AIOps Incident Correlation */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-bold">
            Tương Quan Sự Cố Tự Động (AIOps Incident Clustering):
          </span>
          <span>
            Phát hiện 2 ticket (#TK-1079, #TK-1080) cùng kết nối qua{" "}
            <strong>Access Switch Tầng 3 (IP: 192.168.30.1)</strong> đang có tải
            CPU bất thường (91%).
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedNodeId("sw-floor3")}
          className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 rounded-md font-semibold text-amber-900 transition-colors shrink-0"
        >
          Xem Node Tầng 3
        </button>
      </div>

      {/* Topology Toolbar & Diagnostics */}
      <div className="bg-white border-b border-brand-bone px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-brand-onyx">
              Sơ Đồ Mạng Nội Bộ (Campus Network)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              12 Nodes Online
            </span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              1 Node Cảnh Báo
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-brand-bone" />
          <div className="hidden md:flex items-center gap-3 text-brand-slate text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hoạt
              động bình thường
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tải cao
              / Suy giảm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Mất kết
              nối (Down)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGlobalPing}
            className="px-3 py-1.5 rounded-full bg-brand-mist hover:bg-brand-bone border border-brand-bone text-xs font-medium text-brand-ink flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-brand-blue" />
            Quét Ping Toàn Mạng (ICMP Sweep)
          </button>
          <button
            type="button"
            onClick={() => setVlanModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-brand-ink hover:bg-brand-carbon text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Table className="w-3.5 h-3.5" />
            Bảng Phân Vùng VLAN
          </button>
        </div>
      </div>

      {/* Main Topology Interactive SVG Canvas Area + Right Inspector Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
        {/* Interactive Topology SVG Container */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 flex items-center justify-center bg-white relative">
          <svg
            className="w-full max-w-5xl h-[520px] sm:h-[560px]"
            viewBox="0 0 960 540"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* CONNECTIONS (WIRES) */}
            <line
              x1="120"
              y1="260"
              x2="260"
              y2="260"
              stroke="#0091ff"
              strokeWidth="3"
              className="flow-normal"
            />
            <line
              x1="260"
              y1="260"
              x2="440"
              y2="260"
              stroke="#6647f0"
              strokeWidth="4"
              className="flow-normal"
            />
            <line
              x1="440"
              y1="260"
              x2="440"
              y2="110"
              stroke="#10b981"
              strokeWidth="2.5"
              className="flow-normal"
            />
            <line
              x1="440"
              y1="260"
              x2="620"
              y2="140"
              stroke="#10b981"
              strokeWidth="2.5"
              className="flow-normal"
            />
            <line
              x1="440"
              y1="260"
              x2="620"
              y2="260"
              stroke="#10b981"
              strokeWidth="2.5"
              className="flow-normal"
            />
            <line
              x1="440"
              y1="260"
              x2="620"
              y2="380"
              stroke="#f59e0b"
              strokeWidth="3"
              className="flow-warning"
            />

            {/* Switches to Endpoints */}
            <line
              x1="620"
              y1="140"
              x2="800"
              y2="110"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1="620"
              y1="140"
              x2="800"
              y2="170"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1="620"
              y1="260"
              x2="800"
              y2="230"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1="620"
              y1="260"
              x2="800"
              y2="290"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1="620"
              y1="380"
              x2="800"
              y2="350"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <line
              x1="620"
              y1="380"
              x2="800"
              y2="410"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* 1. ISP Gateway */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("isp")}
            >
              <rect
                x="70"
                y="225"
                width="100"
                height="70"
                rx="14"
                fill="#ffffff"
                stroke={selectedNodeId === "isp" ? "#0091ff" : "#e2e8f0"}
                strokeWidth={selectedNodeId === "isp" ? "2.5" : "2"}
              />
              <circle cx="120" cy="248" r="14" fill="#eff6ff" />
              <text
                x="120"
                y="252"
                fontFamily="Inter"
                fontSize="12"
                fontWeight="bold"
                fill="#1d4ed8"
                textAnchor="middle"
              >
                WAN
              </text>
              <text
                x="120"
                y="278"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="600"
                fill="#0f172a"
                textAnchor="middle"
              >
                VNPT Leased Line
              </text>
              <text
                x="120"
                y="289"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#64748b"
                textAnchor="middle"
              >
                1Gbps / 203.162.x.x
              </text>
            </g>

            {/* 2. NextGen Firewall (Palo Alto) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("firewall")}
            >
              <rect
                x="210"
                y="220"
                width="110"
                height="80"
                rx="14"
                fill="#ffffff"
                stroke={selectedNodeId === "firewall" ? "#6647f0" : "#e2e8f0"}
                strokeWidth={selectedNodeId === "firewall" ? "2.5" : "2"}
              />
              <circle cx="265" cy="245" r="14" fill="#ede9fe" />
              <text
                x="265"
                y="249"
                fontFamily="Inter"
                fontSize="12"
                fontWeight="bold"
                fill="#6647f0"
                textAnchor="middle"
              >
                FW
              </text>
              <text
                x="265"
                y="275"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="bold"
                fill="#0f172a"
                textAnchor="middle"
              >
                Palo Alto PA-3220
              </text>
              <text
                x="265"
                y="287"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#64748b"
                textAnchor="middle"
              >
                IP: 192.168.1.1
              </text>
              <circle cx="308" cy="232" r="4" fill="#10b981" />
            </g>

            {/* 3. Server Farm (DMZ) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("server-dmz")}
            >
              <rect
                x="385"
                y="70"
                width="110"
                height="75"
                rx="14"
                fill="#ffffff"
                stroke={selectedNodeId === "server-dmz" ? "#059669" : "#e2e8f0"}
                strokeWidth={selectedNodeId === "server-dmz" ? "2.5" : "2"}
              />
              <text
                x="440"
                y="95"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="bold"
                fill="#0f172a"
                textAnchor="middle"
              >
                Server Farm (VLAN 50)
              </text>
              <text
                x="440"
                y="110"
                fontFamily="Inter"
                fontSize="9"
                fill="#059669"
                textAnchor="middle"
              >
                AD / DNS / ERP Server
              </text>
              <text
                x="440"
                y="125"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#64748b"
                textAnchor="middle"
              >
                10.0.50.0/24
              </text>
              <circle cx="483" cy="82" r="4" fill="#10b981" />
            </g>

            {/* 4. Core Switch (Cisco 9500 40G) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("core-switch")}
            >
              <rect
                x="380"
                y="215"
                width="120"
                height="90"
                rx="16"
                fill="#0f172a"
                stroke={selectedNodeId === "core-switch" ? "#6647f0" : "#334155"}
                strokeWidth="2.5"
              />
              <text
                x="440"
                y="245"
                fontFamily="Inter"
                fontSize="11"
                fontWeight="bold"
                fill="#ffffff"
                textAnchor="middle"
              >
                CORE SWITCH
              </text>
              <text
                x="440"
                y="262"
                fontFamily="Inter"
                fontSize="9"
                fill="#94a3b8"
                textAnchor="middle"
              >
                Cisco Catalyst 9500
              </text>
              <text
                x="440"
                y="278"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fontWeight="bold"
                fill="#6ee7b7"
                textAnchor="middle"
              >
                40G Trunk Uplinks
              </text>
              <circle cx="488" cy="227" r="4" fill="#10b981" />
            </g>

            {/* 5. Access Switch Floor 1 */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("sw-floor1")}
            >
              <rect
                x="560"
                y="105"
                width="120"
                height="70"
                rx="12"
                fill="#ffffff"
                stroke={selectedNodeId === "sw-floor1" ? "#0091ff" : "#e2e8f0"}
                strokeWidth="2"
              />
              <text
                x="620"
                y="128"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="bold"
                fill="#0f172a"
                textAnchor="middle"
              >
                Switch Tầng 1 (VLAN 10)
              </text>
              <text
                x="620"
                y="143"
                fontFamily="Inter"
                fontSize="9"
                fill="#64748b"
                textAnchor="middle"
              >
                Kinh Doanh & Lễ Tân
              </text>
              <text
                x="620"
                y="158"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#1d4ed8"
                textAnchor="middle"
              >
                192.168.10.1 (48p)
              </text>
              <circle cx="668" cy="117" r="4" fill="#10b981" />
            </g>

            {/* 6. Access Switch Floor 2 */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("sw-floor2")}
            >
              <rect
                x="560"
                y="225"
                width="120"
                height="70"
                rx="12"
                fill="#ffffff"
                stroke={selectedNodeId === "sw-floor2" ? "#0091ff" : "#e2e8f0"}
                strokeWidth="2"
              />
              <text
                x="620"
                y="248"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="bold"
                fill="#0f172a"
                textAnchor="middle"
              >
                Switch Tầng 2 (VLAN 20)
              </text>
              <text
                x="620"
                y="263"
                fontFamily="Inter"
                fontSize="9"
                fill="#64748b"
                textAnchor="middle"
              >
                Kỹ Thuật & Dev Team
              </text>
              <text
                x="620"
                y="278"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#1d4ed8"
                textAnchor="middle"
              >
                192.168.20.1 (48p)
              </text>
              <circle cx="668" cy="237" r="4" fill="#10b981" />
            </g>

            {/* 7. Access Switch Floor 3 (ALARM / WARNING) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedNodeId("sw-floor3")}
            >
              <rect
                x="560"
                y="345"
                width="120"
                height="75"
                rx="12"
                fill="#fffbeb"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              <text
                x="620"
                y="368"
                fontFamily="Inter"
                fontSize="10"
                fontWeight="bold"
                fill="#b45309"
                textAnchor="middle"
              >
                Switch Tầng 3 (VLAN 30)
              </text>
              <text
                x="620"
                y="383"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="bold"
                fill="#dc2626"
                textAnchor="middle"
              >
                ⚠️ CPU 91% • Packet Loss 8%
              </text>
              <text
                x="620"
                y="398"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fill="#b45309"
                textAnchor="middle"
              >
                192.168.30.1 (Liên quan 2 ticket)
              </text>
              <circle
                cx="668"
                cy="357"
                r="5"
                fill="#ef4444"
                className="animate-pulse"
              />
            </g>

            {/* Endpoints Floor 1 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("ap-floor1")}
            >
              <rect
                x="740"
                y="95"
                width="130"
                height="35"
                rx="8"
                fill="#f8fafc"
                stroke="#e2e8f0"
              />
              <text
                x="805"
                y="117"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="600"
                fill="#334155"
                textAnchor="middle"
              >
                📶 Wi-Fi AP-01 (42 Clients)
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("endpoints-floor1")}
            >
              <rect
                x="740"
                y="150"
                width="130"
                height="35"
                rx="8"
                fill="#f8fafc"
                stroke="#e2e8f0"
              />
              <text
                x="805"
                y="172"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="600"
                fill="#334155"
                textAnchor="middle"
              >
                💻 38 Laptops / PC
              </text>
            </g>

            {/* Endpoints Floor 2 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("ap-floor2")}
            >
              <rect
                x="740"
                y="215"
                width="130"
                height="35"
                rx="8"
                fill="#f8fafc"
                stroke="#e2e8f0"
              />
              <text
                x="805"
                y="237"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="600"
                fill="#334155"
                textAnchor="middle"
              >
                📶 Wi-Fi AP-02 (58 Clients)
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("endpoints-floor2")}
            >
              <rect
                x="740"
                y="270"
                width="130"
                height="35"
                rx="8"
                fill="#f8fafc"
                stroke="#e2e8f0"
              />
              <text
                x="805"
                y="292"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="600"
                fill="#334155"
                textAnchor="middle"
              >
                💻 52 Laptops Dev Team
              </text>
            </g>

            {/* Endpoints Floor 3 (Affected) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("ap-floor3")}
            >
              <rect
                x="740"
                y="335"
                width="130"
                height="35"
                rx="8"
                fill="#fef2f2"
                stroke="#fca5a5"
              />
              <text
                x="805"
                y="357"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="bold"
                fill="#b91c1c"
                textAnchor="middle"
              >
                ⚠️ Wi-Fi AP-03 (Chập chờn)
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId("printer-floor3")}
            >
              <rect
                x="740"
                y="390"
                width="130"
                height="35"
                rx="8"
                fill="#fef2f2"
                stroke="#fca5a5"
              />
              <text
                x="805"
                y="412"
                fontFamily="Inter"
                fontSize="9"
                fontWeight="bold"
                fill="#b91c1c"
                textAnchor="middle"
              >
                🖨️ Máy In HP (#TK-1079)
              </text>
            </g>
          </svg>
        </div>

        {/* Right Side: Node Inspector / Diagnostics Drawer (340px) */}
        <aside className="w-full lg:w-84 border-t lg:border-t-0 lg:border-l border-brand-bone bg-white flex flex-col shrink-0 p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-brand-bone">
            <div className="font-display font-bold text-xs uppercase tracking-wider text-brand-slate flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-violet" />
              Thông Tin Thiết Bị Mạng
            </div>
            {node.status === "warning" ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Cảnh Báo
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-brand-ash uppercase tracking-wider font-semibold">
                Tên Thiết Bị
              </div>
              <div className="font-bold text-sm text-brand-onyx mt-0.5">
                {node.name}
              </div>
              <div className="text-xs text-brand-slate font-medium">
                {node.model}
              </div>
            </div>

            <div className="p-3 bg-brand-mist rounded-xl border border-brand-bone space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-ash">Địa Chỉ IP:</span>
                <span className="font-mono font-bold text-brand-ink">
                  {node.ip}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-ash">VLAN Gán:</span>
                <span className="font-mono text-brand-violet">{node.vlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-ash">Độ Trễ (Latency):</span>
                <span
                  className={`font-mono font-bold ${
                    node.status === "warning"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {node.latency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-ash">Thời Gian Hoạt Động:</span>
                <span className="text-brand-ink font-mono">{node.uptime}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-brand-ash uppercase tracking-wider font-semibold mb-1">
                Chẩn Đoán & Tình Trạng
              </div>
              <div className="text-xs text-brand-ink leading-relaxed p-3 rounded-xl bg-white border border-brand-bone shadow-xs">
                {node.details}
              </div>
            </div>

            {node.connectedTickets?.length > 0 ? (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  Có {node.connectedTickets.length} ticket liên quan tới node
                  này:
                </div>
                <div className="mt-1.5 space-y-1">
                  {node.connectedTickets.map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={handleNavigateToTickets}
                      className="text-[11px] text-brand-blue hover:underline block text-left font-mono"
                    >
                      • {t.code}: {t.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handlePingNode(node.ip)}
                className="w-full py-2 bg-brand-mist hover:bg-brand-bone text-brand-ink rounded-xl border border-brand-bone text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-brand-blue" />
                Chạy Ping Kiểm Tra Node Này
              </button>
              <button
                type="button"
                onClick={() => handleBouncePort(node.name)}
                className="w-full py-2 bg-brand-mist hover:bg-brand-bone text-brand-ink rounded-xl border border-brand-bone text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                Khởi Động Lại Cổng Switch (Port Bounce)
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: VLAN & Subnet Architecture Table */}
      {vlanModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-6">
          <div className="bg-white rounded-2xl border border-brand-bone w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-brand-bone flex items-center justify-between bg-brand-mist">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center font-bold">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-brand-onyx">
                    Bảng Thiết Kế Phân Vùng VLAN & Dải Mạng Subnet
                  </h3>
                  <p className="text-xs text-brand-slate">
                    Quy hoạch IP, Default Gateway và tình trạng cấp phát DHCP
                    nội bộ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVlanModalOpen(false)}
                className="text-brand-ash hover:text-brand-ink p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-mist border-b border-brand-bone text-[11px] font-bold text-brand-slate uppercase">
                  <tr>
                    <th className="px-3 py-2.5">VLAN ID</th>
                    <th className="px-3 py-2.5">Tên Phân Vùng</th>
                    <th className="px-3 py-2.5 font-mono">Dải Mạng (CIDR)</th>
                    <th className="px-3 py-2.5 font-mono">Default Gateway</th>
                    <th className="px-3 py-2.5">Phạm Vi Cấp DHCP</th>
                    <th className="px-3 py-2.5">Tỷ Lệ Đã Dùng</th>
                    <th className="px-3 py-2.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-bone">
                  {VLAN_SUBNETS.map((vlan) => (
                    <tr
                      key={vlan.id}
                      className={
                        vlan.status === "warning"
                          ? "bg-amber-50/40 hover:bg-amber-50/70"
                          : "hover:bg-brand-mist/50"
                      }
                    >
                      <td
                        className={`px-3 py-2.5 font-mono font-bold ${
                          vlan.status === "warning"
                            ? "text-amber-700"
                            : "text-brand-violet"
                        }`}
                      >
                        {vlan.id}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-brand-ink">
                        {vlan.name}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-brand-slate">
                        {vlan.cidr}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-brand-slate">
                        {vlan.gateway}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-brand-ash">
                        {vlan.dhcp}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`font-bold ${
                            vlan.status === "warning"
                              ? "text-amber-700"
                              : "text-emerald-600"
                          }`}
                        >
                          {vlan.usage}
                        </span>{" "}
                        {vlan.usageDetail}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vlan.status === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {vlan.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-brand-mist border-t border-brand-bone flex justify-end">
              <button
                type="button"
                onClick={() => setVlanModalOpen(false)}
                className="px-4 py-2 bg-brand-ink text-white rounded-full text-xs font-semibold"
              >
                Đóng Bảng VLAN
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NetworkTopologyPage;

