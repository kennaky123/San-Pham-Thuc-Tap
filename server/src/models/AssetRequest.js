import mongoose from "mongoose";
import { ASSET_REQUEST_STATUSES, ASSET_TYPES } from "../constants/asset.js";

const assetRequestSchema = new mongoose.Schema(
  {
    requestCode: { type: String, required: true, unique: true, trim: true },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assetType: { type: String, enum: ASSET_TYPES, default: "laptop" },
    note: { type: String, default: null, trim: true, maxlength: 1000 },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: null },
    status: {
      type: String,
      enum: ASSET_REQUEST_STATUSES,
      default: "pending",
      index: true,
    },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null, trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false },
);

const AssetRequest = mongoose.model("AssetRequest", assetRequestSchema);

export default AssetRequest;

