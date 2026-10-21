import { Router } from "express";
import {
  getDashboard,
  getTechnicianDashboardData,
  getUserDashboardData,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.get("/user", authorizeRoles("user"), getUserDashboardData);
router.get("/technician", authorizeRoles("technician"), getTechnicianDashboardData);
router.get("/", authorizeRoles("admin"), getDashboard);

export default router;
