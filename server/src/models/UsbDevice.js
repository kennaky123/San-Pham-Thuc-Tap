import mongoose from "mongoose";
import {
  USB_DEVICE_STATUSES,
  USB_DEVICE_TYPES,
} from "../constants/usb.js";

const lastHostSchema = new mongoose.Schema(
  {
    hostname: {
      type: String,
      trim: true,
      default: "UNKNOWN-PC",
    },
    osUsername: {
      type: String,
      trim: true,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const usbDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    deviceName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Unknown Vendor",
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    deviceType: {
      type: String,
      enum: USB_DEVICE_TYPES,
      default: "storage",
    },
    driveLetter: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    volumeName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    status: {
      type: String,
      enum: USB_DEVICE_STATUSES,
      default: "unverified",
    },
    isCurrentlyConnected: {
      type: Boolean,
      default: false,
    },
    lastHost: {
      type: lastHostSchema,
      default: () => ({}),
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    connectionCount: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

usbDeviceSchema.index({ status: 1, isCurrentlyConnected: -1, updatedAt: -1 });
usbDeviceSchema.index({ "lastHost.hostname": 1 });

export const UsbDevice = mongoose.model("UsbDevice", usbDeviceSchema, "usb_devices");
export default UsbDevice;
