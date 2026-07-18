export const MOCK_TICKETS = [
  { id: "t-142", ticketCode: "HD-2026-000142", title: "Không truy cập được hệ thống ERP", category: "Phần mềm", priority: "urgent", status: "in_progress", createdAt: "2026-07-18T08:15:00+07:00", updatedAt: "2026-07-18T09:40:00+07:00", requester: "Nguyễn Minh Anh", technician: "Trần Hoàng Nam", sla: "Còn 35 phút" },
  { id: "t-141", ticketCode: "HD-2026-000141", title: "Máy in phòng Kế toán bị kẹt giấy", category: "Máy in", priority: "high", status: "assigned", createdAt: "2026-07-18T07:48:00+07:00", updatedAt: "2026-07-18T08:20:00+07:00", requester: "Lê Thu Hà", technician: "Trần Hoàng Nam", sla: "Còn 1 giờ 20 phút" },
  { id: "t-139", ticketCode: "HD-2026-000139", title: "Yêu cầu cấp tài khoản Microsoft 365", category: "Tài khoản", priority: "medium", status: "pending", createdAt: "2026-07-17T15:24:00+07:00", updatedAt: "2026-07-17T15:24:00+07:00", requester: "Phạm Đức Long", technician: "Chưa phân công", sla: "Còn 4 giờ" },
  { id: "t-136", ticketCode: "HD-2026-000136", title: "Mạng Wi-Fi tầng 4 không ổn định", category: "Mạng Internet", priority: "high", status: "waiting_user", createdAt: "2026-07-16T13:12:00+07:00", updatedAt: "2026-07-18T08:05:00+07:00", requester: "Hoàng Ngọc Mai", technician: "Trần Hoàng Nam", sla: "Tạm dừng" },
  { id: "t-132", ticketCode: "HD-2026-000132", title: "Nâng cấp RAM máy tính thiết kế", category: "Phần cứng", priority: "medium", status: "in_progress", createdAt: "2026-07-15T10:10:00+07:00", updatedAt: "2026-07-17T16:30:00+07:00", requester: "Võ Tuấn Kiệt", technician: "Trần Hoàng Nam", sla: "Còn 6 giờ" },
  { id: "t-128", ticketCode: "HD-2026-000128", title: "Cài đặt phần mềm ký số", category: "Phần mềm", priority: "low", status: "resolved", createdAt: "2026-07-13T09:05:00+07:00", updatedAt: "2026-07-14T11:22:00+07:00", requester: "Đặng Thanh Hương", technician: "Trần Hoàng Nam", sla: "Đúng hạn" },
  { id: "t-121", ticketCode: "HD-2026-000121", title: "Quên mật khẩu email công ty", category: "Tài khoản", priority: "high", status: "closed", createdAt: "2026-07-10T08:30:00+07:00", updatedAt: "2026-07-10T09:10:00+07:00", requester: "Bùi Gia Huy", technician: "Trần Hoàng Nam", sla: "Đúng hạn" },
  { id: "t-118", ticketCode: "HD-2026-000118", title: "Không nhận được email từ đối tác", category: "Phần mềm", priority: "medium", status: "resolved", createdAt: "2026-07-08T14:22:00+07:00", updatedAt: "2026-07-09T10:15:00+07:00", requester: "Đỗ Khánh Linh", technician: "Nguyễn Hải Đăng", sla: "Đúng hạn" },
  { id: "t-112", ticketCode: "HD-2026-000112", title: "Chuột không dây mất kết nối", category: "Phần cứng", priority: "low", status: "cancelled", createdAt: "2026-07-05T11:45:00+07:00", updatedAt: "2026-07-05T13:00:00+07:00", requester: "Ngô Anh Tuấn", technician: "Chưa phân công", sla: "Đã hủy" },
  { id: "t-103", ticketCode: "HD-2026-000103", title: "Cấu hình VPN làm việc từ xa", category: "Mạng Internet", priority: "medium", status: "closed", createdAt: "2026-06-28T09:15:00+07:00", updatedAt: "2026-06-29T15:45:00+07:00", requester: "Nguyễn Minh Anh", technician: "Trần Hoàng Nam", sla: "Đúng hạn" },
];

export const MOCK_TECHNICIANS = [
  { id: "tech-01", name: "Trần Hoàng Nam", email: "nam.th@acme.vn", phone: "0903 124 588", specialization: "Phần cứng · Mạng", active: 5, completed: 48, rating: 4.9, sla: 96, status: "online" },
  { id: "tech-02", name: "Nguyễn Hải Đăng", email: "dang.nh@acme.vn", phone: "0918 442 105", specialization: "Phần mềm · Tài khoản", active: 4, completed: 42, rating: 4.8, sla: 94, status: "online" },
  { id: "tech-03", name: "Phan Thùy Dương", email: "duong.pt@acme.vn", phone: "0975 810 226", specialization: "Máy in · Phần cứng", active: 2, completed: 39, rating: 4.7, sla: 92, status: "busy" },
  { id: "tech-04", name: "Lê Minh Quân", email: "quan.lm@acme.vn", phone: "0886 338 901", specialization: "Mạng · Bảo mật", active: 0, completed: 31, rating: 4.8, sla: 95, status: "offline" },
  { id: "tech-05", name: "Vũ Thanh Tâm", email: "tam.vt@acme.vn", phone: "0936 772 410", specialization: "Phần mềm", active: 3, completed: 27, rating: 4.6, sla: 89, status: "online" },
];

export const MOCK_CATEGORIES = [
  { id: "cat-01", name: "Phần cứng", description: "Máy tính, màn hình và thiết bị ngoại vi", icon: "PC", tickets: 46, active: true },
  { id: "cat-02", name: "Phần mềm", description: "Ứng dụng nội bộ và phần mềm văn phòng", icon: "SW", tickets: 58, active: true },
  { id: "cat-03", name: "Mạng Internet", description: "LAN, Wi-Fi, VPN và kết nối Internet", icon: "NW", tickets: 37, active: true },
  { id: "cat-04", name: "Tài khoản", description: "Cấp quyền, mật khẩu và tài khoản hệ thống", icon: "ID", tickets: 52, active: true },
  { id: "cat-05", name: "Máy in", description: "Máy in, máy scan và vật tư in ấn", icon: "PR", tickets: 21, active: true },
  { id: "cat-06", name: "Yêu cầu khác", description: "Các yêu cầu chưa thuộc nhóm chuyên biệt", icon: "OT", tickets: 14, active: false },
];

export const WEEKLY_REPORT = [
  { day: "T2", created: 18, resolved: 15 }, { day: "T3", created: 24, resolved: 21 },
  { day: "T4", created: 16, resolved: 19 }, { day: "T5", created: 29, resolved: 25 },
  { day: "T6", created: 22, resolved: 24 }, { day: "T7", created: 8, resolved: 10 },
  { day: "CN", created: 5, resolved: 6 },
];

export const CATEGORY_REPORT = [
  { name: "Phần mềm", value: 58 }, { name: "Tài khoản", value: 52 },
  { name: "Phần cứng", value: 46 }, { name: "Mạng", value: 37 },
  { name: "Máy in", value: 21 }, { name: "Khác", value: 14 },
];
