import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import {
  authorizeInternalNote,
  buildTicketAccessFilter,
  isTicketParticipant,
} from "../src/middleware/ticketAccess.js";
import Comment from "../src/models/Comment.js";
import {
  buildCommentVisibilityFilter,
  buildCommentWriteFilter,
  canViewInternalContent,
  sortChronologically,
} from "../src/services/ticketConversationService.js";
import {
  validateCommentListQuery,
  validateCreateComment,
} from "../src/validators/commentValidators.js";

function runMiddleware(middleware, requestObject) {
  return new Promise((resolve) => {
    middleware(requestObject, {}, (error) => resolve(error));
  });
}

function createUser(role, id = new mongoose.Types.ObjectId()) {
  return { _id: id, role };
}

test("Comment mặc định là comment công khai", async () => {
  const comment = new Comment({
    ticket: new mongoose.Types.ObjectId(),
    sender: new mongoose.Types.ObjectId(),
    content: "Tôi đã thử khởi động lại máy nhưng vẫn còn lỗi.",
  });

  await comment.validate();

  assert.equal(comment.isInternal, false);
  assert.deepEqual(comment.attachments, []);
});

test("validateCreateComment chuẩn hóa nội dung và loại field không cho phép", async () => {
  const requestObject = {
    body: {
      content: "  Vui lòng kiểm tra lại kết nối.  ",
      sender: new mongoose.Types.ObjectId().toString(),
      ticket: new mongoose.Types.ObjectId().toString(),
    },
  };

  const error = await runMiddleware(validateCreateComment, requestObject);

  assert.equal(error, undefined);
  assert.deepEqual(requestObject.body, {
    content: "Vui lòng kiểm tra lại kết nối.",
  });
});

test("client không thể tự gắn isInternal trên endpoint comment", async () => {
  const requestObject = {
    body: {
      content: "Nội dung cố gắng tạo ghi chú nội bộ.",
      isInternal: true,
    },
  };

  const error = await runMiddleware(validateCreateComment, requestObject);

  assert.equal(error.statusCode, 400);
});

test("validateCommentListQuery giới hạn phân trang", async () => {
  const validRequest = { query: { page: "2", limit: "50" } };
  const invalidRequest = { query: { page: "1", limit: "101" } };

  const validError = await runMiddleware(
    validateCommentListQuery,
    validRequest,
  );
  const invalidError = await runMiddleware(
    validateCommentListQuery,
    invalidRequest,
  );

  assert.equal(validError, undefined);
  assert.deepEqual(validRequest.commentQuery, {
    page: 2,
    limit: 50,
    sortOrder: "asc",
  });
  assert.equal(invalidError.statusCode, 400);
});

test("validateCommentListQuery hỗ trợ lấy comment mới nhất trước", async () => {
  const requestObject = {
    query: { page: "1", limit: "100", sortOrder: "desc" },
  };

  const error = await runMiddleware(validateCommentListQuery, requestObject);

  assert.equal(error, undefined);
  assert.deepEqual(requestObject.commentQuery, {
    page: 1,
    limit: 100,
    sortOrder: "desc",
  });
});

test("chỉ creator, current assignee hoặc admin là người liên quan", () => {
  const creatorId = new mongoose.Types.ObjectId();
  const technicianId = new mongoose.Types.ObjectId();
  const ticket = {
    createdBy: creatorId,
    assignedTo: technicianId,
  };

  assert.equal(isTicketParticipant(ticket, createUser("user", creatorId)), true);
  assert.equal(
    isTicketParticipant(ticket, createUser("technician", technicianId)),
    true,
  );
  assert.equal(isTicketParticipant(ticket, createUser("admin")), true);
  assert.equal(isTicketParticipant(ticket, createUser("user")), false);
});

test("filter truy cập ticket trả cùng scope creator hoặc assignee", () => {
  const ticketId = new mongoose.Types.ObjectId();
  const user = createUser("user");
  const admin = createUser("admin");

  assert.deepEqual(buildTicketAccessFilter(ticketId, admin), {
    _id: ticketId,
  });
  assert.deepEqual(buildTicketAccessFilter(ticketId, user), {
    _id: ticketId,
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  });
});

test("Technician là creator nhưng không được giao vẫn không thấy internal note", () => {
  const creatorTechnician = createUser("technician");
  const assignedTechnicianId = new mongoose.Types.ObjectId();
  const ticket = {
    createdBy: creatorTechnician._id,
    assignedTo: assignedTechnicianId,
  };

  assert.equal(
    canViewInternalContent(creatorTechnician, ticket),
    false,
  );
  assert.deepEqual(
    buildCommentVisibilityFilter(creatorTechnician, ticket),
    { isInternal: false },
  );
});

test("current assignee và admin được xem internal note", () => {
  const technician = createUser("technician");
  const admin = createUser("admin");
  const ticket = { assignedTo: technician._id };

  assert.equal(canViewInternalContent(technician, ticket), true);
  assert.equal(canViewInternalContent(admin, ticket), true);
  assert.deepEqual(buildCommentVisibilityFilter(technician, ticket), {});
  assert.deepEqual(buildCommentVisibilityFilter(admin, ticket), {});
});

test("comment và ghi chú bị khóa khi ticket đã đóng hoặc hủy", () => {
  const user = createUser("user");
  const technician = createUser("technician");
  const ticketId = new mongoose.Types.ObjectId();

  assert.deepEqual(buildCommentWriteFilter(ticketId, user, false), {
    _id: ticketId,
    status: { $nin: ["closed", "cancelled"] },
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  });
  assert.deepEqual(buildCommentWriteFilter(ticketId, technician, true), {
    _id: ticketId,
    assignedTo: technician._id,
    status: { $nin: ["closed", "cancelled"] },
  });
});

test("authorizeInternalNote chỉ cho current assignee", async () => {
  const assignedTechnician = createUser("technician");
  const otherTechnician = createUser("technician");
  const ticket = { assignedTo: assignedTechnician._id };

  const allowedError = await runMiddleware(authorizeInternalNote, {
    user: assignedTechnician,
    ticket,
  });
  const deniedError = await runMiddleware(authorizeInternalNote, {
    user: otherTechnician,
    ticket,
  });

  assert.equal(allowedError, undefined);
  assert.equal(deniedError.statusCode, 403);
});

test("sortChronologically sắp xếp thời gian tăng dần và ổn định theo id", () => {
  const items = [
    { _id: "b", occurredAt: "2026-01-02T00:00:00.000Z" },
    { _id: "c", occurredAt: "2026-01-01T00:00:00.000Z" },
    { _id: "a", occurredAt: "2026-01-02T00:00:00.000Z" },
  ];

  const sortedItems = sortChronologically(items);

  assert.deepEqual(
    sortedItems.map((item) => item._id),
    ["c", "a", "b"],
  );
  assert.deepEqual(
    items.map((item) => item._id),
    ["b", "c", "a"],
  );
});
