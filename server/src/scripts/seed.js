import mongoose from "mongoose";
import {
  connectDatabase,
  disconnectDatabase,
} from "../config/database.js";
import { env } from "../config/env.js";
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import Rating from "../models/Rating.js";
import Ticket from "../models/Ticket.js";
import TicketCounter from "../models/TicketCounter.js";
import User from "../models/User.js";
import Asset from "../models/Asset.js";
import AssetRequest from "../models/AssetRequest.js";

const DEFAULT_SEED_PASSWORD = "Helpdesk@123";
const COMPLETED_STATUSES = new Set(["resolved", "closed"]);
const ASSIGNED_STATUSES = new Set([
  "assigned",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
]);
const STARTED_STATUSES = new Set([
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
]);
const PROTECTED_DATABASE_NAMES = new Set([
  "admin",
  "config",
  "local",
  "test",
]);

const CATEGORY_DEFINITIONS = Object.freeze([
  {
    name: "Phần cứng",
    slug: "phan-cung",
    description: "Sự cố máy tính, màn hình, bàn phím và thiết bị phần cứng.",
  },
  {
    name: "Phần mềm",
    slug: "phan-mem",
    description: "Cài đặt, cập nhật và xử lý lỗi phần mềm nội bộ.",
  },
  {
    name: "Mạng Internet",
    slug: "mang-internet",
    description: "Kết nối Internet, Wi-Fi, VPN và mạng nội bộ doanh nghiệp.",
  },
  {
    name: "Tài khoản",
    slug: "tai-khoan",
    description: "Tài khoản đăng nhập, mật khẩu và phân quyền truy cập.",
  },
  {
    name: "Máy in",
    slug: "may-in",
    description: "Máy in, máy scan, hàng đợi in và vật tư in ấn.",
  },
  {
    name: "Yêu cầu khác",
    slug: "yeu-cau-khac",
    description: "Các yêu cầu hỗ trợ công nghệ thông tin chưa thuộc danh mục khác.",
  },
]);

const ISSUE_SAMPLES = Object.freeze({
  "phan-cung": Object.freeze([
    {
      title: "Máy tính không khởi động",
      description:
        "Máy tính không lên nguồn dù đã kiểm tra dây điện và ổ cắm tại bàn làm việc.",
    },
    {
      title: "Màn hình bị nhấp nháy liên tục",
      description:
        "Màn hình làm việc thường xuyên nhấp nháy và mất tín hiệu trong vài giây.",
    },
    {
      title: "Bàn phím không nhận một số phím",
      description:
        "Nhiều phím trên bàn phím không phản hồi, gây gián đoạn quá trình nhập dữ liệu.",
    },
    {
      title: "Ổ cứng phát ra tiếng kêu bất thường",
      description:
        "Ổ cứng phát tiếng kêu lặp lại và máy tính truy cập dữ liệu rất chậm.",
    },
    {
      title: "Máy tính thường xuyên quá nhiệt",
      description:
        "Thiết bị nóng nhanh, quạt chạy liên tục và đôi khi tự động tắt nguồn.",
    },
  ]),
  "phan-mem": Object.freeze([
    {
      title: "Không mở được phần mềm kế toán",
      description:
        "Ứng dụng kế toán hiển thị lỗi khi khởi động và không cho phép đăng nhập.",
    },
    {
      title: "Cần cài đặt bộ Microsoft Office",
      description:
        "Máy tính mới chưa có bộ Office để xử lý tài liệu phục vụ công việc hằng ngày.",
    },
    {
      title: "Ứng dụng nội bộ bị treo",
      description:
        "Ứng dụng quản lý nội bộ thường xuyên đứng màn hình khi lưu dữ liệu mới.",
    },
    {
      title: "Trình duyệt không tải được tệp",
      description:
        "Trình duyệt báo lỗi khi tải tệp báo cáo từ hệ thống quản trị nội bộ.",
    },
    {
      title: "Cần cập nhật phần mềm diệt virus",
      description:
        "Phần mềm bảo mật thông báo phiên bản đã cũ và không thể tự cập nhật.",
    },
  ]),
  "mang-internet": Object.freeze([
    {
      title: "Không kết nối được mạng Wi-Fi",
      description:
        "Máy tính nhìn thấy Wi-Fi công ty nhưng không thể hoàn tất quá trình kết nối.",
    },
    {
      title: "Kết nối Internet rất chậm",
      description:
        "Tốc độ truy cập Internet tại khu vực làm việc giảm mạnh trong giờ hành chính.",
    },
    {
      title: "VPN bị ngắt kết nối liên tục",
      description:
        "Kết nối VPN từ xa bị ngắt sau vài phút và phải đăng nhập lại nhiều lần.",
    },
    {
      title: "Không truy cập được thư mục mạng",
      description:
        "Máy tính không mở được thư mục dùng chung dù các đồng nghiệp vẫn truy cập bình thường.",
    },
    {
      title: "Mạng phòng họp không ổn định",
      description:
        "Kết nối mạng tại phòng họp chập chờn, ảnh hưởng đến các cuộc họp trực tuyến.",
    },
  ]),
  "tai-khoan": Object.freeze([
    {
      title: "Không đăng nhập được email công ty",
      description:
        "Tài khoản email công ty báo sai thông tin đăng nhập dù mật khẩu vừa được thay đổi.",
    },
    {
      title: "Cần đặt lại mật khẩu tài khoản",
      description:
        "Người dùng quên mật khẩu và cần được hỗ trợ khôi phục quyền truy cập hệ thống.",
    },
    {
      title: "Tài khoản bị khóa sau nhiều lần thử",
      description:
        "Hệ thống thông báo tài khoản đã bị khóa sau nhiều lần nhập sai mật khẩu.",
    },
    {
      title: "Thiếu quyền truy cập thư mục dự án",
      description:
        "Tài khoản chưa được cấp quyền xem thư mục dùng chung của dự án đang phụ trách.",
    },
    {
      title: "Không nhận được mã xác thực",
      description:
        "Người dùng không nhận được mã xác thực hai bước khi đăng nhập từ thiết bị mới.",
    },
  ]),
  "may-in": Object.freeze([
    {
      title: "Máy in không nhận lệnh in",
      description:
        "Lệnh in đã gửi nhưng tài liệu không xuất hiện trong hàng đợi của máy in phòng ban.",
    },
    {
      title: "Bản in xuất hiện nhiều vệt mờ",
      description:
        "Tài liệu in ra có nhiều vệt đen và nội dung bị mờ, khó đọc thông tin.",
    },
    {
      title: "Máy in thường xuyên kẹt giấy",
      description:
        "Máy in báo kẹt giấy sau mỗi vài trang dù đã lấy hết giấy mắc bên trong.",
    },
    {
      title: "Không tìm thấy máy in mạng",
      description:
        "Máy tính mới không tìm thấy máy in dùng chung trong danh sách thiết bị mạng.",
    },
    {
      title: "Máy scan không lưu được tệp",
      description:
        "Thiết bị scan hoàn tất quét nhưng không thể lưu tệp vào thư mục đã cấu hình.",
    },
  ]),
  "yeu-cau-khac": Object.freeze([
    {
      title: "Cần hỗ trợ thiết bị phòng họp",
      description:
        "Cần kiểm tra camera, micro và màn hình trước cuộc họp quan trọng của công ty.",
    },
    {
      title: "Yêu cầu cấp chuột không dây",
      description:
        "Chuột hiện tại đã hỏng và cần được cấp thiết bị thay thế để tiếp tục công việc.",
    },
    {
      title: "Cần tư vấn sao lưu dữ liệu",
      description:
        "Phòng ban cần hướng dẫn phương án sao lưu an toàn cho dữ liệu dự án quan trọng.",
    },
    {
      title: "Hỗ trợ trình chiếu sự kiện nội bộ",
      description:
        "Cần nhân viên kỹ thuật hỗ trợ kết nối và kiểm tra thiết bị cho sự kiện nội bộ.",
    },
    {
      title: "Cần kiểm tra thiết bị mới bàn giao",
      description:
        "Thiết bị mới đã được bàn giao và cần kiểm tra cấu hình trước khi đưa vào sử dụng.",
    },
  ]),
});

const STATUS_PRIORITY_DISTRIBUTION = Object.freeze([
  {
    status: "pending",
    priorities: Object.freeze(["low", "medium", "medium", "high", "urgent"]),
  },
  {
    status: "assigned",
    priorities: Object.freeze(["low", "medium", "medium", "high"]),
  },
  {
    status: "in_progress",
    priorities: Object.freeze([
      "low",
      "medium",
      "medium",
      "high",
      "high",
      "urgent",
    ]),
  },
  {
    status: "waiting_user",
    priorities: Object.freeze(["medium", "high", "urgent"]),
  },
  {
    status: "resolved",
    priorities: Object.freeze(["low", "medium", "medium", "high", "urgent"]),
  },
  {
    status: "closed",
    priorities: Object.freeze(["low", "medium", "medium", "medium", "high"]),
  },
  {
    status: "cancelled",
    priorities: Object.freeze(["medium", "high"]),
  },
]);

const RATING_FEEDBACK = Object.freeze([
  "Technician phản hồi nhanh và hướng dẫn rất rõ ràng.",
  "Sự cố được xử lý đúng yêu cầu, tôi hài lòng với kết quả.",
  "Thời gian xử lý hợp lý và thái độ hỗ trợ chuyên nghiệp.",
  "Vấn đề đã được giải quyết, phần hướng dẫn có thể chi tiết hơn.",
  "Dịch vụ hỗ trợ tốt, thiết bị đã hoạt động ổn định trở lại.",
]);

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

function getVietnamYear(date) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(date),
  );
}

function getSeedPassword() {
  const password =
    process.env.SEED_DEFAULT_PASSWORD?.trim() || DEFAULT_SEED_PASSWORD;
  const passwordSize = Buffer.byteLength(password, "utf8");

  if (password.length < 8 || passwordSize > 72) {
    throw new Error(
      "SEED_DEFAULT_PASSWORD phải có ít nhất 8 ký tự và không vượt quá 72 byte.",
    );
  }

  return password;
}

function buildAccountDefinitions(password) {
  const technicians = [
    ["Nguyễn Minh Kỹ", "technician1@ithelpdesk.local", "0900000011"],
    ["Trần Hoàng Nam", "technician2@ithelpdesk.local", "0900000012"],
    ["Lê Thu Hà", "technician3@ithelpdesk.local", "0900000013"],
  ].map(([fullName, email, phone]) => ({
    fullName,
    email,
    password,
    phone,
    department: "Công nghệ thông tin",
    role: "technician",
    status: "active",
  }));
  const userNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Quốc Cường",
    "Phạm Ngọc Dung",
    "Hoàng Minh Đức",
    "Võ Thu Giang",
    "Đặng Gia Huy",
    "Bùi Khánh Linh",
    "Đỗ Tuấn Minh",
    "Ngô Hải Yến",
  ];
  const departments = [
    "Kế toán",
    "Nhân sự",
    "Kinh doanh",
    "Marketing",
    "Vận hành",
  ];
  const users = userNames.map((fullName, index) => ({
    fullName,
    email: `user${String(index + 1).padStart(2, "0")}@ithelpdesk.local`,
    password,
    phone: `09100000${String(index + 1).padStart(2, "0")}`,
    department: departments[index % departments.length],
    role: "user",
    status: "active",
  }));

  return [
    {
      fullName: "Quản trị hệ thống",
      email: "admin@ithelpdesk.local",
      password,
      phone: "0900000001",
      department: "Công nghệ thông tin",
      role: "admin",
      status: "active",
    },
    ...technicians,
    ...users,
  ];
}

function buildTicketBlueprints() {
  const blueprints = [];
  const maximumGroupLength = Math.max(
    ...STATUS_PRIORITY_DISTRIBUTION.map(({ priorities }) => priorities.length),
  );

  for (let priorityIndex = 0; priorityIndex < maximumGroupLength; priorityIndex += 1) {
    for (const group of STATUS_PRIORITY_DISTRIBUTION) {
      const priority = group.priorities[priorityIndex];

      if (priority) {
        blueprints.push({ status: group.status, priority });
      }
    }
  }

  return blueprints;
}

function getTicketCreatedAt(index, now) {
  const hoursAgo = index < 18 ? 720 - index * 30 : 156 - (index - 18) * 12;
  return addMinutes(now, -hoursAgo * 60);
}

function buildTimeline({ status, createdAt, creator, technician, admin }) {
  const statusHistory = [
    {
      fromStatus: null,
      toStatus: "pending",
      changedBy: creator._id,
      note: "Ticket được tạo.",
      changedAt: createdAt,
    },
  ];
  const assignmentHistory = [];
  const fields = {
    assignedTo: null,
    assignedAt: null,
    startedAt: null,
    waitingUserAt: null,
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    resolution: null,
  };

  if (ASSIGNED_STATUSES.has(status)) {
    fields.assignedTo = technician._id;
    fields.assignedAt = addMinutes(createdAt, 60);
    assignmentHistory.push({
      fromTechnician: null,
      toTechnician: technician._id,
      assignedBy: admin._id,
      reason: "Phân công theo chuyên môn và khối lượng công việc.",
      assignedAt: fields.assignedAt,
    });
    statusHistory.push({
      fromStatus: "pending",
      toStatus: "assigned",
      changedBy: admin._id,
      note: "Admin đã phân công technician phụ trách.",
      changedAt: fields.assignedAt,
    });
  }

  if (STARTED_STATUSES.has(status)) {
    fields.startedAt = addMinutes(createdAt, 180);
    statusHistory.push({
      fromStatus: "assigned",
      toStatus: "in_progress",
      changedBy: technician._id,
      note: "Technician đã tiếp nhận và bắt đầu xử lý.",
      changedAt: fields.startedAt,
    });
  }

  if (status === "waiting_user") {
    fields.waitingUserAt = addMinutes(createdAt, 360);
    statusHistory.push({
      fromStatus: "in_progress",
      toStatus: "waiting_user",
      changedBy: technician._id,
      note: "Cần người dùng bổ sung thông tin để tiếp tục xử lý.",
      changedAt: fields.waitingUserAt,
    });
  }

  if (COMPLETED_STATUSES.has(status)) {
    fields.resolvedAt = addMinutes(createdAt, 480);
    fields.resolution =
      "Đã kiểm tra nguyên nhân, áp dụng phương án khắc phục và xác nhận hệ thống hoạt động ổn định.";
    statusHistory.push({
      fromStatus: "in_progress",
      toStatus: "resolved",
      changedBy: technician._id,
      note: "Technician đã xử lý xong và cập nhật nội dung giải quyết.",
      changedAt: fields.resolvedAt,
    });
  }

  if (status === "closed") {
    fields.closedAt = addMinutes(createdAt, 600);
    statusHistory.push({
      fromStatus: "resolved",
      toStatus: "closed",
      changedBy: creator._id,
      note: "Người dùng xác nhận kết quả và đóng ticket.",
      changedAt: fields.closedAt,
    });
  }

  if (status === "cancelled") {
    fields.cancelledAt = addMinutes(createdAt, 120);
    fields.cancelledBy = creator._id;
    fields.cancellationReason =
      "Yêu cầu không còn cần thiết do người dùng đã tự khắc phục được sự cố.";
    statusHistory.push({
      fromStatus: "pending",
      toStatus: "cancelled",
      changedBy: creator._id,
      note: fields.cancellationReason,
      changedAt: fields.cancelledAt,
    });
  }

  return { fields, statusHistory, assignmentHistory };
}

function buildCommentDefinitions({
  status,
  createdAt,
  creator,
  technician,
  timeline,
}) {
  const comments = [
    {
      sender: creator._id,
      content:
        "Tôi đã kiểm tra lại sự cố và gửi thêm thông tin để bộ phận IT hỗ trợ.",
      attachments: [],
      isInternal: false,
      createdAt: addMinutes(createdAt, 20),
      updatedAt: addMinutes(createdAt, 20),
    },
  ];

  if (ASSIGNED_STATUSES.has(status)) {
    comments.push(
      {
        sender: technician._id,
        content:
          "Tôi đã tiếp nhận yêu cầu và sẽ kiểm tra theo thông tin bạn cung cấp.",
        attachments: [],
        isInternal: false,
        createdAt: addMinutes(timeline.fields.assignedAt, 20),
        updatedAt: addMinutes(timeline.fields.assignedAt, 20),
      },
      {
        sender: technician._id,
        content:
          "Ghi chú nội bộ: đã kiểm tra log và chuẩn bị phương án xử lý phù hợp.",
        attachments: [],
        isInternal: true,
        createdAt: addMinutes(timeline.fields.assignedAt, 40),
        updatedAt: addMinutes(timeline.fields.assignedAt, 40),
      },
    );
  }

  if (status === "waiting_user") {
    comments.push({
      sender: creator._id,
      content:
        "Tôi đã bổ sung thông tin cấu hình và thời điểm sự cố xảy ra theo yêu cầu.",
      attachments: [],
      isInternal: false,
      createdAt: addMinutes(timeline.fields.waitingUserAt, 30),
      updatedAt: addMinutes(timeline.fields.waitingUserAt, 30),
    });
  }

  if (COMPLETED_STATUSES.has(status)) {
    const feedbackAt = addMinutes(timeline.fields.resolvedAt, 30);
    comments.push({
      sender: creator._id,
      content: "Tôi đã kiểm tra và xác nhận sự cố được khắc phục.",
      attachments: [],
      isInternal: false,
      createdAt: feedbackAt,
      updatedAt: feedbackAt,
    });
  }

  return comments;
}

function getLatestActivityDate(timeline, comments) {
  const timestamps = [
    ...timeline.statusHistory.map(({ changedAt }) => changedAt),
    ...timeline.assignmentHistory.map(({ assignedAt }) => assignedAt),
    ...comments.map(({ createdAt }) => createdAt),
  ];

  return new Date(Math.max(...timestamps.map((timestamp) => timestamp.getTime())));
}

function createTicketSeedContexts({
  now,
  admin,
  users,
  technicians,
  categories,
}) {
  const year = getVietnamYear(now);
  let assignedTicketIndex = 0;

  return buildTicketBlueprints().map((blueprint, index) => {
    const category = categories[index % categories.length];
    const creator = users[index % users.length];
    const sampleIndex = Math.floor(index / categories.length);
    const issue = ISSUE_SAMPLES[category.slug][sampleIndex];
    const createdAt = getTicketCreatedAt(index, now);
    const technician = ASSIGNED_STATUSES.has(blueprint.status)
      ? technicians[assignedTicketIndex++ % technicians.length]
      : null;
    const timeline = buildTimeline({
      status: blueprint.status,
      createdAt,
      creator,
      technician,
      admin,
    });
    const comments = buildCommentDefinitions({
      status: blueprint.status,
      createdAt,
      creator,
      technician,
      timeline,
    });
    const lastActivityAt = getLatestActivityDate(timeline, comments);

    return {
      ticket: {
        ticketCode: `HD-${year}-${String(index + 1).padStart(6, "0")}`,
        title: issue.title,
        description: issue.description,
        category: category._id,
        priority: blueprint.priority,
        status: blueprint.status,
        createdBy: creator._id,
        attachments: [],
        ...timeline.fields,
        lastActivityAt,
        statusHistory: timeline.statusHistory,
        assignmentHistory: timeline.assignmentHistory,
        createdAt,
        updatedAt: lastActivityAt,
      },
      comments,
      creator,
      technician,
      timeline,
    };
  });
}

async function clearExistingData({ silent = false } = {}) {
  const deletionResults = [];
  const collections = [
    ["asset_requests", AssetRequest],
    ["assets", Asset],
    ["ratings", Rating],
    ["comments", Comment],
    ["tickets", Ticket],
    ["ticket_counters", TicketCounter],
    ["categories", Category],
    ["users", User],
  ];

  for (const [name, Model] of collections) {
    const result = await Model.deleteMany({});
    deletionResults.push({ collection: name, deleted: result.deletedCount });
  }

  if (!silent) {
    console.log("Đã xóa dữ liệu cũ:");
    console.table(deletionResults);
  }
}

async function initializeIndexes() {
  await Promise.all([
    User.init(),
    Category.init(),
    Ticket.init(),
    Comment.init(),
    Rating.init(),
    TicketCounter.init(),
    Asset.init(),
    AssetRequest.init(),
  ]);
}

function assertSafeDatabaseTarget() {
  const databaseName = mongoose.connection.name;
  const force = process.argv.includes("--force");

  if (!databaseName) {
    throw new Error("Không xác định được tên database cần seed.");
  }

  if (env.nodeEnv === "production" && !force) {
    throw new Error(
      "Không được seed trong production nếu chưa truyền tham số --force.",
    );
  }

  if (PROTECTED_DATABASE_NAMES.has(databaseName.toLowerCase()) && !force) {
    throw new Error(
      `Từ chối xóa database '${databaseName}'. Hãy cấu hình MONGODB_URI với tên database riêng, ví dụ /it_helpdesk.`,
    );
  }

  console.log(`Database seed mục tiêu: ${databaseName}`);
}

function printSeedSummary({
  accounts,
  categories,
  tickets,
  comments,
  ratings,
  assets = [],
  requests = [],
  password,
}) {
  console.log("\nSeed dữ liệu IT Helpdesk thành công:");
  console.table([
    { collection: "users", records: accounts.length },
    { collection: "categories", records: categories.length },
    { collection: "tickets", records: tickets.length },
    { collection: "comments", records: comments.length },
    { collection: "ratings", records: ratings.length },
    { collection: "assets", records: assets.length },
    { collection: "asset_requests", records: requests.length },
  ]);

  console.log("\nTài khoản đăng nhập mẫu:");
  console.table(
    accounts.map(({ fullName, email, role }) => ({ fullName, email, role })),
  );
  console.log(`Mật khẩu chung: ${password}`);
}

function assertSeedResult({ accounts, categories, tickets, comments, ratings }) {
  const roleCounts = accounts.reduce((counts, account) => {
    counts[account.role] = (counts[account.role] ?? 0) + 1;
    return counts;
  }, {});
  const statuses = new Set(tickets.map(({ status }) => status));
  const priorities = new Set(tickets.map(({ priority }) => priority));

  if (
    accounts.length !== 14 ||
    roleCounts.admin !== 1 ||
    roleCounts.technician !== 3 ||
    roleCounts.user !== 10
  ) {
    throw new Error("Số lượng tài khoản seed không đúng yêu cầu.");
  }

  if (accounts.some((account) => !account.password?.startsWith("$2"))) {
    throw new Error("Có mật khẩu tài khoản chưa được bcrypt hash.");
  }

  if (categories.length !== 6 || tickets.length !== 30) {
    throw new Error("Số lượng danh mục hoặc ticket seed không đúng yêu cầu.");
  }

  if (
    statuses.size !== 7 ||
    priorities.size !== 4 ||
    comments.length === 0 ||
    ratings.length !== 10
  ) {
    throw new Error("Dữ liệu ticket, comment hoặc rating chưa phủ đủ yêu cầu.");
  }
}

async function seedAssetsAndRequests({ admin, technicians, users, now }) {
  const an = users.find((u) => u.fullName.includes("An")) || users[0];
  const binh = users.find((u) => u.fullName.includes("Bình")) || users[1];
  const cuong = users.find((u) => u.fullName.includes("Cường")) || users[2];
  const dung = users.find((u) => u.fullName.includes("Dung")) || users[3];
  const duc = users.find((u) => u.fullName.includes("Đức")) || users[4];
  const giang = users.find((u) => u.fullName.includes("Giang")) || users[5];

  const tech1 = technicians[0];

  const assets = await Asset.create([
    {
      assetTag: "LP-2026-001",
      name: "Lenovo ThinkPad T14s Gen 4",
      type: "laptop",
      serialNumber: "PF4ABC101",
      specs: "Core i7-1365U, 32GB RAM, 1TB NVMe, 14 inch 2.2K",
      os: "Windows 11 Pro",
      status: "in_use",
      assignedTo: an._id,
      assignedAt: new Date(now.getTime() - 20 * 86400000),
      remoteTool: "anydesk",
      remoteId: "982 341 502",
      notes: "Cấp phát cho nhân sự bộ phận Kế toán.",
      history: [
        { action: "created", performedBy: admin._id, at: new Date(now.getTime() - 30 * 86400000) },
        { action: "assigned", user: an._id, performedBy: tech1._id, note: "Bàn giao laptop làm việc.", at: new Date(now.getTime() - 20 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-002",
      name: "Dell Latitude 7440 Ultralight",
      type: "laptop",
      serialNumber: "DL7440-992",
      specs: "Core i5-1345U, 16GB RAM, 512GB SSD, 14 inch FHD+",
      os: "Windows 11 Pro",
      status: "in_use",
      assignedTo: binh._id,
      assignedAt: new Date(now.getTime() - 15 * 86400000),
      remoteTool: "teamviewer",
      remoteId: "1 249 582 103",
      notes: "Cấp phát máy mỏng nhẹ cho nhân sự phòng Nhân sự.",
      history: [
        { action: "created", performedBy: admin._id, at: new Date(now.getTime() - 25 * 86400000) },
        { action: "assigned", user: binh._id, performedBy: tech1._id, note: "Bàn giao máy Dell.", at: new Date(now.getTime() - 15 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-003",
      name: "Apple MacBook Pro 14 M3 Pro",
      type: "laptop",
      serialNumber: "C02XYZ883",
      specs: "M3 Pro 12-core, 18GB Unified Memory, 512GB SSD, Liquid Retina XDR",
      os: "macOS Sonoma",
      status: "in_use",
      assignedTo: cuong._id,
      assignedAt: new Date(now.getTime() - 10 * 86400000),
      remoteTool: "anydesk",
      remoteId: "401 829 114",
      notes: "Cấp phát cho bộ phận Thiết kế / Kỹ thuật.",
      history: [
        { action: "created", performedBy: admin._id, at: new Date(now.getTime() - 20 * 86400000) },
        { action: "assigned", user: cuong._id, performedBy: tech1._id, note: "Bàn giao MacBook Pro M3.", at: new Date(now.getTime() - 10 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-004",
      name: "HP EliteBook 840 G10",
      type: "laptop",
      serialNumber: "HP840G10-441",
      specs: "Core i7-1360P, 16GB RAM, 512GB SSD, 14 inch SureView",
      os: "Windows 11 Pro",
      status: "in_use",
      assignedTo: dung._id,
      assignedAt: new Date(now.getTime() - 5 * 86400000),
      remoteTool: "anydesk",
      remoteId: "772 109 432",
      notes: "Cấp phát cho trưởng nhóm Marketing.",
      history: [
        { action: "created", performedBy: admin._id, at: new Date(now.getTime() - 15 * 86400000) },
        { action: "assigned", user: dung._id, performedBy: tech1._id, note: "Bàn giao máy HP EliteBook.", at: new Date(now.getTime() - 5 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-005",
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      type: "laptop",
      serialNumber: "X1C11-0081",
      specs: "Core i7-1370P, 32GB RAM, 1TB NVMe, 14 inch 2.8K OLED",
      os: "Windows 11 Pro",
      status: "in_stock",
      remoteTool: "anydesk",
      remoteId: "302 918 201",
      notes: "Máy cao cấp mới nhập kho sẵn sàng cấp phát cho Manager.",
      history: [
        { action: "created", performedBy: admin._id, note: "Nhập kho máy mới 100%.", at: new Date(now.getTime() - 7 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-006",
      name: "Dell Latitude 5440 Business",
      type: "laptop",
      serialNumber: "DL5440-332",
      specs: "Core i5-1335U, 16GB RAM, 512GB SSD, 14 inch FHD",
      os: "Windows 11 Pro",
      status: "in_stock",
      remoteTool: "anydesk",
      remoteId: "551 294 809",
      notes: "Máy văn phòng tiêu chuẩn trong kho sẵn sàng bàn giao.",
      history: [
        { action: "created", performedBy: admin._id, note: "Nhập kho máy mới.", at: new Date(now.getTime() - 6 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-007",
      name: "Asus ExpertBook B9400",
      type: "laptop",
      serialNumber: "B9400-881",
      specs: "Core i7-1355U, 32GB RAM, 1TB SSD, 14 inch siêu nhẹ 880g",
      os: "Windows 11 Pro",
      status: "in_stock",
      remoteTool: "teamviewer",
      remoteId: "910 248 119",
      notes: "Máy dự phòng phục vụ công tác.",
      history: [
        { action: "created", performedBy: admin._id, note: "Nhập kho máy dự phòng.", at: new Date(now.getTime() - 4 * 86400000) },
      ],
    },
    {
      assetTag: "LP-2026-008",
      name: "Dell Inspiron 14 5420",
      type: "laptop",
      serialNumber: "INSP5420-112",
      specs: "Core i5-1235U, 16GB RAM, 256GB SSD",
      os: "Windows 11 Home",
      status: "maintenance",
      remoteTool: "anydesk",
      remoteId: "119 403 821",
      notes: "Lỗi quạt tản nhiệt kêu to và liệt phím Space, đang chờ linh kiện thay thế.",
      history: [
        { action: "created", performedBy: admin._id, at: new Date(now.getTime() - 40 * 86400000) },
        { action: "status_changed", performedBy: tech1._id, note: "Thu hồi chuyển phòng kỹ thuật bảo hành.", at: new Date(now.getTime() - 2 * 86400000) },
      ],
    },
  ]);

  const year = now.getFullYear();
  const requests = await AssetRequest.create([
    {
      requestCode: `AR-${year}-0001`,
      employee: duc._id,
      assetType: "laptop",
      note: "Cần cấp laptop ThinkPad Core i5 16GB RAM phục vụ công tác chi nhánh.",
      requestedBy: admin._id,
      technician: null,
      status: "pending",
      createdAt: new Date(now.getTime() - 2 * 86400000),
    },
    {
      requestCode: `AR-${year}-0002`,
      employee: giang._id,
      assetType: "laptop",
      note: "Nhân viên mới phòng Marketing cần laptop màn hình chuẩn màu làm đồ họa.",
      requestedBy: admin._id,
      technician: tech1._id,
      status: "in_progress",
      acceptedAt: new Date(now.getTime() - 1 * 86400000),
      createdAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      requestCode: `AR-${year}-0003`,
      employee: an._id,
      assetType: "laptop",
      note: "Bàn giao laptop ThinkPad T14s đợt tuyển dụng đầu quý.",
      requestedBy: admin._id,
      technician: tech1._id,
      asset: assets[0]._id,
      status: "completed",
      acceptedAt: new Date(now.getTime() - 21 * 86400000),
      completedAt: new Date(now.getTime() - 20 * 86400000),
      createdAt: new Date(now.getTime() - 22 * 86400000),
    },
  ]);

  await TicketCounter.create({
    _id: `asset-request:${year}`,
    year,
    sequence: requests.length,
  });

  return { assets, requests };
}

async function seedDatabase() {
  const now = new Date();
  const password = getSeedPassword();
  let databaseWasCleared = false;

  if (!env.mongoUri) {
    throw new Error("Thiếu biến môi trường MONGODB_URI.");
  }

  await connectDatabase();
  assertSafeDatabaseTarget();

  try {
    await clearExistingData();
    databaseWasCleared = true;
    await initializeIndexes();

    const accounts = await User.create(buildAccountDefinitions(password));
    const admin = accounts.find(({ role }) => role === "admin");
    const technicians = accounts.filter(({ role }) => role === "technician");
    const users = accounts.filter(({ role }) => role === "user");
    const categories = await Category.create(
      CATEGORY_DEFINITIONS.map((category) => ({
        ...category,
        isActive: true,
        createdBy: admin._id,
        updatedBy: admin._id,
      })),
    );
    const contexts = createTicketSeedContexts({
      now,
      admin,
      users,
      technicians,
      categories,
    });
    const tickets = await Ticket.create(contexts.map(({ ticket }) => ticket));
    const commentDefinitions = contexts.flatMap((context, index) =>
      context.comments.map((comment) => ({
        ...comment,
        ticket: tickets[index]._id,
      })),
    );
    const comments = await Comment.create(commentDefinitions);
    const completedContexts = contexts
      .map((context, index) => ({ ...context, savedTicket: tickets[index] }))
      .filter(({ savedTicket }) => COMPLETED_STATUSES.has(savedTicket.status));
    const ratingScores = [5, 4, 5, 3, 5, 4, 4, 5, 3, 5];
    const ratings = await Rating.create(
      completedContexts.map((context, index) => {
        const terminalAt =
          context.timeline.fields.closedAt ?? context.timeline.fields.resolvedAt;
        const ratedAt = addMinutes(terminalAt, 60);

        return {
          ticket: context.savedTicket._id,
          ratedBy: context.creator._id,
          technician: context.technician._id,
          score: ratingScores[index % ratingScores.length],
          feedback: RATING_FEEDBACK[index % RATING_FEEDBACK.length],
          createdAt: ratedAt,
          updatedAt: ratedAt,
        };
      }),
    );
    const year = getVietnamYear(now);

    await TicketCounter.create({
      _id: `ticket:${year}`,
      year,
      sequence: tickets.length,
    });

    const { assets, requests } = await seedAssetsAndRequests({
      accounts,
      admin,
      technicians,
      users,
      now,
    });

    assertSeedResult({ accounts, categories, tickets, comments, ratings });
    printSeedSummary({
      accounts,
      categories,
      tickets,
      comments,
      ratings,
      assets,
      requests,
      password,
    });
  } catch (error) {
    if (databaseWasCleared) {
      try {
        await clearExistingData({ silent: true });
        console.error("Seed thất bại; dữ liệu seed dở dang đã được dọn sạch.");
      } catch (cleanupError) {
        console.error(`Không thể dọn dữ liệu seed dở dang: ${cleanupError.message}`);
      }
    }

    throw error;
  }
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error(`Không thể seed database: ${error.message}`);
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDatabase();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}

await main();
