import axiosClient from "../api/axiosClient.js";
import { getActiveCategories } from "./categoryService.js";
import { getActiveTechnicians } from "./userService.js";

function isValidTicket(ticket) {
  return Boolean(
    ticket &&
      typeof ticket._id === "string" &&
      typeof ticket.ticketCode === "string" &&
      typeof ticket.title === "string" &&
      typeof ticket.priority === "string" &&
      typeof ticket.status === "string" &&
      typeof ticket.createdAt === "string",
  );
}

function isValidPagination(pagination) {
  return Boolean(
    pagination &&
      Number.isInteger(pagination.page) &&
      Number.isInteger(pagination.limit) &&
      Number.isInteger(pagination.totalItems) &&
      Number.isInteger(pagination.totalPages) &&
      typeof pagination.hasPreviousPage === "boolean" &&
      typeof pagination.hasNextPage === "boolean",
  );
}

function createInvalidResponseError(message) {
  const error = new Error(message);
  error.code = "INVALID_TICKET_RESPONSE";
  return error;
}

function isValidCreatedTicket(ticket) {
  return Boolean(
    ticket &&
      typeof ticket._id === "string" &&
      typeof ticket.ticketCode === "string",
  );
}

function isValidTicketDetail(ticket) {
  return Boolean(
    ticket &&
      typeof ticket._id === "string" &&
      typeof ticket.ticketCode === "string" &&
      typeof ticket.title === "string" &&
      typeof ticket.description === "string" &&
      typeof ticket.priority === "string" &&
      typeof ticket.status === "string" &&
      typeof ticket.createdAt === "string" &&
      Array.isArray(ticket.attachments),
  );
}

function isValidComment(comment) {
  return Boolean(
    comment &&
      typeof comment._id === "string" &&
      typeof comment.content === "string" &&
      typeof comment.isInternal === "boolean" &&
      typeof comment.createdAt === "string" &&
      comment.sender &&
      typeof comment.sender.fullName === "string",
  );
}

function isValidHistoryItem(item) {
  return Boolean(
    item &&
      typeof item._id === "string" &&
      ["status_change", "assignment"].includes(item.type) &&
      typeof item.occurredAt === "string",
  );
}

function getMutationResult(response, fieldName, validator) {
  const value = response.data?.data?.[fieldName];

  if (!validator(value)) {
    throw createInvalidResponseError("Phản hồi cập nhật ticket không hợp lệ.");
  }

  return {
    data: value,
    message:
      typeof response.data?.message === "string"
        ? response.data.message
        : "Cập nhật thành công.",
  };
}

function buildTicketParams(query) {
  const params = {
    page: query.page,
    limit: query.limit,
    sortOrder: query.sortOrder,
  };

  for (const field of [
    "search",
    "status",
    "statuses",
    "priority",
    "category",
    "technician",
  ]) {
    if (query[field]) {
      params[field] = query[field];
    }
  }

  return params;
}

export async function getTicketList(query, { signal } = {}) {
  const response = await axiosClient.get("/tickets", {
    params: buildTicketParams(query),
    signal,
  });
  const result = response.data?.data;

  if (
    !result ||
    !Array.isArray(result.tickets) ||
    !result.tickets.every(isValidTicket) ||
    !isValidPagination(result.pagination)
  ) {
    throw createInvalidResponseError("Phản hồi danh sách ticket không hợp lệ.");
  }

  return result;
}

export async function getTicketFilterOptions({ signal } = {}) {
  const [categories, technicianRecords] = await Promise.all([
    getActiveCategories({ signal }),
    getActiveTechnicians({ signal }),
  ]);
  const technicians = technicianRecords
    .map((technician) => ({
      id: technician._id,
      name: technician.fullName.trim(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "vi"));

  return { categories, technicians };
}

export async function createTicket(
  { title, category, priority, description, attachments },
  { signal, onUploadProgress } = {},
) {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("category", category);
  formData.append("priority", priority);
  formData.append("description", description.trim());

  attachments.forEach(({ file }) => {
    formData.append("attachments", file);
  });

  const response = await axiosClient.post("/tickets", formData, {
    signal,
    timeout: 30_000,
    onUploadProgress,
  });
  const ticket = response.data?.data?.ticket;

  if (!isValidCreatedTicket(ticket)) {
    throw createInvalidResponseError("Phản hồi tạo ticket không hợp lệ.");
  }

  return {
    ticket,
    message:
      typeof response.data?.message === "string"
        ? response.data.message
        : "Tạo yêu cầu thành công.",
  };
}

export async function getTicketDetail(ticketId, { signal } = {}) {
  const response = await axiosClient.get(`/tickets/${ticketId}`, { signal });
  const ticket = response.data?.data?.ticket;

  if (!isValidTicketDetail(ticket)) {
    throw createInvalidResponseError("Phản hồi chi tiết ticket không hợp lệ.");
  }

  return ticket;
}

export async function getTicketComments(ticketId, { signal } = {}) {
  const response = await axiosClient.get(`/tickets/${ticketId}/comments`, {
    signal,
    params: { page: 1, limit: 100, sortOrder: "desc" },
  });
  const result = response.data?.data;

  if (
    !result ||
    !Array.isArray(result.comments) ||
    !result.comments.every(isValidComment) ||
    !isValidPagination(result.pagination)
  ) {
    throw createInvalidResponseError("Phản hồi trao đổi ticket không hợp lệ.");
  }

  return {
    ...result,
    comments: [...result.comments].reverse(),
  };
}

export async function getTicketHistory(ticketId, { signal } = {}) {
  const response = await axiosClient.get(`/tickets/${ticketId}/history`, {
    signal,
  });
  const result = response.data?.data;

  if (!result || !Array.isArray(result.history) || !result.history.every(isValidHistoryItem)) {
    throw createInvalidResponseError("Phản hồi lịch sử ticket không hợp lệ.");
  }

  return result.history;
}

export async function getTicketAttachmentBlob(
  ticketId,
  attachmentId,
  { signal } = {},
) {
  const response = await axiosClient.get(
    `/tickets/${ticketId}/attachments/${attachmentId}`,
    { signal, responseType: "blob", timeout: 30_000 },
  );

  return response.data;
}

export async function postTicketComment(ticketId, content) {
  const response = await axiosClient.post(`/tickets/${ticketId}/comments`, {
    content,
  });
  return getMutationResult(response, "comment", isValidComment);
}

export async function postInternalNote(ticketId, content) {
  const response = await axiosClient.post(
    `/tickets/${ticketId}/internal-notes`,
    { content },
  );
  return getMutationResult(response, "comment", isValidComment);
}

export async function assignTicket(ticketId, payload) {
  const response = await axiosClient.patch(
    `/tickets/${ticketId}/assign`,
    payload,
  );
  return getMutationResult(response, "ticket", isValidTicketDetail);
}

export async function updateTicketStatus(ticketId, payload) {
  const response = await axiosClient.patch(
    `/tickets/${ticketId}/status`,
    payload,
  );
  return getMutationResult(response, "ticket", isValidTicketDetail);
}

export async function updateTicketResolution(ticketId, resolution) {
  const response = await axiosClient.patch(
    `/tickets/${ticketId}/resolution`,
    { resolution },
  );
  return getMutationResult(response, "ticket", isValidTicketDetail);
}

export async function cancelTicket(ticketId, reason) {
  const response = await axiosClient.patch(`/tickets/${ticketId}/cancel`, {
    reason,
  });
  return getMutationResult(response, "ticket", isValidTicketDetail);
}

export async function closeTicket(ticketId, note) {
  const response = await axiosClient.patch(`/tickets/${ticketId}/close`, {
    note,
  });
  return getMutationResult(response, "ticket", isValidTicketDetail);
}

export function getTicketDetailErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
  }

  if (error?.code === "INVALID_TICKET_RESPONSE") {
    return "Dữ liệu ticket nhận được không đúng định dạng.";
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.";
  }

  if (error.response.status === 404) {
    return "Không tìm thấy ticket hoặc bạn không có quyền truy cập.";
  }

  if (error.response.status === 403) {
    return "Tài khoản của bạn không có quyền thực hiện thao tác này.";
  }

  const apiMessage = error.response.data?.message;
  return typeof apiMessage === "string" && apiMessage.length > 0
    ? apiMessage
    : "Không thể tải dữ liệu ticket. Vui lòng thử lại.";
}

export function getTicketActionError(error) {
  const message = getTicketDetailErrorMessage(error);
  const details = Array.isArray(error?.response?.data?.errors)
    ? error.response.data.errors.filter((item) => typeof item === "string")
    : [];

  return { message, details };
}

export function getCreateTicketError(error) {
  if (error?.code === "ECONNABORTED") {
    return {
      message: "Thời gian gửi yêu cầu đã hết. Vui lòng thử lại.",
      details: [],
    };
  }

  if (error?.code === "INVALID_TICKET_RESPONSE") {
    return {
      message: "Máy chủ đã tạo ticket nhưng phản hồi không đúng định dạng.",
      details: [],
    };
  }

  if (!error?.response) {
    return {
      message: "Không thể kết nối đến máy chủ. Dữ liệu trong form vẫn được giữ lại.",
      details: [],
    };
  }

  const status = error.response.status;
  const responseData = error.response.data;
  const details = Array.isArray(responseData?.errors)
    ? responseData.errors.filter((item) => typeof item === "string")
    : [];

  if (status === 403) {
    return {
      message: "Tài khoản của bạn không có quyền tạo yêu cầu hỗ trợ.",
      details,
    };
  }

  if (status === 413) {
    return {
      message: "Ảnh đính kèm vượt quá dung lượng cho phép.",
      details,
    };
  }

  if (status >= 500) {
    return {
      message: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
      details,
    };
  }

  return {
    message:
      typeof responseData?.message === "string" && responseData.message.length > 0
        ? responseData.message
        : "Không thể tạo yêu cầu. Vui lòng kiểm tra lại thông tin.",
    details,
  };
}

export function getTicketListErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
  }

  if (error?.code === "INVALID_TICKET_RESPONSE") {
    return "Dữ liệu danh sách ticket nhận được không đúng định dạng.";
  }

  if (
    error?.code === "INVALID_CATEGORY_RESPONSE" ||
    error?.code === "INVALID_USER_RESPONSE"
  ) {
    return "Dữ liệu tùy chọn bộ lọc nhận được không đúng định dạng.";
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
  }

  if (error.response.status === 403) {
    return "Tài khoản của bạn không có quyền xem danh sách ticket này.";
  }

  if (error.response.status >= 500) {
    return "Máy chủ đang gặp sự cố khi tải danh sách ticket.";
  }

  const apiMessage = error.response.data?.message;
  return typeof apiMessage === "string" && apiMessage.length > 0
    ? apiMessage
    : "Không thể tải danh sách ticket. Vui lòng thử lại.";
}
