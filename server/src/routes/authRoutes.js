import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  login,
  register,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  validateChangePassword,
  validateLogin,
  validateRegister,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, getCurrentUser);
router.patch(
  "/change-password",
  authenticate,
  validateChangePassword,
  changePassword,
);

export default router;
