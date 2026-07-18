import Ticket from "../models/Ticket.js";
import ApiError from "../utils/ApiError.js";

function referenceId(value) {
  if (!value) {
    return null;
  }

  return String(value._id ?? value);
}

export function isTicketParticipant(ticket, user) {
  if (!ticket || !user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const userId = referenceId(user._id);
  const creatorId = referenceId(ticket.createdBy);
  const assignedTechnicianId = referenceId(ticket.assignedTo);

  if (!userId) {
    return false;
  }

  return (
    creatorId === userId ||
    assignedTechnicianId === userId
  );
}

export function buildTicketAccessFilter(ticketId, user) {
  if (user.role === "admin") {
    return { _id: ticketId };
  }

  return {
    _id: ticketId,
    $or: [{ createdBy: user._id }, { assignedTo: user._id }],
  };
}

export async function requireTicketParticipantOrAdmin(
  request,
  _response,
  next,
) {
  try {
    const ticket = await Ticket.findOne(
      buildTicketAccessFilter(request.params.ticketId, request.user),
    )
      .select("ticketCode createdBy assignedTo status")
      .lean();

    if (!ticket) {
      throw new ApiError(
        404,
        "Không tìm thấy ticket hoặc bạn không có quyền truy cập nội dung.",
      );
    }

    request.ticket = ticket;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorizeInternalNote(request, _response, next) {
  const technicianId = referenceId(request.user._id);
  const assignedTechnicianId = referenceId(request.ticket?.assignedTo);
  const isAssignedTechnician =
    request.user.role === "technician" &&
    Boolean(technicianId) &&
    assignedTechnicianId === technicianId;

  if (!isAssignedTechnician) {
    return next(
      new ApiError(
        403,
        "Chỉ Technician đang được phân công mới có thể tạo ghi chú nội bộ.",
      ),
    );
  }

  return next();
}
