import mongoose from "mongoose";
import {
  BILLING_CYCLES,
  LICENSE_TYPES,
  SOFTWARE_CATEGORIES,
} from "../constants/software.js";

const assignedUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    note: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: true },
);

const softwareLicenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên phần mềm là bắt buộc."],
      trim: true,
      maxlength: 150,
    },
    vendor: {
      type: String,
      required: [true, "Nhà cung cấp / Hãng phần mềm là bắt buộc."],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: SOFTWARE_CATEGORIES,
      default: "Văn phòng & Email",
      index: true,
    },
    type: {
      type: String,
      enum: LICENSE_TYPES,
      default: "saas_subscription",
      index: true,
    },
    licenseKey: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
    portalUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 255,
    },
    totalSeats: {
      type: Number,
      required: [true, "Tổng số bản quyền (Seats) là bắt buộc."],
      min: [1, "Tổng số bản quyền phải có ít nhất 1."],
    },
    costPerSeat: {
      type: Number,
      default: 0,
      min: [0, "Chi phí không được âm."],
    },
    currency: {
      type: String,
      default: "VND",
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    billingCycle: {
      type: String,
      enum: BILLING_CYCLES,
      default: "yearly",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
      index: true,
    },
    assignedUsers: {
      type: [assignedUserSchema],
      default: [],
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// Virtual calculation for status
softwareLicenseSchema.methods.calculateStatus = function (now = new Date()) {
  if (this.type === "perpetual" && !this.expiryDate) {
    return "active";
  }
  if (!this.expiryDate) {
    return "active";
  }

  const expTime = new Date(this.expiryDate).getTime();
  const nowTime = now.getTime();
  const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "expired";
  }
  if (diffDays <= 30) {
    return "expiring_soon";
  }
  return "active";
};

const SoftwareLicense = mongoose.model("SoftwareLicense", softwareLicenseSchema);

export default SoftwareLicense;
