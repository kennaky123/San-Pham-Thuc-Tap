import { Router } from "express";
import {
  acceptAssetRequest,
  assignAsset,
  cancelAssetRequest,
  completeAssetRequest,
  createAsset,
  createAssetRequest,
  deleteAsset,
  getAsset,
  listAssetRequests,
  listAssets,
  listAssignableEmployees,
  returnAsset,
  updateAsset,
} from "../controllers/assetController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  validateAssetBody,
  validateAssetId,
  validateAssetQuery,
  validateAssignAsset,
  validateCancelAssetRequest,
  validateCompleteAssetRequest,
  validateCreateAssetRequest,
  validateRequestQuery,
  validateReturnAsset,
} from "../validators/assetValidators.js";

const router = Router();

/* ------------------------ Asset Requests ------------------------ */

router.get(
  "/requests",
  authenticate,
  authorizeRoles("admin", "technician", "user"),
  validateRequestQuery,
  listAssetRequests,
);

router.post(
  "/requests",
  authenticate,
  authorizeRoles("admin"),
  validateCreateAssetRequest,
  createAssetRequest,
);

router.post(
  "/requests/:requestId/accept",
  authenticate,
  authorizeRoles("technician"),
  validateAssetId,
  acceptAssetRequest,
);

router.post(
  "/requests/:requestId/complete",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateAssetId,
  validateCompleteAssetRequest,
  completeAssetRequest,
);

router.post(
  "/requests/:requestId/cancel",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateAssetId,
  validateCancelAssetRequest,
  cancelAssetRequest,
);

/* ------------------------ Assets ------------------------ */

router.get(
  "/employees",
  authenticate,
  authorizeRoles("admin", "technician"),
  listAssignableEmployees,
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "technician", "user"),
  validateAssetQuery,
  listAssets,
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateAssetBody(true),
  createAsset,
);

router.get(
  "/:assetId",
  authenticate,
  authorizeRoles("admin", "technician", "user"),
  validateAssetId,
  getAsset,
);

router.patch(
  "/:assetId",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateAssetId,
  validateAssetBody(false),
  updateAsset,
);

router.delete(
  "/:assetId",
  authenticate,
  authorizeRoles("admin"),
  validateAssetId,
  deleteAsset,
);

router.post(
  "/:assetId/assign",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateAssetId,
  validateAssignAsset,
  assignAsset,
);

router.post(
  "/:assetId/return",
  authenticate,
  authorizeRoles("admin", "technician"),
  validateAssetId,
  validateReturnAsset,
  returnAsset,
);

export default router;

