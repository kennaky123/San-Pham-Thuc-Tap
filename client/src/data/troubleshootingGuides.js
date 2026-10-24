export const TROUBLESHOOTING_GUIDES_BY_CATEGORY = {
  // 1. Mạng Internet, Wi-Fi, VPN
  "mang-internet": {
    categoryName: "Mạng Internet & VPN",
    guides: [
      {
        id: "net-01",
        title: "Xóa Cache DNS & Cấp Lại Địa Chỉ IP Mới (Flush DNS & Renew IP)",
        summary: "Khắc phục sự cố mạng bị chấm than vàng, báo No Internet hoặc không vào được web nội bộ.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["mạng", "internet", "wifi", "ip", "dns", "không vào được", "chậm", "lag", "rớt mạng"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở Command Prompt (cmd) với quyền Quản trị",
            detail: "Nhấn phím Windows, gõ 'cmd', chuột phải chọn 'Run as administrator'.",
          },
          {
            stepNumber: 2,
            title: "Xóa bộ nhớ đệm DNS cũ",
            detail: "Nhập lệnh sau và nhấn Enter:",
            command: "ipconfig /flushdns",
          },
          {
            stepNumber: 3,
            title: "Yêu cầu cấp lại IP mới từ Router",
            detail: "Nhập tiếp lệnh sau và nhấn Enter:",
            command: "ipconfig /renew",
          },
        ],
      },
      {
        id: "net-02",
        title: "Khắc Phục Kết Nối VPN Bị Ngắt Hoặc Lỗi Gateway Unreachable",
        summary: "Các bước kết nối lại VPN Fortinet / GlobalProtect khi làm việc từ xa.",
        timeToFix: "2 phút",
        difficulty: "Dễ",
        keywords: ["vpn", "từ xa", "remote", "globalprotect", "fortinet", "gateway", "bảo trì"],
        steps: [
          {
            stepNumber: 1,
            title: "Ngắt kết nối phiên VPN hiện tại",
            detail: "Chuột phải vào biểu tượng VPN dưới góc phải màn hình, chọn 'Disconnect'. Đợi 10 giây.",
          },
          {
            stepNumber: 2,
            title: "Chuyển sang Cổng dự phòng (Backup Gateway)",
            detail: "Nếu cổng chính vpn.corp.vn báo lỗi, đổi địa chỉ Portal thành vpn-backup.corp.vn.",
            command: "vpn-backup.corp.vn",
          },
          {
            stepNumber: 3,
            title: "Xác thực mã 2FA trên điện thoại",
            detail: "Mở app Microsoft Authenticator hoặc SMS để phê duyệt đăng nhập trong vòng 60 giây.",
          },
        ],
      },
      {
        id: "net-03",
        title: "Quên Mạng Wi-Fi & Kết Nối Lại Wi-Fi Văn Phòng",
        summary: "Khắc phục lỗi mật khẩu Wi-Fi bị từ chối hoặc máy tính không tự nhận sóng.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["wifi", "wi-fi", "sóng", "mật khẩu", "quên mạng", "forget"],
        steps: [
          {
            stepNumber: 1,
            title: "Quên mạng Wi-Fi công ty đã lưu",
            detail: "Vào Cài đặt (Settings) -> Network & Internet -> Wi-Fi -> Manage known networks -> Chọn Wi-Fi 'Corp-Internal' -> Bấm 'Forget'.",
          },
          {
            stepNumber: 2,
            title: "Tắt Wi-Fi 5 giây và bật lại",
            detail: "Tắt nút Wi-Fi trên thanh Taskbar 5 giây rồi bật lại để card mạng quét lại tần số 5GHz.",
          },
          {
            stepNumber: 3,
            title: "Kết nối lại và nhập mật khẩu văn phòng",
            detail: "Chọn lại Wi-Fi 'Corp-Internal-5G' và đăng nhập bằng tài khoản email công ty.",
          },
        ],
      },
    ],
  },

  // 2. Phần mềm
  "phan-mem": {
    categoryName: "Phần Mềm & Ứng Dụng",
    guides: [
      {
        id: "soft-01",
        title: "Đóng Ứng Dụng Bị Treo & Khởi Động Lại Sạch Sẽ (Task Manager)",
        summary: "Xử lý triệt để phần mềm bị đơ 'Not Responding' mà không cần khởi động lại cả máy.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["treo", "đơ", "not responding", "crash", "bị văng", "không phản hồi", "đứng"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở trình quản lý tác vụ Task Manager",
            detail: "Nhấn tổ hợp phím tắt Ctrl + Shift + Esc trên bàn phím.",
          },
          {
            stepNumber: 2,
            title: "Tìm và buộc dừng ứng dụng lỗi",
            detail: "Tìm ứng dụng đang bị treo trong danh sách (Apps) -> Chuột phải và chọn 'End Task'.",
          },
          {
            stepNumber: 3,
            title: "Khởi động lại với quyền Administrator",
            detail: "Chuột phải vào icon phần mềm trên màn hình Desktop -> Chọn 'Run as administrator'.",
          },
        ],
      },
      {
        id: "soft-02",
        title: "Sửa Lỗi Đồng Bộ & Bản Quyền Microsoft 365 (Office / Outlook / Teams)",
        summary: "Khắc phục lỗi Outlook không tải thư mới hoặc Office báo 'Unlicensed Product'.",
        timeToFix: "2 phút",
        difficulty: "Trung bình",
        keywords: ["office", "excel", "word", "outlook", "teams", "microsoft", "bản quyền", "hết hạn", "mail"],
        steps: [
          {
            stepNumber: 1,
            title: "Kiểm tra đăng nhập tài khoản công ty",
            detail: "Trong Word/Excel, vào File -> Account -> Kiểm tra xem tài khoản email công ty đã hiển thị chưa. Nếu báo lỗi, bấm 'Sign out' rồi 'Sign in' lại.",
          },
          {
            stepNumber: 2,
            title: "Chạy tính năng Sửa nhanh (Quick Repair)",
            detail: "Mở Control Panel -> Programs and Features -> Chọn 'Microsoft 365 Apps' -> Bấm 'Change' -> Chọn 'Quick Repair' -> Bấm Repair.",
          },
          {
            stepNumber: 3,
            title: "Cập nhật bản mới nhất",
            detail: "Trong Word, vào File -> Account -> Update Options -> Bấm 'Update Now'.",
          },
        ],
      },
      {
        id: "soft-03",
        title: "Dọn Dẹp Bộ Nhớ Đệm & Tệp Tạm Thời (%temp%)",
        summary: "Giải phóng dung lượng và xử lý xung đột tệp tin tạm của phần mềm kế toán, ERP.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["chậm", "đầy ổ", "tệp rác", "cache", "temp", "kế toán", "erp"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở hộp thoại Run",
            detail: "Nhấn tổ hợp phím Windows + R trên bàn phím.",
          },
          {
            stepNumber: 2,
            title: "Truy cập thư mục Temp",
            detail: "Nhập lệnh sau và nhấn Enter:",
            command: "%temp%",
          },
          {
            stepNumber: 3,
            title: "Xóa các tệp tạm",
            detail: "Nhấn Ctrl + A để chọn tất cả -> Nhấn Delete (nếu có file đang dùng báo bận thì bấm 'Skip').",
          },
        ],
      },
    ],
  },

  // 3. Phần cứng
  "phan-cung": {
    categoryName: "Phần Cứng & Thiết Bị",
    guides: [
      {
        id: "hw-01",
        title: "Khởi Động Lại Driver Card Màn Hình & Nhận Màn Hình Ngoài",
        summary: "Khắc phục lỗi màn hình thứ 2 không lên, bị chớp nháy hoặc độ phân giải bị co rúm.",
        timeToFix: "30 giây",
        difficulty: "Dễ",
        keywords: ["màn hình", "monitor", "đen màn", "nhấp nháy", "hdmi", "type-c", "dock", "phụ"],
        steps: [
          {
            stepNumber: 1,
            title: "Kiểm tra cáp kết nối vật lý",
            detail: "Rút dây HDMI / Type-C cắm từ máy tính sang màn hình hoặc Docking, lau nhẹ cổng và cắm chặt lại.",
          },
          {
            stepNumber: 2,
            title: "Chọn lại chế độ chiếu hình ảnh",
            detail: "Nhấn tổ hợp phím Windows + P -> Chọn chế độ 'Extend' (Mở rộng).",
          },
          {
            stepNumber: 3,
            title: "Khởi động lại Driver đồ họa trong 1 giây",
            detail: "Nhấn tổ hợp phím sau, màn hình sẽ chớp nhẹ 1 tiếng 'bíp' và khôi phục hiển thị:",
            command: "Win + Ctrl + Shift + B",
          },
        ],
      },
      {
        id: "hw-02",
        title: "Kiểm Tra Tiến Trình Chiếm Dụng 100% CPU / RAM & Quạt Kêu To",
        summary: "Hạ nhiệt độ laptop và giải phóng bộ nhớ khi máy tính bị lag đơ nghiêm trọng.",
        timeToFix: "2 phút",
        difficulty: "Dễ",
        keywords: ["quạt", "nóng", "chậm", "cpu", "ram", "đơ", "lag", "pin"],
        steps: [
          {
            stepNumber: 1,
            title: "Kiểm tra tiến trình 'ăn' tài nguyên",
            detail: "Mở Task Manager (Ctrl + Shift + Esc), sắp xếp cột CPU và Memory từ cao xuống thấp để xem tiến trình nào đang chiếm quá 80%.",
          },
          {
            stepNumber: 2,
            title: "Tắt bớt tab trình duyệt nặng",
            detail: "Trình duyệt Chrome/Edge mở nhiều tab xem video hoặc đồ họa có thể tốn 4-8GB RAM. Hãy đóng các tab không sử dụng.",
          },
          {
            stepNumber: 3,
            title: "Kê cao đáy máy tính",
            detail: "Đảm bảo khe tản nhiệt dưới gầm và bên hông laptop không bị che khuất bởi sách vở hoặc nệm gối.",
          },
        ],
      },
      {
        id: "hw-03",
        title: "Khắc Phục Chuột / Bàn Phím Không Nhận",
        summary: "Xử lý chuột không dây hoặc bàn phím USB bị mất tín hiệu.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["chuột", "bàn phím", "mouse", "keyboard", "usb", "bluetooth", "liệt"],
        steps: [
          {
            stepNumber: 1,
            title: "Đổi cổng cắm USB khác",
            detail: "Rút đầu thu USB Receiver hoặc dây cáp cắm sang một cổng USB khác trên thân máy tính.",
          },
          {
            stepNumber: 2,
            title: "Kiểm tra pin chuột",
            detail: "Nếu là chuột không dây, kiểm tra công tắc ON/OFF dưới đáy chuột và thay viên pin AA/AAA mới nếu đèn báo yếu.",
          },
        ],
      },
    ],
  },

  // 4. Tài khoản
  "tai-khoan": {
    categoryName: "Tài Khoản & Mật Khẩu",
    guides: [
      {
        id: "acc-01",
        title: "Tự Đặt Lại Mật Khẩu (SSPR) Khi Bị Quên Hoặc Khóa Tài Khoản",
        summary: "Mở khóa tài khoản AD và đặt lại mật khẩu mới tự phục vụ trong 2 phút mà không cần chờ IT.",
        timeToFix: "2 phút",
        difficulty: "Dễ",
        keywords: ["mật khẩu", "password", "khóa", "lock", "quên", "reset", "đăng nhập", "sai mật khẩu"],
        steps: [
          {
            stepNumber: 1,
            title: "Truy cập cổng Đặt lại Mật khẩu Self-Service",
            detail: "Mở trình duyệt trên máy tính hoặc điện thoại truy cập đường link sau:",
            command: "https://passwordreset.microsoftonline.com",
          },
          {
            stepNumber: 2,
            title: "Nhập email công ty và mã bảo mật",
            detail: "Nhập địa chỉ email công ty (VD: user@company.vn) và nhập các chữ cái xác thực trên màn hình.",
          },
          {
            stepNumber: 3,
            title: "Xác minh qua SMS hoặc Authenticator",
            detail: "Chọn nhận mã OTP gửi về số điện thoại cá nhân đã đăng ký hoặc phê duyệt trên ứng dụng Microsoft Authenticator.",
          },
          {
            stepNumber: 4,
            title: "Đặt mật khẩu mới",
            detail: "Mật khẩu mới tối thiểu 10 ký tự, bao gồm: chữ hoa, chữ thường, chữ số và không trùng 3 mật khẩu gần nhất.",
          },
        ],
      },
      {
        id: "acc-02",
        title: "Xử Lý Không Nhận Được Mã 2FA (Microsoft Authenticator)",
        summary: "Cách lấy mã số OTP 6 chữ số khi điện thoại không có mạng hoặc không hiện thông báo Push.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["2fa", "mfa", "otp", "authenticator", "mã xác thực", "tin nhắn", "xác thực"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở ứng dụng Microsoft Authenticator trên điện thoại",
            detail: "Mở trực tiếp ứng dụng trên điện thoại (kể cả khi không có mạng 4G/Wi-Fi).",
          },
          {
            stepNumber: 2,
            title: "Bấm vào tài khoản công ty để xem mã OTP",
            detail: "Chạm vào dòng tài khoản công ty của bạn, bạn sẽ thấy dãy 6 chữ số thay đổi mỗi 30 giây.",
          },
          {
            stepNumber: 3,
            title: "Nhập mã số vào màn hình đăng nhập",
            detail: "Trên màn hình đăng nhập máy tính, chọn 'Tôi không thể sử dụng ứng dụng ngay bây giờ' -> Chọn 'Sử dụng mã xác minh'.",
          },
        ],
      },
    ],
  },

  // 5. Máy in
  "may-in": {
    categoryName: "Máy In & Scan",
    guides: [
      {
        id: "prn-01",
        title: "Khởi Động Lại Dịch Vụ Print Spooler Khi Bị Kẹt Lệnh In",
        summary: "Giải phóng hàng đợi in bị treo, báo lỗi 'Deleting...' hoặc máy in không phản hồi.",
        timeToFix: "1 phút",
        difficulty: "Dễ",
        keywords: ["máy in", "in", "kẹt", "spooler", "print", "không in được", "lệnh in", "queue"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở cửa sổ Quản lý dịch vụ Services",
            detail: "Nhấn Windows + R, nhập lệnh sau và nhấn Enter:",
            command: "services.msc",
          },
          {
            stepNumber: 2,
            title: "Khởi động lại Print Spooler",
            detail: "Cuộn tìm dịch vụ có tên 'Print Spooler' -> Chuột phải vào đó và chọn 'Restart'.",
          },
          {
            stepNumber: 3,
            title: "Gửi lại lệnh in",
            detail: "Sau khi Print Spooler khởi động lại xong (khoảng 3 giây), quay lại tài liệu và in lại.",
          },
        ],
      },
      {
        id: "prn-02",
        title: "Thêm Lại Máy In Văn Phòng Qua Địa Chỉ IP Nội Bộ",
        summary: "Kết nối lại máy in tầng 1, 2, 3 khi máy tính bị mất kết nối máy in văn phòng.",
        timeToFix: "2 phút",
        difficulty: "Trung bình",
        keywords: ["máy in", "thêm máy in", "add printer", "ip", "canon", "hp", "ricoh", "tầng"],
        steps: [
          {
            stepNumber: 1,
            title: "Đảm bảo đã kết nối đúng Wi-Fi văn phòng",
            detail: "Laptop phải kết nối vào mạng Wi-Fi 'Corp-Internal-5G' (không được dùng Wi-Fi Khách).",
          },
          {
            stepNumber: 2,
            title: "Mở cài đặt Máy in trên Windows",
            detail: "Vào Settings -> Bluetooth & devices -> Printers & scanners -> Bấm 'Add device' -> Đợi 5 giây rồi bấm 'The printer that I want isn't listed'.",
          },
          {
            stepNumber: 3,
            title: "Nhập địa chỉ IP máy in văn phòng",
            detail: "Chọn 'Add a printer using an IP address or hostname' -> Nhập IP máy in văn phòng (Tầng 2: 192.168.1.250 / Tầng 3: 192.168.1.251) -> Bấm Next.",
          },
        ],
      },
      {
        id: "prn-03",
        title: "Kiểm Tra Kẹt Giấy & Khay Giấy Máy In Vật Lý",
        summary: "Cách xử lý an toàn khi máy in báo đèn đỏ hoặc thông báo Paper Jam.",
        timeToFix: "2 phút",
        difficulty: "Dễ",
        keywords: ["kẹt giấy", "đèn đỏ", "paper jam", "hết giấy", "mực"],
        steps: [
          {
            stepNumber: 1,
            title: "Mở nắp máy in theo đúng hướng",
            detail: "Tắt nguồn máy in, mở nắp trước và nắp sau của máy in văn phòng.",
          },
          {
            stepNumber: 2,
            title: "Kéo giấy kẹt bằng cả hai tay",
            detail: "Dùng 2 tay nắm đều 2 mép giấy và kéo nhẹ nhàng theo chiều cuốn của trục lăn để tránh làm rách giấy vụn bên trong.",
          },
          {
            stepNumber: 3,
            title: "Đóng nắp và bật lại nguồn",
            detail: "Đóng kín tất cả các cửa nắp, bật nguồn máy in và chờ đèn xanh sẵn sàng.",
          },
        ],
      },
    ],
  },
};

/**
 * Lấy danh sách các hướng dẫn sửa lỗi thông dụng dựa trên danh mục được chọn
 * và tìm kiếm khớp từ khóa trong tiêu đề/mô tả của người dùng.
 */
export function getTroubleshootingGuidesForTicket({ category, title = "", description = "" }) {
  if (!category) return [];

  // Tìm danh mục theo slug hoặc tên
  const slug = (category.slug || category.name || "").toLowerCase();
  let matchedGroup;

  if (slug.includes("mang") || slug.includes("net") || slug.includes("vpn") || slug.includes("wifi")) {
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["mang-internet"];
  } else if (slug.includes("mem") || slug.includes("soft") || slug.includes("app") || slug.includes("ung-dung")) {
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["phan-mem"];
  } else if (slug.includes("cung") || slug.includes("hard") || slug.includes("may-tinh") || slug.includes("laptop")) {
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["phan-cung"];
  } else if (slug.includes("tai-khoan") || slug.includes("acc") || slug.includes("pass") || slug.includes("mat-khau")) {
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["tai-khoan"];
  } else if (slug.includes("in") || slug.includes("print") || slug.includes("scan")) {
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["may-in"];
  } else {
    // Mặc định lấy từ danh mục Mạng hoặc Phần mềm
    matchedGroup = TROUBLESHOOTING_GUIDES_BY_CATEGORY["phan-mem"];
  }

  if (!matchedGroup || !matchedGroup.guides) return [];

  const textToSearch = `${title} ${description}`.toLowerCase();

  // Sắp xếp theo mức độ khớp từ khóa với sự cố của user
  return matchedGroup.guides.map((guide) => {
    let score = 0;
    if (guide.keywords) {
      for (const kw of guide.keywords) {
        if (textToSearch.includes(kw.toLowerCase())) {
          score += 1;
        }
      }
    }
    return { ...guide, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
