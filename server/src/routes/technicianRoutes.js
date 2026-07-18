import { Router } from "express";
import { listActiveTechnicians } from "../controllers/technicianController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  listActiveTechnicians,
);

export default router;
