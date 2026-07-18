const recentTickets = [
  { code: "HD-2026-000128", title: "Không kết nối được Wi-Fi văn phòng", status: "Đang xử lý" },
  { code: "HD-2026-000104", title: "Cấp quyền truy cập thư mục chung", status: "Đã hoàn thành" },
  { code: "HD-2026-000087", title: "Máy in tầng 3 báo lỗi", status: "Đã hoàn thành" },
];

export const INITIAL_ADMIN_USERS = [
  { id: "USR-001", fullName: "Nguyễn Minh Anh", email: "minhanh@acme.vn", phone: "0901 234 567", role: "user", status: "active", ticketCount: 12, createdAt: "2026-07-03T08:20:00+07:00", lastLoginAt: "2026-07-18T08:42:00+07:00", department: "Kế toán", recentTickets },
  { id: "USR-002", fullName: "Trần Quốc Bảo", email: "quocbao@acme.vn", phone: "0912 483 210", role: "user", status: "active", ticketCount: 8, createdAt: "2026-06-22T09:10:00+07:00", lastLoginAt: "2026-07-17T16:25:00+07:00", department: "Kinh doanh", recentTickets: recentTickets.slice(0, 2) },
  { id: "USR-003", fullName: "Lê Thu Hà", email: "thuha@acme.vn", phone: "0987 120 455", role: "admin", status: "active", ticketCount: 3, createdAt: "2026-05-14T10:30:00+07:00", lastLoginAt: "2026-07-18T07:55:00+07:00", department: "Công nghệ thông tin", recentTickets: recentTickets.slice(1) },
  { id: "USR-004", fullName: "Phạm Đức Long", email: "duclong@acme.vn", phone: "0934 511 089", role: "user", status: "locked", ticketCount: 15, createdAt: "2026-04-08T14:15:00+07:00", lastLoginAt: "2026-06-29T11:30:00+07:00", department: "Vận hành", recentTickets },
  { id: "USR-005", fullName: "Hoàng Ngọc Mai", email: "ngocmai@acme.vn", phone: "0908 333 762", role: "user", status: "unverified", ticketCount: 0, createdAt: "2026-07-15T13:40:00+07:00", lastLoginAt: null, department: "Nhân sự", recentTickets: [] },
  { id: "USR-006", fullName: "Võ Tuấn Kiệt", email: "tuankiet@acme.vn", phone: "0976 660 221", role: "user", status: "active", ticketCount: 6, createdAt: "2026-03-19T08:45:00+07:00", lastLoginAt: "2026-07-16T09:18:00+07:00", department: "Marketing", recentTickets: recentTickets.slice(0, 1) },
  { id: "USR-007", fullName: "Đặng Thanh Hương", email: "thanhhuong@acme.vn", phone: "0903 742 198", role: "user", status: "active", ticketCount: 10, createdAt: "2026-02-11T15:20:00+07:00", lastLoginAt: "2026-07-17T10:05:00+07:00", department: "Chăm sóc khách hàng", recentTickets: recentTickets.slice(1) },
  { id: "USR-008", fullName: "Bùi Gia Huy", email: "giahuy@acme.vn", phone: "0888 451 900", role: "user", status: "locked", ticketCount: 4, createdAt: "2026-01-28T11:10:00+07:00", lastLoginAt: "2026-05-22T14:40:00+07:00", department: "Kho vận", recentTickets: recentTickets.slice(2) },
  { id: "USR-009", fullName: "Đỗ Khánh Linh", email: "khanhlinh@acme.vn", phone: "0965 007 314", role: "user", status: "active", ticketCount: 9, createdAt: "2026-07-09T09:35:00+07:00", lastLoginAt: "2026-07-18T09:01:00+07:00", department: "Pháp chế", recentTickets: recentTickets.slice(0, 2) },
  { id: "USR-010", fullName: "Ngô Anh Tuấn", email: "anhtuan@acme.vn", phone: "0922 684 115", role: "admin", status: "active", ticketCount: 2, createdAt: "2025-12-05T08:00:00+07:00", lastLoginAt: "2026-07-17T17:12:00+07:00", department: "Công nghệ thông tin", recentTickets: recentTickets.slice(1, 2) },
  { id: "USR-011", fullName: "Dương Hải Yến", email: "haiyen@acme.vn", phone: "0906 915 428", role: "user", status: "active", ticketCount: 7, createdAt: "2026-06-08T13:25:00+07:00", lastLoginAt: "2026-07-15T08:26:00+07:00", department: "Tài chính", recentTickets: recentTickets.slice(0, 2) },
  { id: "USR-012", fullName: "Mai Quốc Việt", email: "quocviet@acme.vn", phone: "0938 201 776", role: "user", status: "unverified", ticketCount: 1, createdAt: "2026-07-17T10:05:00+07:00", lastLoginAt: null, department: "Sản phẩm", recentTickets: recentTickets.slice(0, 1) },
  { id: "USR-013", fullName: "Trương Mỹ Duyên", email: "myduyen@acme.vn", phone: "0899 320 611", role: "user", status: "active", ticketCount: 11, createdAt: "2026-05-26T16:45:00+07:00", lastLoginAt: "2026-07-16T15:32:00+07:00", department: "Kinh doanh", recentTickets },
  { id: "USR-014", fullName: "Lý Thành Đạt", email: "thanhdat@acme.vn", phone: "0971 854 339", role: "user", status: "active", ticketCount: 5, createdAt: "2026-04-30T07:55:00+07:00", lastLoginAt: "2026-07-14T13:02:00+07:00", department: "Mua hàng", recentTickets: recentTickets.slice(1) },
];

export const USER_STATUS = {
  active: { label: "Đang hoạt động", classes: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  locked: { label: "Bị khóa", classes: "bg-red-50 text-red-700 ring-red-600/20" },
  unverified: { label: "Chưa xác thực", classes: "bg-amber-50 text-amber-700 ring-amber-600/20" },
};

export const USER_ROLE = {
  user: { label: "Người dùng", classes: "bg-slate-100 text-slate-700" },
  admin: { label: "Quản trị viên", classes: "bg-blue-50 text-blue-700" },
};
