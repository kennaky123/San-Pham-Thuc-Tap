import {
  assignTechnician as assignTechnicianService,
  cancelTicket as cancelTicketService,
  closeTicket as closeTicketService,
  createTicket as createTicketService,
  getTicketAttachment as getTicketAttachmentService,
  getTicketById as getTicketByIdService,
  listTickets as listTicketsService,
  updateTicketResolution as updateTicketResolutionService,
  updateTicketStatus as updateTicketStatusService,
} from "../services/ticketService.js";

function encodeFileName(fileName) {
  return encodeURIComponent(fileName).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export async function createTicket(request, response, next) {
  try {
    const ticket = await createTicketService(
      request.body,
      request.user,
      request.files,
    );

    return response.status(201).json({
      success: true,
      message: "Tạo ticket thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTickets(request, response, next) {
  try {
    const result = await listTicketsService(
      request.ticketQuery,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách ticket thành công.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTicketById(request, response, next) {
  try {
    const ticket = await getTicketByIdService(
      request.params.ticketId,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Lấy chi tiết ticket thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTicketAttachment(request, response, next) {
  try {
    const attachment = await getTicketAttachmentService(
      request.params.ticketId,
      request.params.attachmentId,
      request.user,
    );

    response.set({
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeFileName(attachment.originalName)}`,
      "Content-Type": attachment.mimeType,
      "X-Content-Type-Options": "nosniff",
    });

    return response.sendFile(attachment.filePath, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function assignTechnician(request, response, next) {
  try {
    const ticket = await assignTechnicianService(
      request.params.ticketId,
      request.body,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Phân công Technician thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTicketStatus(request, response, next) {
  try {
    const ticket = await updateTicketStatusService(
      request.params.ticketId,
      request.body,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Cập nhật trạng thái ticket thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTicketResolution(request, response, next) {
  try {
    const ticket = await updateTicketResolutionService(
      request.params.ticketId,
      request.body.resolution,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Cập nhật nội dung giải quyết thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function cancelTicket(request, response, next) {
  try {
    const ticket = await cancelTicketService(
      request.params.ticketId,
      request.body.reason,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Hủy ticket thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}

export async function closeTicket(request, response, next) {
  try {
    const ticket = await closeTicketService(
      request.params.ticketId,
      request.body.note,
      request.user,
    );

    return response.status(200).json({
      success: true,
      message: "Đóng ticket thành công.",
      data: { ticket },
    });
  } catch (error) {
    return next(error);
  }
}
