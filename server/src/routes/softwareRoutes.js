import { Router } from "express";
import {
  allocateLicense,
  createSoftwareLicense,
  deleteSoftwareLicense,
  getFinOpsSummary,
  getSoftwareLicense,
  listSoftwareLicenses,
  revokeLicense,
  updateSoftwareLicense,
} from "../controllers/softwareController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  validateAllocateLicense,
  validateRevokeLicense,
  validateSoftwareBody,
  validateSoftwareId,
  validateSoftwareQuery,
} from "../validators/softwareValidators.js";

const router = Router();

router.get(
  "/finops",
  authenticate,
  authorizeRoles("admin", "technician"),
  getFinOpsSummary,
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "technician", "user"),
  validateSoftwareQuery,
  listSoftwareLicenses,
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateSoftwareBody(true),
  createSoftwareLicense,
);

router.get(
  "/:licenseId",
  authenticate,
  authorizeRoles("admin", "technician", "user"),
  validateSoftwareId,
  getSoftwareLicense,
);

router.patch(
  "/:licenseId",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateSoftwareId,
  validateSoftwareBody(false),
  updateSoftwareLicense,
);

router.delete(
  "/:licenseId",
  authenticate,
  authorizeRoles("admin"),
  validateSoftwareId,
  deleteSoftwareLicense,
);

router.post(
  "/:licenseId/allocate",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateSoftwareId,
  validateAllocateLicense,
  allocateLicense,
);

router.post(
  "/:licenseId/revoke",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateSoftwareId,
  validateRevokeLicense,
  revokeLicense,
);

export default router;
