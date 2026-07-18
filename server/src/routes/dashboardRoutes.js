import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate, authorizeRoles("admin"));
router.get("/", getDashboard);

export default router;
