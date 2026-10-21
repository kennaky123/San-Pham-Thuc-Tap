import { Router } from "express";
import { listAdminUsers } from "../controllers/adminUserController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();
router.get("/", authenticate, authorizeRoles("admin"), listAdminUsers);
export default router;
