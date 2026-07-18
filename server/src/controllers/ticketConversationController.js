import {
  createTicketComment as createTicketCommentService,
  getTicketHistory as getTicketHistoryService,
  listTicketComments as listTicketCommentsService,
} from "../services/ticketConversationService.js";

export async function createTicketComment(request, response, next) {
  try {
    const comment = await createTicketCommentService(
      request.params.ticketId,
      request.body,
      request.user,
      false,
    );

    return response.status(201).json({
      success: true,
      message: "Gửi comment thành công.",
      data: { comment },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createInternalNote(request, response, next) {
  try {
    const comment = await createTicketCommentService(
      request.params.ticketId,
      request.body,
      request.user,
      true,
    );

    return response.status(201).json({
      success: true,
      message: "Tạo ghi chú nội bộ thành công.",
      data: { comment },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTicketComments(request, response, next) {
  try {
    const result = await listTicketCommentsService(
      request.params.ticketId,
      request.user,
      request.ticket,
      request.commentQuery,
    );

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách comment thành công.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTicketHistory(request, response, next) {
  try {
    const result = await getTicketHistoryService(
      request.params.ticketId,
      request.user,
      request.ticket,
    );

    return response.status(200).json({
      success: true,
      message: "Lấy lịch sử xử lý ticket thành công.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
