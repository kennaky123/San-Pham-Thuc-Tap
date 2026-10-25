import { Router } from "express";
import {
  handleAgentPing,
  handleAgentUsbEvent,
  handleDeleteUsbDevice,
  handleDownloadAgent,
  handleGetNetworkInfo,
  handleGetUsbDashboard,
  handleUpdateUsbPolicy,
} from "../controllers/usbController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  validateAgentUsbEvent,
  validateUpdateUsbPolicy,
  validateUsbId,
  validateUsbQuery,
} from "../validators/usbValidators.js";

const router = Router();

// Public / Agent endpoints cho ITHelpdeskUSBAgent.exe gửi dữ liệu từ máy nhân viên
router.get("/agent-ping", handleAgentPing);
router.post("/agent-event", validateAgentUsbEvent, handleAgentUsbEvent);
router.get("/download-agent", handleDownloadAgent);

// Protected endpoints cho Admin & Technician
router.get(
  "/network-info",
  authenticate,
  authorizeRoles("admin", "technician"),
  handleGetNetworkInfo,
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateUsbQuery,
  handleGetUsbDashboard,
);

router.patch(
  "/:usbId/policy",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateUsbId,
  validateUpdateUsbPolicy,
  handleUpdateUsbPolicy,
);

router.delete(
  "/:usbId",
  authenticate,
  authorizeRoles("admin"),
  validateUsbId,
  handleDeleteUsbDevice,
);

export default router;
