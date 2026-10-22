export const KB_ARTICLES = [
  {
    id: "kb-01",
    title: "Hướng dẫn cài đặt và đăng nhập VPN Fortinet & GlobalProtect từ xa",
    category: "Mạng & VPN",
    summary:
      "Các bước kết nối vào mạng nội bộ công ty an toàn qua VPN Fortinet / GlobalProtect khi làm việc tại nhà (WFA).",
    content:
      "1. Tải ứng dụng VPN Fortinet / GlobalProtect tại portal nội bộ: https://vpn.corp.vn\n2. Cổng kết nối (Portal Address): vpn.corp.vn\n3. Đăng nhập bằng email công ty và xác thực mã 2FA trên ứng dụng Microsoft Authenticator.\n4. Nếu gặp lỗi Gateway Unreachable, vui lòng kiểm tra kết nối mạng hoặc thử đổi DNS sang 1.1.1.1.",
    answer:
      "1. Tải ứng dụng VPN Fortinet / GlobalProtect tại portal nội bộ: https://vpn.corp.vn\n2. Cổng kết nối (Portal Address): vpn.corp.vn\n3. Đăng nhập bằng email công ty và xác thực mã 2FA trên ứng dụng Microsoft Authenticator.\n4. Nếu gặp lỗi Gateway Unreachable, vui lòng kiểm tra kết nối mạng hoặc thử đổi DNS sang 1.1.1.1.",
    views: 1420,
  },
  {
    id: "kb-02",
    title: "Cách kết nối máy in văn phòng các tầng qua mạng Wi-Fi",
    category: "Phần cứng",
    summary:
      "Hướng dẫn map địa chỉ IP máy in HP / Canon cho máy tính Windows và macOS.",
    content:
      "1. Đảm bảo laptop đã kết nối đúng Wi-Fi 'Corp-Internal-5G'.\n2. Trên Windows: Mở Settings -> Printers & Scanners -> Add device -> 'The printer that I want isn't listed' -> Add using IP address: 192.168.1.250.\n3. Trên macOS: Mở System Settings -> Printers -> bấm dấu (+) -> chọn tab IP -> Nhập IP 192.168.1.250 với giao thức LPD.",
    answer:
      "1. Đảm bảo laptop đã kết nối đúng Wi-Fi 'Corp-Internal-5G'.\n2. Trên Windows: Mở Settings -> Printers & Scanners -> Add device -> 'The printer that I want isn't listed' -> Add using IP address: 192.168.1.250.\n3. Trên macOS: Mở System Settings -> Printers -> bấm dấu (+) -> chọn tab IP -> Nhập IP 192.168.1.250 với giao thức LPD.",
    views: 980,
  },
  {
    id: "kb-03",
    title: "Tự reset mật khẩu AD (Active Directory) & Microsoft 365 khi bị khóa",
    category: "Tài khoản",
    summary:
      "Quy trình mở khóa tài khoản AD và đặt lại mật khẩu tự phục vụ (SSPR) nhanh chóng mà không cần chờ IT.",
    content:
      "1. Truy cập https://passwordreset.microsoftonline.com hoặc cổng AD SSPR nội bộ.\n2. Nhập email công ty và mã captcha.\n3. Chọn phương thức xác minh qua số điện thoại hoặc app Microsoft Authenticator.\n4. Đặt mật khẩu mới tối thiểu 12 ký tự (gồm chữ hoa, chữ thường, số và ký tự đặc biệt).",
    answer:
      "1. Truy cập https://passwordreset.microsoftonline.com hoặc cổng AD SSPR nội bộ.\n2. Nhập email công ty và mã captcha.\n3. Chọn phương thức xác minh qua số điện thoại hoặc app Microsoft Authenticator.\n4. Đặt mật khẩu mới tối thiểu 12 ký tự (gồm chữ hoa, chữ thường, số và ký tự đặc biệt).",
    views: 2150,
  },
  {
    id: "kb-04",
    title: "Cách cài đặt bộ phần mềm Microsoft Office 365 có bản quyền",
    category: "Phần mềm",
    summary:
      "Hướng dẫn tải và kích hoạt Word, Excel, PowerPoint, Teams trên máy mới.",
    content:
      "1. Mở trình duyệt vào trang https://portal.office.com\n2. Đăng nhập bằng tài khoản email công ty.\n3. Bấm nút 'Install apps' ở góc trên bên phải màn hình.\n4. Chạy file cài đặt và mở một ứng dụng bất kỳ để tự động nhận bản quyền theo tài khoản.",
    answer:
      "1. Mở trình duyệt vào trang https://portal.office.com\n2. Đăng nhập bằng tài khoản email công ty.\n3. Bấm nút 'Install apps' ở góc trên bên phải màn hình.\n4. Chạy file cài đặt và mở một ứng dụng bất kỳ để tự động nhận bản quyền theo tài khoản.",
    views: 1840,
  },
];

export const CANNED_RESPONSES = [
  {
    id: "vpn-steps",
    label: "Hướng dẫn kết nối lại VPN Pulse/GlobalProtect",
    content:
      "Chào anh/chị, em gửi hướng dẫn kết nối lại VPN:\n1. Bấm chuột phải biểu tượng GlobalProtect ở thanh Taskbar -> chọn 'Disable' rồi 'Enable' lại.\n2. Đổi cổng sang 'vpn-backup.corp.vn' nếu cổng chính đang bảo trì.\n3. Nhập mật khẩu và xác nhận phê duyệt trên app Authenticator trên điện thoại.",
  },
  {
    id: "screenshot-request",
    label: "Yêu cầu gửi bổ sung ảnh chụp màn hình thông báo lỗi",
    content:
      "Chào anh/chị, để IT hỗ trợ kiểm tra chính xác, nhờ anh/chị chụp ảnh màn hình toàn bộ thông báo lỗi hiển thị kèm mã số lỗi rồi gửi lại giúp em tại ticket này nhé ạ.",
  },
  {
    id: "pwd-reset-done",
    label: "Đã reset mật khẩu tài khoản và cấp mã OTP tạm",
    content:
      "Chào anh/chị, IT đã reset mật khẩu tạm thời cho tài khoản của anh/chị:\n- Mật khẩu tạm: Password@2026\n- Vui lòng đổi lại mật khẩu cá nhân ngay tại lần đăng nhập đầu tiên.",
  },
  {
    id: "escalated-l3",
    label: "Đã chuyển sự cố sang Chuyên gia Hạ tầng & Mạng (Tier 3)",
    content:
      "Ticket của bạn đã được chuyển tiếp đến đội ngũ Chuyên gia Hạ tầng & Hệ thống (Tier 3) để phân tích log máy chủ. Thời gian phản hồi dự kiến trong vòng 60 phút.",
  },
];

export const NETWORK_NODES = {
  isp: {
    id: "isp",
    name: "Cổng Kết Nối WAN / ISP",
    model: "VNPT Leased Line 1Gbps Duplex",
    ip: "203.162.4.11 / Public Gateway",
    status: "online",
    uptime: "142 ngày liên tục",
    latency: "1.2 ms",
    vlan: "VLAN 0 (Public WAN)",
    details:
      "Kết nối cáp quang trực tiếp tới ISP VNPT, BGP peering active. Băng thông hiện tại: 342 Mbps / 1000 Mbps.",
    connectedTickets: [],
  },
  firewall: {
    id: "firewall",
    name: "Tường Lửa Biên (NextGen Firewall)",
    model: "Palo Alto Networks PA-3220",
    ip: "192.168.1.1 (Internal Gateway)",
    status: "online",
    uptime: "98 ngày",
    latency: "0.8 ms",
    vlan: "Trunk (VLAN 10, 20, 30, 50, 99)",
    details:
      "Quản lý phiên VPN GlobalProtect, NAT và IPS/IDS. Phiên VPN đang hoạt động: 64 users.",
    connectedTickets: [
      { code: "TK-1082", title: "Lỗi kết nối GlobalProtect VPN từ xa" },
    ],
  },
  "core-switch": {
    id: "core-switch",
    name: "Core Switch Trung Tâm",
    model: "Cisco Catalyst 9500-48Y4C",
    ip: "192.168.1.2",
    status: "online",
    uptime: "210 ngày",
    latency: "0.2 ms",
    vlan: "VLAN Trunking 802.1Q (40Gbps Uplinks)",
    details:
      "Switch xương sống tòa nhà, định tuyến L3 cho toàn bộ các subnet nội bộ. Tải CPU: 18%, RAM: 34%.",
    connectedTickets: [],
  },
  "server-dmz": {
    id: "server-dmz",
    name: "Cụm Máy Chủ Server Farm (DMZ)",
    model: "Dell PowerEdge R750 Cluster (3 Nodes)",
    ip: "10.0.50.0/24",
    status: "online",
    uptime: "320 ngày",
    latency: "0.4 ms",
    vlan: "VLAN 50 (Server DMZ)",
    details:
      "Lưu trữ Active Directory DC01, Domain Controller, DNS nội bộ và ERP SAP. Dung lượng lưu trữ còn trống: 4.8 TB.",
    connectedTickets: [],
  },
  "sw-floor1": {
    id: "sw-floor1",
    name: "Access Switch Tầng 1 (Kinh Doanh)",
    model: "Cisco Catalyst 9200-48P PoE+",
    ip: "192.168.10.1",
    status: "online",
    uptime: "45 ngày",
    latency: "1.1 ms",
    vlan: "VLAN 10 (Sales & Reception)",
    details:
      "Cấp nguồn PoE cho 3 AP Wi-Fi và 35 điện thoại IP Cisco. Cổng hoạt động: 41/48 cổng. Tải CPU: 22%.",
    connectedTickets: [],
  },
  "sw-floor2": {
    id: "sw-floor2",
    name: "Access Switch Tầng 2 (Kỹ Thuật & Dev)",
    model: "Cisco Catalyst 9300-48UXM mGig",
    ip: "192.168.20.1",
    status: "online",
    uptime: "52 ngày",
    latency: "0.9 ms",
    vlan: "VLAN 20 (Engineering & R&D)",
    details:
      "Cổng mGig 2.5Gbps cấp mạng tốc độ cao cho đội Dev build code. Tải CPU: 38%. Cổng hoạt động: 46/48.",
    connectedTickets: [
      { code: "TK-1081", title: "Cấp quyền truy cập kho mã nguồn GitLab" },
    ],
  },
  "sw-floor3": {
    id: "sw-floor3",
    name: "Access Switch Tầng 3 (Kế Toán & Marketing)",
    model: "Cisco Catalyst 9200-48P",
    ip: "192.168.30.1",
    status: "warning",
    uptime: "12 ngày",
    latency: "28.5 ms (Cao)",
    vlan: "VLAN 30 (Finance & Marketing)",
    details:
      "⚠️ CẢNH BÁO: Tải CPU đạt 91% do bão gói tin phát quảng bá (Broadcast Storm) từ cổng số 24. Xuất hiện hiện tượng rớt gói 8%.",
    connectedTickets: [
      { code: "TK-1080", title: "Máy trạm tầng 3 lỗi kết nối & BSOD" },
      { code: "TK-1079", title: "Máy in HP tầng 3 offline mạng LAN" },
    ],
  },
  "ap-floor1": {
    id: "ap-floor1",
    name: "Điểm Truy Cập Wi-Fi 6 Tầng 1",
    model: "Cisco Catalyst 9120AX Series",
    ip: "192.168.10.15",
    status: "online",
    uptime: "45 ngày",
    latency: "2.1 ms",
    vlan: "VLAN 10",
    details: "Hoạt động ổn định trên băng tần 5GHz, 42 thiết bị đang kết nối.",
    connectedTickets: [],
  },
  "endpoints-floor1": {
    id: "endpoints-floor1",
    name: "Nhóm Máy Trạm Tầng 1 (Kinh Doanh)",
    model: "38 Laptops & Desktops",
    ip: "192.168.10.50 - .120",
    status: "online",
    uptime: "Đang hoạt động",
    latency: "1.5 ms",
    vlan: "VLAN 10",
    details: "100% thiết bị đã bật trình bảo mật EDR SentinelOne v23.4.",
    connectedTickets: [],
  },
  "ap-floor2": {
    id: "ap-floor2",
    name: "Điểm Truy Cập Wi-Fi 6E Tầng 2",
    model: "Cisco Catalyst 9136I Series",
    ip: "192.168.20.15",
    status: "online",
    uptime: "52 ngày",
    latency: "1.8 ms",
    vlan: "VLAN 20",
    details: "Cấp phát kết nối không dây cho 58 thiết bị đội ngũ Kỹ thuật & R&D.",
    connectedTickets: [],
  },
  "endpoints-floor2": {
    id: "endpoints-floor2",
    name: "Nhóm Máy Trạm Tầng 2 (Dev Team)",
    model: "52 MacBook Pro & Dell XPS",
    ip: "192.168.20.30 - .150",
    status: "online",
    uptime: "Đang hoạt động",
    latency: "1.2 ms",
    vlan: "VLAN 20",
    details: "Kết nối thông suốt tới cụm GitLab và CI/CD Runner nội bộ.",
    connectedTickets: [],
  },
  "ap-floor3": {
    id: "ap-floor3",
    name: "Điểm Truy Cập Wi-Fi 6 Tầng 3",
    model: "Cisco Catalyst 9120AX Series",
    ip: "192.168.30.15",
    status: "warning",
    uptime: "8 ngày",
    latency: "35 ms",
    vlan: "VLAN 30",
    details:
      "Kết nối tới switch tầng 3, đang có 58 thiết bị laptop kết nối khiến băng thông tần số 5GHz bị nghẽn.",
    connectedTickets: [
      { code: "TK-1080", title: "Tín hiệu mạng chập chờn khu vực Tầng 3" },
    ],
  },
  "printer-floor3": {
    id: "printer-floor3",
    name: "Máy In HP LaserJet Tầng 3 (#TK-1079)",
    model: "HP LaserJet Enterprise M507",
    ip: "192.168.30.250",
    status: "warning",
    uptime: "Offline 2h",
    latency: "Timeout",
    vlan: "VLAN 30 (hoặc VLAN 99)",
    details:
      "Đang mất kết nối mạng LAN do port switch tầng 3 bị gián đoạn. Kèm thông báo kẹt khay giấy số 2.",
    connectedTickets: [
      { code: "TK-1079", title: "Máy in tầng 3 báo lỗi kẹt giấy và offline LAN" },
    ],
  },
};

export const VLAN_SUBNETS = [
  {
    id: "VLAN 10",
    name: "Phòng Kinh Doanh & Tầng 1",
    cidr: "192.168.10.0/24",
    gateway: "192.168.10.1",
    dhcp: ".50 - .240 (190 IP)",
    usage: "62%",
    usageDetail: "(118/190)",
    status: "normal",
    statusLabel: "Bình Thường",
  },
  {
    id: "VLAN 20",
    name: "Kỹ Thuật R&D & Tầng 2",
    cidr: "192.168.20.0/24",
    gateway: "192.168.20.1",
    dhcp: ".30 - .250 (220 IP)",
    usage: "75%",
    usageDetail: "(165/220)",
    status: "normal",
    statusLabel: "Bình Thường",
  },
  {
    id: "VLAN 30",
    name: "Kế Toán, Marketing & Tầng 3",
    cidr: "192.168.30.0/24",
    gateway: "192.168.30.1",
    dhcp: ".50 - .220 (170 IP)",
    usage: "92%",
    usageDetail: "(156/170)",
    status: "warning",
    statusLabel: "Cảnh Báo Tải",
  },
  {
    id: "VLAN 50",
    name: "Server Farm & DMZ Services",
    cidr: "10.0.50.0/24",
    gateway: "10.0.50.1",
    dhcp: "Static IP Reserved",
    usage: "45%",
    usageDetail: "(45/100)",
    status: "normal",
    statusLabel: "Ổn Định",
  },
  {
    id: "VLAN 99",
    name: "Máy In & IoT Văn Phòng",
    cidr: "192.168.99.0/24",
    gateway: "192.168.99.1",
    dhcp: ".10 - .150 (140 IP)",
    usage: "30%",
    usageDetail: "(42/140)",
    status: "normal",
    statusLabel: "Bình Thường",
  },
];

const ASSET_PROFILES = [
  {
    model: "MacBook Pro M2 14-inch (2023)",
    assetPrefix: "IT-MBP-2023",
    os: "macOS Sequoia 15.0.1",
    ipPrefix: "192.168.10.",
    antivirus: "SentinelOne v23.4 (Active)",
    location: "Tầng 4, Tòa Nhà Alpha",
  },
  {
    model: "Dell XPS 15 9530",
    assetPrefix: "IT-DELL-2024",
    os: "Ubuntu 24.04 LTS",
    ipPrefix: "192.168.20.",
    antivirus: "CrowdStrike Falcon (Active)",
    location: "Tầng 2, Khu R&D",
  },
  {
    model: "ThinkPad P16 Gen 2 (Workstation)",
    assetPrefix: "IT-TP-2023",
    os: "Windows 11 Pro 23H2",
    ipPrefix: "192.168.30.",
    antivirus: "SentinelOne EDR (Active)",
    location: "Tầng 3, Phòng Kế Toán & Marketing",
  },
  {
    model: "ThinkPad T14 Gen 4",
    assetPrefix: "IT-TP-2024",
    os: "Windows 11 Enterprise",
    ipPrefix: "192.168.10.",
    antivirus: "SentinelOne v23.4 (Active)",
    location: "Tầng 1, Khu Kinh Doanh",
  },
];

export function getAssetTelemetryForTicket(ticket) {
  const codeStr = String(ticket?.ticketCode || ticket?._id || "1082");
  let hash = 0;
  for (let i = 0; i < codeStr.length; i += 1) {
    hash = (hash * 31 + codeStr.charCodeAt(i)) % 1000;
  }
  const profile = ASSET_PROFILES[hash % ASSET_PROFILES.length];
  const hostNum = 20 + (hash % 210);
  const tagNum = String(10 + (hash % 89)).padStart(3, "0");

  return {
    model: profile.model,
    assetTag: `${profile.assetPrefix}-${tagNum}`,
    os: profile.os,
    ip: `${profile.ipPrefix}${hostNum}`,
    antivirus: profile.antivirus,
    location: profile.location,
  };
}

export function getSlaDisplayForTicket(ticket) {
  if (!ticket) {
    return { type: "normal", text: "Còn 2h 00m" };
  }
  if (["resolved", "closed"].includes(ticket.status)) {
    return { type: "met", text: "Đạt SLA" };
  }
  if (ticket.status === "cancelled") {
    return { type: "cancelled", text: "Đã hủy" };
  }
  if (ticket.priority === "urgent") {
    return { type: "breach-risk", text: "Còn 18m" };
  }
  if (ticket.priority === "high") {
    return { type: "warning", text: "Còn 45m" };
  }
  if (ticket.priority === "medium") {
    return { type: "normal", text: "Còn 2h 30m" };
  }
  return { type: "normal", text: "Còn 4h 15m" };
}

