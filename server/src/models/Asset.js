import mongoose from "mongoose";
import {
  ASSET_HISTORY_ACTIONS,
  ASSET_STATUSES,
  ASSET_TYPES,
  REMOTE_TOOLS,
} from "../constants/asset.js";

const assetHistorySchema = new mongoose.Schema(
  {
    action: { type: String, enum: ASSET_HISTORY_ACTIONS, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: { type: String, default: null, trim: true, maxlength: 500 },
    at: { type: Date, default: Date.now, required: true },
  },
  { _id: true },
);

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, "Mã thiết bị (Asset Tag) là bắt buộc."],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    name: {
      type: String,
      required: [true, "Tên thiết bị là bắt buộc."],
      trim: true,
      maxlength: 120,
    },
    type: { type: String, enum: ASSET_TYPES, default: "laptop", index: true },
    serialNumber: { type: String, default: null, trim: true, maxlength: 80 },
    specs: { type: String, default: null, trim: true, maxlength: 300 },
    os: { type: String, default: null, trim: true, maxlength: 80 },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: "in_stock",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    assignedAt: { type: Date, default: null },
    remoteTool: { type: String, enum: REMOTE_TOOLS, default: "none" },
    remoteId: { type: String, default: null, trim: true, maxlength: 60 },
    purchaseDate: { type: Date, default: null },
    notes: { type: String, default: null, trim: true, maxlength: 500 },
    history: { type: [assetHistorySchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;

