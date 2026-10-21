import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listActiveCategories,
  listAdminCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { validateCategory, validateObjectId } from "../validators/adminValidators.js";

const router = Router();

router.get("/admin", authenticate, authorizeRoles("admin"), listAdminCategories);
router.post("/admin", authenticate, authorizeRoles("admin"), validateCategory, createCategory);
router.patch("/admin/:categoryId", authenticate, authorizeRoles("admin"), validateObjectId("categoryId"), validateCategory, updateCategory);
router.delete("/admin/:categoryId", authenticate, authorizeRoles("admin"), validateObjectId("categoryId"), deleteCategory);

router.get(
  "/",
  authenticate,
  authorizeRoles("user", "technician", "admin"),
  listActiveCategories,
);

export default router;
