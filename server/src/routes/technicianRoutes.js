import { Router } from "express";
import {
  createTechnician,
  deleteTechnician,
  listActiveTechnicians,
  listAdminTechnicians,
  updateTechnician,
} from "../controllers/technicianController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { validateObjectId, validateTechnician } from "../validators/adminValidators.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  listActiveTechnicians,
);
router.get("/admin", authenticate, authorizeRoles("admin"), listAdminTechnicians);
router.post("/admin", authenticate, authorizeRoles("admin"), validateTechnician, createTechnician);
router.patch("/admin/:technicianId", authenticate, authorizeRoles("admin"), validateObjectId("technicianId"), validateTechnician, updateTechnician);
router.delete("/admin/:technicianId", authenticate, authorizeRoles("admin"), validateObjectId("technicianId"), deleteTechnician);

export default router;
