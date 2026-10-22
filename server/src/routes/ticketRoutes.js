import { Router } from "express";
import {
  assignTechnician,
  cancelTicket,
  closeTicket,
  createTicket,
  getTicketAttachment,
  getTicketById,
  listTickets,
  updateTicketResolution,
  updateTicketStatus,
} from "../controllers/ticketController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  cleanupTicketAttachmentUpload,
  uploadTicketAttachments,
  validateTicketAttachmentContent,
} from "../middleware/ticketAttachmentUpload.js";
import ticketConversationRoutes from "./ticketConversationRoutes.js";
import {
  validateAssignment,
  validateAttachmentId,
  validateCancellation,
  validateCloseTicket,
  validateCreateTicket,
  validateResolution,
  validateStatusUpdate,
  validateTicketId,
  validateTicketQuery,
} from "../validators/ticketValidators.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(
    authorizeRoles("user", "technician", "admin"),
    validateTicketQuery,
    listTickets,
  )
  .post(
    authorizeRoles("user", "technician", "admin"),
    uploadTicketAttachments,
    validateTicketAttachmentContent,
    validateCreateTicket,
    createTicket,
    cleanupTicketAttachmentUpload,
  );

router.patch(
  "/:ticketId/assign",
  authorizeRoles("admin", "technician"),
  validateTicketId,
  validateAssignment,
  assignTechnician,
);

router.patch(
  "/:ticketId/status",
  authorizeRoles("technician", "admin"),
  validateTicketId,
  validateStatusUpdate,
  updateTicketStatus,
);

router.patch(
  "/:ticketId/resolution",
  authorizeRoles("technician"),
  validateTicketId,
  validateResolution,
  updateTicketResolution,
);

router.patch(
  "/:ticketId/cancel",
  authorizeRoles("user", "admin"),
  validateTicketId,
  validateCancellation,
  cancelTicket,
);

router.patch(
  "/:ticketId/close",
  authorizeRoles("user", "admin"),
  validateTicketId,
  validateCloseTicket,
  closeTicket,
);

router.get(
  "/:ticketId/attachments/:attachmentId",
  authorizeRoles("user", "technician", "admin"),
  validateTicketId,
  validateAttachmentId,
  getTicketAttachment,
);

router.use("/:ticketId", ticketConversationRoutes);

router.get(
  "/:ticketId",
  authorizeRoles("user", "technician", "admin"),
  validateTicketId,
  getTicketById,
);

export default router;
