import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import authRoutes from "./authRoutes.js";
import adminUserRoutes from "./adminUserRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import technicianRoutes from "./technicianRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import realtimeRoutes from "./realtimeRoutes.js";
import assetRoutes from "./assetRoutes.js";
import softwareRoutes from "./softwareRoutes.js";
import usbRoutes from "./usbRoutes.js";

const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/assets", assetRoutes);
router.use("/software", softwareRoutes);
router.use("/usb", usbRoutes);
router.use("/categories", categoryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/events", realtimeRoutes);
router.use("/technicians", technicianRoutes);
router.use("/tickets", ticketRoutes);

export default router;
