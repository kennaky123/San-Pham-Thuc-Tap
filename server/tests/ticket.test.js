import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import {
  canTechnicianTransition,
} from "../src/constants/ticket.js";
import Ticket from "../src/models/Ticket.js";
import {
  formatTicketCode,
  serializeTicketForClient,
} from "../src/services/ticketService.js";
import {
  validateCloseTicket,
  validateCreateTicket,
  validateStatusUpdate,
  validateTicketQuery,
} from "../src/validators/ticketValidators.js";

function runMiddleware(middleware, request) {
  return new Promise((resolve) => {
    middleware(request, {}, (error) => resolve(error));
  });
}

function createValidTicket(overrides = {}) {
  return new Ticket({
    ticketCode: "HD-2026-000001",
    title: "Không thể truy cập mạng nội bộ",
    description: "Máy tính không thể kết nối vào hệ thống mạng nội bộ.",
    category: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    ...overrides,
  });
}

test("formatTicketCode tạo mã đúng định dạng", () => {
  assert.equal(formatTicketCode(2026, 1), "HD-2026-000001");
  assert.equal(formatTicketCode(2026, 999999), "HD-2026-999999");
});

test("Ticket mặc định có priority medium và status pending", async () => {
  const ticket = createValidTicket();

  await ticket.validate();

  assert.equal(ticket.priority, "medium");
  assert.equal(ticket.status, "pending");
});

test("Ticket resolved bắt buộc có nội dung giải quyết", async () => {
  const ticket = createValidTicket({
    status: "resolved",
    assignedTo: new mongoose.Types.ObjectId(),
    resolvedAt: new Date(),
  });

  await assert.rejects(ticket.validate(), /Nội dung giải quyết/);
});

test("validateCreateTicket từ chối dữ liệu không hợp lệ", async () => {
  const request = {
    body: {
      title: "Lỗi",
      description: "Ngắn",
      category: "invalid-id",
      priority: "critical",
    },
  };

  const error = await runMiddleware(validateCreateTicket, request);

  assert.equal(error.statusCode, 400);
  assert.equal(error.details.length, 4);
});

test("validateTicketQuery chuẩn hóa phân trang và sắp xếp", async () => {
  const request = {
    query: {
      page: "2",
      limit: "20",
      sortOrder: "asc",
      status: "pending",
    },
  };

  const error = await runMiddleware(validateTicketQuery, request);

  assert.equal(error, undefined);
  assert.equal(request.ticketQuery.page, 2);
  assert.equal(request.ticketQuery.limit, 20);
  assert.equal(request.ticketQuery.sortOrder, "asc");
});

test("validateTicketQuery từ chối page vượt giới hạn an toàn", async () => {
  const request = {
    query: {
      page: "999999999999999999999999999999",
    },
  };

  const error = await runMiddleware(validateTicketQuery, request);

  assert.equal(error.statusCode, 400);
});

test("validateTicketQuery hỗ trợ lọc nhiều trạng thái cho danh sách kỹ thuật viên", async () => {
  const request = {
    query: {
      statuses: "in_progress,waiting_user,in_progress",
      page: "1",
      limit: "10",
    },
  };

  const error = await runMiddleware(validateTicketQuery, request);

  assert.equal(error, undefined);
  assert.deepEqual(request.ticketQuery.statuses, [
    "in_progress",
    "waiting_user",
  ]);
  assert.equal(request.ticketQuery.status, null);
});

test("validateTicketQuery từ chối trạng thái không hợp lệ trong danh sách", async () => {
  const request = {
    query: { statuses: "assigned,unknown" },
  };

  const error = await runMiddleware(validateTicketQuery, request);

  assert.equal(error.statusCode, 400);
  assert.match(error.details.join(" "), /Danh sách trạng thái lọc không hợp lệ/);
});

test("validateStatusUpdate không bỏ qua resolution sai ngữ cảnh", async () => {
  const request = {
    body: {
      status: "in_progress",
      note: "Bắt đầu kiểm tra ticket.",
      resolution: "Đã thay card mạng và kiểm tra kết nối thành công.",
    },
  };

  const error = await runMiddleware(validateStatusUpdate, request);

  assert.equal(error.statusCode, 400);
});

test("validateStatusUpdate bắt buộc ghi chú lịch sử", async () => {
  const request = {
    body: {
      status: "in_progress",
    },
  };

  const error = await runMiddleware(validateStatusUpdate, request);

  assert.equal(error.statusCode, 400);
  assert.match(error.details.join(" "), /Ghi chú trạng thái/);
});

test("Technician chỉ được chuyển trạng thái theo luồng", () => {
  assert.equal(canTechnicianTransition("assigned", "in_progress"), true);
  assert.equal(canTechnicianTransition("assigned", "resolved"), false);
  assert.equal(canTechnicianTransition("waiting_user", "resolved"), false);
  assert.equal(canTechnicianTransition("resolved", "in_progress"), false);
});

test("response ticket không làm lộ storageKey và lịch sử nội bộ", () => {
  const returnedTicket = serializeTicketForClient({
    _id: "ticket-id",
    attachments: [
      {
        _id: "attachment-id",
        originalName: "anh-loi.png",
        storageKey: "secret-storage-key.png",
        uploadedBy: "user-id",
        mimeType: "image/png",
      },
    ],
    statusHistory: [{ note: "status note" }],
    assignmentHistory: [{ reason: "internal reason" }],
  });

  assert.equal(returnedTicket.attachments[0].storageKey, undefined);
  assert.equal(returnedTicket.attachments[0].uploadedBy, undefined);
  assert.equal(returnedTicket.statusHistory, undefined);
  assert.equal(returnedTicket.assignmentHistory, undefined);
});

test("validateCloseTicket chuẩn hóa ghi chú và giới hạn độ dài", async () => {
  const validRequest = { body: { note: "  Người dùng xác nhận đã xử lý.  " } };
  const invalidRequest = { body: { note: "a".repeat(501) } };

  const validError = await runMiddleware(validateCloseTicket, validRequest);
  const invalidError = await runMiddleware(validateCloseTicket, invalidRequest);

  assert.equal(validError, undefined);
  assert.equal(validRequest.body.note, "Người dùng xác nhận đã xử lý.");
  assert.equal(invalidError.statusCode, 400);
});
