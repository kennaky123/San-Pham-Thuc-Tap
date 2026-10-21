import { access } from "node:fs/promises";
import {
  TERMINAL_TICKET_STATUSES,
  USER_CANCELLABLE_STATUSES,
  canTechnicianTransition,
} from "../constants/ticket.js";
import { getUploadedFilePath } from "../config/upload.js";
import Category from "../models/Category.js";
import Ticket from "../models/Ticket.js";
import TicketCounter from "../models/TicketCounter.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const ticketSummaryPopulateOptions = [
  { path: "category", select: "name slug isActive" },
  {
    path: "createdBy",
    select: "fullName email department avatar role status",
  },
  {
    path: "assignedTo",
    select: "fullName email department avatar role status",
  },
];

const ticketDetailPopulateOptions = [
  ...ticketSummaryPopulateOptions,
  { path: "cancelledBy", select: "fullName email role" },
];

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getVietnamYear(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(date),
  );
}

export function formatTicketCode(year, sequence) {
  if (
    !Number.isInteger(year) ||
    year < 1000 ||
    year > 9999 ||
    !Number.isInteger(sequence) ||
    sequence < 1 ||
    sequence > 999_999
  ) {
    throw new ApiError(500, "Không thể tạo mã ticket hợp lệ.");
  }

  return `HD-${year}-${String(sequence).padStart(6, "0")}`;
}

async function incrementTicketCounter(year) {
  const counterId = `ticket:${year}`;

  try {
    return await TicketCounter.findOneAndUpdate(
      { _id: counterId },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { year },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    return TicketCounter.findByIdAndUpdate(
      counterId,
      { $inc: { sequence: 1 } },
      { new: true, runValidators: true },
    );
  }
}

async function generateTicketCode() {
  const year = getVietnamYear();
  const counter = await incrementTicketCounter(year);

  if (!counter) {
    throw new ApiError(500, "Không thể tăng bộ đếm mã ticket.");
  }

  return formatTicketCode(year, counter.sequence);
}

function buildRoleScope(user) {
  if (user.role === "admin") {
    return {};
  }

  if (user.role === "technician") {
    return { assignedTo: user._id };
  }

  if (user.role === "user") {
    return { createdBy: user._id };
  }

  throw new ApiError(403, "Vai trò không được phép truy cập ticket.");
}

export function serializeTicketForClient(ticket) {
  const returnedTicket =
    typeof ticket.toObject === "function" ? ticket.toObject() : { ...ticket };

  returnedTicket.attachments = (returnedTicket.attachments ?? []).map(
    ({ storageKey: _storageKey, uploadedBy: _uploadedBy, ...attachment }) =>
      attachment,
  );
  delete returnedTicket.statusHistory;
  delete returnedTicket.assignmentHistory;

  return returnedTicket;
}

async function populateTicket(ticket) {
  await ticket.populate(ticketDetailPopulateOptions);
  return serializeTicketForClient(ticket);
}

async function findAssignedTicket(ticketId, technicianId) {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    assignedTo: technicianId,
  });

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket được phân công.");
  }

  return ticket;
}

export async function createTicket(input, user, files = []) {
  const categoryExists = await Category.exists({
    _id: input.category,
    isActive: true,
  });

  if (!categoryExists) {
    throw new ApiError(400, "Danh mục không tồn tại hoặc đã bị vô hiệu hóa.");
  }

  const ticketCode = await generateTicketCode();
  const now = new Date();
  const attachments = files.map((file) => ({
    originalName: file.originalname,
    storageKey: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    uploadedBy: user._id,
    uploadedAt: now,
  }));
  const ticket = await Ticket.create({
    ticketCode,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    createdBy: user._id,
    attachments,
    status: "pending",
    lastActivityAt: now,
    statusHistory: [
      {
        fromStatus: null,
        toStatus: "pending",
        changedBy: user._id,
        note: "Ticket được tạo.",
        changedAt: now,
      },
    ],
  });

  return populateTicket(ticket);
}

export async function listTickets(query, user) {
  const filter = {};

  if (query.search) {
    const escapedSearch = escapeRegularExpression(query.search);
    const escapedCodeSearch = escapeRegularExpression(
      query.search.toUpperCase(),
    );

    filter.$or = [
      { ticketCode: { $regex: `^${escapedCodeSearch}` } },
      { title: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  if (query.status) {
    filter.status = query.status;
  } else if (query.statuses?.length > 0) {
    filter.status = { $in: query.statuses };
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.technician) {
    filter.assignedTo = query.technician;
  }

  Object.assign(filter, buildRoleScope(user));

  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const skip = (query.page - 1) * query.limit;

  const [tickets, totalItems] = await Promise.all([
    Ticket.find(filter)
      .select(
        "ticketCode title category priority status createdBy assignedTo " +
          "assignedAt startedAt waitingUserAt resolvedAt closedAt cancelledAt " +
          "lastActivityAt createdAt updatedAt",
      )
      .populate(ticketSummaryPopulateOptions)
      .sort({ createdAt: sortDirection, _id: sortDirection })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / query.limit);

  return {
    tickets,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
      hasPreviousPage: totalPages > 0 && query.page > 1,
      hasNextPage: query.page < totalPages,
    },
  };
}

export async function getTicketById(ticketId, user) {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    ...buildRoleScope(user),
  }).populate(ticketDetailPopulateOptions);

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket hoặc bạn không có quyền xem.");
  }

  return serializeTicketForClient(ticket);
}

export async function getTicketAttachment(
  ticketId,
  attachmentId,
  user,
) {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    ...buildRoleScope(user),
  }).select("attachments");

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket hoặc bạn không có quyền xem.");
  }

  const attachment = ticket.attachments.id(attachmentId);

  if (!attachment) {
    throw new ApiError(404, "Không tìm thấy tệp đính kèm.");
  }

  const filePath = getUploadedFilePath(attachment.storageKey);

  try {
    await access(filePath);
  } catch {
    throw new ApiError(404, "Tệp đính kèm không còn tồn tại trên máy chủ.");
  }

  return {
    filePath,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
  };
}

export async function assignTechnician(ticketId, input, admin) {
  const [ticket, technician] = await Promise.all([
    Ticket.findById(ticketId),
    User.findOne({
      _id: input.technicianId,
      role: "technician",
      status: "active",
    }),
  ]);

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket.");
  }

  if (!technician) {
    throw new ApiError(400, "Technician không tồn tại hoặc không hoạt động.");
  }

  if (TERMINAL_TICKET_STATUSES.includes(ticket.status)) {
    throw new ApiError(400, "Không thể phân công ticket đã kết thúc.");
  }

  if (ticket.assignedTo?.equals(technician._id)) {
    throw new ApiError(409, "Ticket đã được phân công cho Technician này.");
  }

  const now = new Date();
  const previousStatus = ticket.status;
  const previousTechnician = ticket.assignedTo;

  ticket.assignedTo = technician._id;
  ticket.assignedAt = now;
  ticket.status = "assigned";
  ticket.lastActivityAt = now;
  ticket.assignmentHistory.push({
    fromTechnician: previousTechnician,
    toTechnician: technician._id,
    assignedBy: admin._id,
    reason: input.reason,
    assignedAt: now,
  });

  if (previousStatus !== "assigned") {
    ticket.statusHistory.push({
      fromStatus: previousStatus,
      toStatus: "assigned",
      changedBy: admin._id,
      note: "Ticket đã được phân công cho nhân viên kỹ thuật.",
      changedAt: now,
    });
  }

  await ticket.save();
  return populateTicket(ticket);
}

export async function updateTicketStatus(ticketId, input, actor) {
  const ticket =
    actor.role === "admin"
      ? await Ticket.findById(ticketId)
      : await findAssignedTicket(ticketId, actor._id);

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket.");
  }

  if (!canTechnicianTransition(ticket.status, input.status)) {
    throw new ApiError(
      400,
      `Không thể chuyển trạng thái từ ${ticket.status} sang ${input.status}.`,
    );
  }

  const now = new Date();
  const previousStatus = ticket.status;

  if (input.status === "resolved") {
    const resolution = input.resolution || ticket.resolution;

    if (!resolution) {
      throw new ApiError(
        400,
        "Phải nhập nội dung giải quyết trước khi hoàn thành ticket.",
      );
    }

    ticket.resolution = resolution;
    ticket.resolvedAt = now;
  }

  if (input.status === "in_progress" && !ticket.startedAt) {
    ticket.startedAt = now;
  }

  if (input.status === "waiting_user") {
    ticket.waitingUserAt = now;
  }

  ticket.status = input.status;
  ticket.lastActivityAt = now;
  ticket.statusHistory.push({
    fromStatus: previousStatus,
    toStatus: input.status,
    changedBy: actor._id,
    note: input.note,
    changedAt: now,
  });

  await ticket.save();
  return populateTicket(ticket);
}

export async function updateTicketResolution(ticketId, resolution, technician) {
  const ticket = await findAssignedTicket(ticketId, technician._id);

  if (!["in_progress", "waiting_user"].includes(ticket.status)) {
    throw new ApiError(
      400,
      "Chỉ được nhập cách giải quyết khi ticket đang được xử lý.",
    );
  }

  ticket.resolution = resolution;
  ticket.lastActivityAt = new Date();
  await ticket.save();

  return populateTicket(ticket);
}

export async function cancelTicket(ticketId, reason, user) {
  const ticket = await Ticket.findOne(
    user.role === "admin"
      ? { _id: ticketId }
      : { _id: ticketId, createdBy: user._id },
  );

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket của bạn.");
  }

  const cancellableStatuses =
    user.role === "admin"
      ? ["pending", "assigned", "in_progress", "waiting_user"]
      : USER_CANCELLABLE_STATUSES;

  if (!cancellableStatuses.includes(ticket.status)) {
    throw new ApiError(
      400,
      "Không thể hủy ticket ở trạng thái hiện tại.",
    );
  }

  const now = new Date();
  const previousStatus = ticket.status;

  ticket.status = "cancelled";
  ticket.cancelledAt = now;
  ticket.cancelledBy = user._id;
  ticket.cancellationReason = reason;
  ticket.lastActivityAt = now;
  ticket.statusHistory.push({
    fromStatus: previousStatus,
    toStatus: "cancelled",
    changedBy: user._id,
    note: reason || `${user.role === "admin" ? "Admin" : "User"} hủy ticket.`,
    changedAt: now,
  });

  await ticket.save();
  return populateTicket(ticket);
}

export async function closeTicket(ticketId, note, actor) {
  const ticket = await Ticket.findOne(
    actor.role === "admin"
      ? { _id: ticketId }
      : { _id: ticketId, createdBy: actor._id },
  );

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket hoặc bạn không có quyền đóng.");
  }

  if (ticket.status !== "resolved") {
    throw new ApiError(400, "Chỉ được đóng ticket đã được giải quyết.");
  }

  const now = new Date();
  ticket.status = "closed";
  ticket.closedAt = now;
  ticket.lastActivityAt = now;
  ticket.statusHistory.push({
    fromStatus: "resolved",
    toStatus: "closed",
    changedBy: actor._id,
    note: note || "Ticket đã được xác nhận đóng.",
    changedAt: now,
  });

  await ticket.save();
  return populateTicket(ticket);
}
