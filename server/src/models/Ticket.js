import mongoose from "mongoose";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../constants/ticket.js";

const attachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ["image/jpeg", "image/png", "image/webp"],
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: true },
);

const statusHistorySchema = new mongoose.Schema(
  {
    fromStatus: {
      type: String,
      enum: [...TICKET_STATUSES, null],
      default: null,
    },
    toStatus: {
      type: String,
      enum: TICKET_STATUSES,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      required: [true, "Ghi chú thay đổi trạng thái là bắt buộc."],
      trim: true,
      minlength: [1, "Ghi chú thay đổi trạng thái không được để trống."],
      maxlength: [500, "Ghi chú thay đổi trạng thái không được vượt quá 500 ký tự."],
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: true },
);

const assignmentHistorySchema = new mongoose.Schema(
  {
    fromTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    toTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: true },
);

function removeVersionKey(_document, returnedObject) {
  delete returnedObject.__v;
  return returnedObject;
}

const statusesRequiringTechnician = [
  "assigned",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
];

const statusesRequiringResolution = ["resolved", "closed"];

const ticketSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      required: [true, "Mã ticket là bắt buộc."],
      unique: true,
      immutable: true,
      uppercase: true,
      trim: true,
      match: [/^HD-\d{4}-\d{6}$/, "Mã ticket không đúng định dạng."],
    },
    title: {
      type: String,
      required: [true, "Tiêu đề là bắt buộc."],
      trim: true,
      minlength: [5, "Tiêu đề phải có ít nhất 5 ký tự."],
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự."],
    },
    description: {
      type: String,
      required: [true, "Mô tả là bắt buộc."],
      trim: true,
      minlength: [10, "Mô tả phải có ít nhất 10 ký tự."],
      maxlength: [5000, "Mô tả không được vượt quá 5000 ký tự."],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc."],
    },
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITIES,
        message: "Mức độ ưu tiên không hợp lệ.",
      },
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUSES,
        message: "Trạng thái ticket không hợp lệ.",
      },
      default: "pending",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo ticket là bắt buộc."],
      immutable: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: [
        function assignedToRequired() {
          return statusesRequiringTechnician.includes(this.status);
        },
        "Technician là bắt buộc với trạng thái hiện tại.",
      ],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 5;
        },
        message: "Mỗi ticket chỉ được có tối đa 5 tệp đính kèm.",
      },
    },
    resolution: {
      type: String,
      default: null,
      trim: true,
      minlength: [10, "Nội dung giải quyết phải có ít nhất 10 ký tự."],
      maxlength: [5000, "Nội dung giải quyết không được vượt quá 5000 ký tự."],
      required: [
        function resolutionRequired() {
          return statusesRequiringResolution.includes(this.status);
        },
        "Nội dung giải quyết là bắt buộc khi ticket đã hoàn thành.",
      ],
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    waitingUserAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
      required: [
        function resolvedAtRequired() {
          return statusesRequiringResolution.includes(this.status);
        },
        "Thời điểm giải quyết là bắt buộc khi ticket đã hoàn thành.",
      ],
    },
    closedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Lý do hủy không được vượt quá 500 ký tự."],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    assignmentHistory: {
      type: [assignmentHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: { transform: removeVersionKey },
    toObject: { transform: removeVersionKey },
  },
);

ticketSchema.index({ createdBy: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ category: 1, status: 1, createdAt: -1 });
ticketSchema.index({ status: 1, resolvedAt: -1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
