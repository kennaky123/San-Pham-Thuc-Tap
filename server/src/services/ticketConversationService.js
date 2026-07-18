import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import ApiError from "../utils/ApiError.js";

const personSelect = "fullName avatar role";

const commentResponseFields =
  "ticket sender content isInternal createdAt updatedAt " +
  "attachments.originalName attachments.mimeType attachments.sizeBytes " +
  "attachments.uploadedAt";

const statusHistoryPopulateOption = {
  path: "statusHistory.changedBy",
  select: personSelect,
};

const assignmentHistoryPopulateOptions = [
  {
    path: "assignmentHistory.fromTechnician",
    select: personSelect,
  },
  {
    path: "assignmentHistory.toTechnician",
    select: personSelect,
  },
  { path: "assignmentHistory.assignedBy", select: personSelect },
];

function referenceId(value) {
  if (!value) {
    return null;
  }

  return String(value._id ?? value);
}

export function canViewInternalContent(user, ticket) {
  if (user.role === "admin") {
    return true;
  }

  const technicianId = referenceId(user._id);
  const assignedTechnicianId = referenceId(ticket?.assignedTo);

  return (
    user.role === "technician" &&
    Boolean(technicianId) &&
    assignedTechnicianId === technicianId
  );
}

export function buildCommentVisibilityFilter(user, ticket) {
  return canViewInternalContent(user, ticket)
    ? {}
    : { isInternal: false };
}

export function sortChronologically(items) {
  return [...items].sort((left, right) => {
    const timeDifference =
      new Date(left.occurredAt).getTime() -
      new Date(right.occurredAt).getTime();

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return String(left._id).localeCompare(String(right._id));
  });
}

async function populateComment(comment) {
  await comment.populate({ path: "sender", select: personSelect });
  const returnedComment = comment.toObject();

  returnedComment.attachments = returnedComment.attachments.map(
    ({ storageKey: _storageKey, ...attachment }) => attachment,
  );

  return returnedComment;
}

export function buildCommentWriteFilter(ticketId, user, isInternal) {
  if (isInternal) {
    if (user.role !== "technician") {
      throw new ApiError(403, "Chỉ Technician được tạo ghi chú nội bộ.");
    }

    return {
      _id: ticketId,
      assignedTo: user._id,
      status: { $nin: ["closed", "cancelled"] },
    };
  }

  if (!["user", "technician"].includes(user.role)) {
    throw new ApiError(403, "Vai trò không được phép gửi comment.");
  }

  return {
    _id: ticketId,
    status: { $nin: ["closed", "cancelled"] },
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  };
}

export async function createTicketComment(ticketId, input, user, isInternal) {
  const now = new Date();
  const accessibleTicket = await Ticket.findOneAndUpdate(
    buildCommentWriteFilter(ticketId, user, isInternal),
    { $max: { lastActivityAt: now } },
    { new: false },
  ).select("_id");

  if (!accessibleTicket) {
    throw new ApiError(
      404,
      "Không tìm thấy ticket hoặc bạn không còn quyền gửi nội dung.",
    );
  }

  const comment = await Comment.create({
    ticket: ticketId,
    sender: user._id,
    content: input.content,
    isInternal,
  });

  return populateComment(comment);
}

export async function listTicketComments(ticketId, user, ticket, query) {
  const filter = {
    ticket: ticketId,
    ...buildCommentVisibilityFilter(user, ticket),
  };
  const skip = (query.page - 1) * query.limit;
  const sortDirection = query.sortOrder === "desc" ? -1 : 1;

  const [comments, totalItems] = await Promise.all([
    Comment.find(filter)
      .select(commentResponseFields)
      .populate({ path: "sender", select: personSelect })
      .sort({ createdAt: sortDirection, _id: sortDirection })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / query.limit);

  return {
    comments,
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

function mapStatusHistory(historyItem, redactAssignmentNote = false) {
  return {
    _id: historyItem._id,
    type: "status_change",
    fromStatus: historyItem.fromStatus ?? null,
    toStatus: historyItem.toStatus,
    changedBy: historyItem.changedBy,
    changedAt: historyItem.changedAt,
    note:
      redactAssignmentNote && historyItem.toStatus === "assigned"
        ? "Ticket đã được phân công cho nhân viên kỹ thuật."
        : historyItem.note ?? null,
    occurredAt: historyItem.changedAt,
  };
}

function mapAssignmentHistory(historyItem) {
  return {
    _id: historyItem._id,
    type: "assignment",
    fromTechnician: historyItem.fromTechnician ?? null,
    toTechnician: historyItem.toTechnician,
    assignedBy: historyItem.assignedBy,
    assignedAt: historyItem.assignedAt,
    reason: historyItem.reason ?? null,
    occurredAt: historyItem.assignedAt,
  };
}

export async function getTicketHistory(ticketId, user, accessTicket) {
  const includeInternalHistory = canViewInternalContent(user, accessTicket);
  const selectedFields = includeInternalHistory
    ? "ticketCode statusHistory assignmentHistory"
    : "ticketCode statusHistory";
  const populateOptions = includeInternalHistory
    ? [statusHistoryPopulateOption, ...assignmentHistoryPopulateOptions]
    : [statusHistoryPopulateOption];
  const ticket = await Ticket.findById(ticketId)
    .select(selectedFields)
    .populate(populateOptions)
    .lean();

  if (!ticket) {
    throw new ApiError(404, "Không tìm thấy ticket.");
  }

  const history = [
    ...(ticket.statusHistory ?? []).map((historyItem) =>
      mapStatusHistory(historyItem, !includeInternalHistory),
    ),
    ...(includeInternalHistory ? ticket.assignmentHistory ?? [] : []).map(
      mapAssignmentHistory,
    ),
  ];

  return {
    ticketCode: ticket.ticketCode,
    history: sortChronologically(history),
  };
}
