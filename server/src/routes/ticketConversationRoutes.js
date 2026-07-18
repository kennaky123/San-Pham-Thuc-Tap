import { Router } from "express";
import {
  createTicketComment,
  createInternalNote,
  getTicketHistory,
  listTicketComments,
} from "../controllers/ticketConversationController.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  authorizeInternalNote,
  requireTicketParticipantOrAdmin,
} from "../middleware/ticketAccess.js";
import {
  validateCommentListQuery,
  validateCreateComment,
} from "../validators/commentValidators.js";
import { validateTicketId } from "../validators/ticketValidators.js";

const router = Router({ mergeParams: true });

router.get(
  "/comments",
  authorizeRoles("user", "technician", "admin"),
  validateTicketId,
  validateCommentListQuery,
  requireTicketParticipantOrAdmin,
  listTicketComments,
);

router.post(
  "/comments",
  authorizeRoles("user", "technician"),
  validateTicketId,
  requireTicketParticipantOrAdmin,
  validateCreateComment,
  createTicketComment,
);

router.post(
  "/internal-notes",
  authorizeRoles("technician"),
  validateTicketId,
  requireTicketParticipantOrAdmin,
  validateCreateComment,
  authorizeInternalNote,
  createInternalNote,
);

router.get(
  "/history",
  authorizeRoles("user", "technician", "admin"),
  validateTicketId,
  requireTicketParticipantOrAdmin,
  getTicketHistory,
);

export default router;
