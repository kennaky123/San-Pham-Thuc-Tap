import mongoose from "mongoose";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../constants/ticket.js";
import ApiError from "../utils/ApiError.js";

const technicianTargetStatuses = [
  "in_progress",
  "waiting_user",
  "resolved",
];

const MAX_PAGE = 1_000_000;

function rejectInvalidInput(errors, next) {
  if (errors.length > 0) {
    return next(
      new ApiError(400, "Dữ liệu đầu vào không hợp lệ.", errors),
    );
  }

  return next();
}

function normalizeOptionalString(value) {
  return typeof value === "string" ? value.trim() || null : null;
}

function normalizeQueryString(value, fieldName, errors) {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} phải là chuỗi.`);
    return null;
  }

  return value.trim() || null;
}

function normalizeBodyOptionalString(value, fieldName, errors) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} phải là chuỗi.`);
    return null;
  }

  return value.trim() || null;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return Number.NaN;
  }

  const normalizedValue = String(value);

  if (!/^\d+$/.test(normalizedValue)) {
    return Number.NaN;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);
  return Number.isSafeInteger(parsedValue) ? parsedValue : Number.NaN;
}

export function validateTicketId(request, _response, next) {
  const { ticketId } = request.params;

  if (!mongoose.isObjectIdOrHexString(ticketId)) {
    return next(new ApiError(400, "ID ticket không hợp lệ."));
  }

  return next();
}

export function validateAttachmentId(request, _response, next) {
  const { attachmentId } = request.params;

  if (!mongoose.isObjectIdOrHexString(attachmentId)) {
    return next(new ApiError(400, "ID tệp đính kèm không hợp lệ."));
  }

  return next();
}

export function validateCreateTicket(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const priority = body.priority ?? "medium";

    if (title.length < 5 || title.length > 200) {
      errors.push("Tiêu đề phải có từ 5 đến 200 ký tự.");
    }

    if (description.length < 10 || description.length > 5000) {
      errors.push("Mô tả phải có từ 10 đến 5000 ký tự.");
    }

    if (!mongoose.isObjectIdOrHexString(body.category)) {
      errors.push("Danh mục không hợp lệ.");
    }

    if (!TICKET_PRIORITIES.includes(priority)) {
      errors.push("Mức độ ưu tiên không hợp lệ.");
    }

    request.body = {
      title,
      description,
      category: body.category,
      priority,
    };

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateTicketQuery(request, _response, next) {
  try {
    const query = request.query ?? {};
    const errors = [];
    const search = normalizeQueryString(query.search, "Từ khóa tìm kiếm", errors);
    const status = normalizeQueryString(query.status, "Trạng thái", errors);
    const statusesValue = normalizeQueryString(
      query.statuses,
      "Danh sách trạng thái",
      errors,
    );
    const priority = normalizeQueryString(query.priority, "Mức độ ưu tiên", errors);
    const category = normalizeQueryString(query.category, "Danh mục", errors);
    const technician = normalizeQueryString(
      query.technician,
      "Technician",
      errors,
    );
    const sortOrder =
      normalizeQueryString(query.sortOrder, "Thứ tự sắp xếp", errors) ||
      "desc";
    const page = parsePositiveInteger(query.page, 1);
    const limit = parsePositiveInteger(query.limit, 10);

    if (search && search.length > 100) {
      errors.push("Từ khóa tìm kiếm không được vượt quá 100 ký tự.");
    }

    if (status && !TICKET_STATUSES.includes(status)) {
      errors.push("Bộ lọc trạng thái không hợp lệ.");
    }

    const statuses = statusesValue
      ? [...new Set(statusesValue.split(",").map((item) => item.trim()).filter(Boolean))]
      : [];

    if (
      statuses.length > TICKET_STATUSES.length ||
      statuses.some((item) => !TICKET_STATUSES.includes(item))
    ) {
      errors.push("Danh sách trạng thái lọc không hợp lệ.");
    }

    if (status && statuses.length > 0) {
      errors.push("Chỉ được dùng một kiểu bộ lọc trạng thái.");
    }

    if (priority && !TICKET_PRIORITIES.includes(priority)) {
      errors.push("Bộ lọc mức độ ưu tiên không hợp lệ.");
    }

    if (category && !mongoose.isObjectIdOrHexString(category)) {
      errors.push("Bộ lọc danh mục không hợp lệ.");
    }

    if (technician && !mongoose.isObjectIdOrHexString(technician)) {
      errors.push("Bộ lọc Technician không hợp lệ.");
    }

    if (!Number.isSafeInteger(page) || page < 1 || page > MAX_PAGE) {
      errors.push(`Trang phải là số nguyên từ 1 đến ${MAX_PAGE}.`);
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push("Số bản ghi mỗi trang phải nằm trong khoảng 1 đến 100.");
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      errors.push("Thứ tự sắp xếp phải là asc hoặc desc.");
    }

    request.ticketQuery = {
      search,
      status,
      statuses,
      priority,
      category,
      technician,
      page,
      limit,
      sortOrder,
    };

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateAssignment(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];
    const reason = normalizeBodyOptionalString(
      body.reason,
      "Lý do phân công",
      errors,
    );

    if (!mongoose.isObjectIdOrHexString(body.technicianId)) {
      errors.push("ID Technician không hợp lệ.");
    }

    if (reason && reason.length > 500) {
      errors.push("Lý do phân công không được vượt quá 500 ký tự.");
    }

    request.body = {
      technicianId: body.technicianId,
      reason,
    };

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateStatusUpdate(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];
    const status = normalizeOptionalString(body.status);
    const note = normalizeBodyOptionalString(body.note, "Ghi chú", errors);
    const resolution = normalizeBodyOptionalString(
      body.resolution,
      "Nội dung giải quyết",
      errors,
    );

    if (!technicianTargetStatuses.includes(status)) {
      errors.push("Trạng thái cập nhật của Technician không hợp lệ.");
    }

    if (!note || note.length > 500) {
      errors.push("Ghi chú trạng thái phải có từ 1 đến 500 ký tự.");
    }

    if (
      resolution &&
      (resolution.length < 10 || resolution.length > 5000)
    ) {
      errors.push("Nội dung giải quyết phải có từ 10 đến 5000 ký tự.");
    }

    if (resolution && status !== "resolved") {
      errors.push(
        "Chỉ gửi nội dung giải quyết khi chuyển ticket sang resolved.",
      );
    }

    request.body = { status, note, resolution };
    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateResolution(request, _response, next) {
  try {
    const errors = [];
    const resolution = normalizeBodyOptionalString(
      request.body?.resolution,
      "Nội dung giải quyết",
      errors,
    );

    if (!resolution || resolution.length < 10 || resolution.length > 5000) {
      errors.push("Nội dung giải quyết phải có từ 10 đến 5000 ký tự.");
    }

    request.body = { resolution };
    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateCancellation(request, _response, next) {
  try {
    const errors = [];
    const reason = normalizeBodyOptionalString(
      request.body?.reason,
      "Lý do hủy",
      errors,
    );

    if (reason && reason.length > 500) {
      errors.push("Lý do hủy không được vượt quá 500 ký tự.");
    }

    request.body = { reason };
    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateCloseTicket(request, _response, next) {
  try {
    const errors = [];
    const note = normalizeBodyOptionalString(
      request.body?.note,
      "Ghi chú đóng ticket",
      errors,
    );

    if (note && note.length > 500) {
      errors.push("Ghi chú đóng ticket không được vượt quá 500 ký tự.");
    }

    request.body = { note };
    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}
