import { Router } from "express";
import { listActiveCategories } from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("user", "technician", "admin"),
  listActiveCategories,
);

export default router;
