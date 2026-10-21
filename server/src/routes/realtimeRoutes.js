import { Router } from "express";
import { getRealtimeEvents } from "../controllers/realtimeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();
router.get("/", authenticate, authorizeRoles("user", "technician", "admin"), getRealtimeEvents);
export default router;
