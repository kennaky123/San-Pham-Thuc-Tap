import { Router } from "express";
import {
  changePassword,
  getAvatar,
  getCurrentUser,
  login,
  register,
  updateAvatar,
  updateProfile,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { uploadAvatarMiddleware } from "../middleware/avatarUpload.js";
import {
  validateChangePassword,
  validateLogin,
  validateRegister,
  validateUpdateProfile,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, getCurrentUser);
router.get("/avatar/:filename", getAvatar);
router.post("/avatar", authenticate, uploadAvatarMiddleware, updateAvatar);
router.patch(
  "/profile",
  authenticate,
  validateUpdateProfile,
  updateProfile,
);
router.patch(
  "/change-password",
  authenticate,
  validateChangePassword,
  changePassword,
);

export default router;
