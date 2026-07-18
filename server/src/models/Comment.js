import mongoose from "mongoose";

const commentAttachmentSchema = new mongoose.Schema(
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
    uploadedAt: {
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

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket là bắt buộc."],
      immutable: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người gửi là bắt buộc."],
      immutable: true,
    },
    content: {
      type: String,
      required: [true, "Nội dung trao đổi là bắt buộc."],
      trim: true,
      minlength: [1, "Nội dung trao đổi không được để trống."],
      maxlength: [5000, "Nội dung trao đổi không được vượt quá 5000 ký tự."],
    },
    attachments: {
      type: [commentAttachmentSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 5;
        },
        message: "Mỗi comment chỉ được có tối đa 5 tệp đính kèm.",
      },
    },
    isInternal: {
      type: Boolean,
      default: false,
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: removeVersionKey },
    toObject: { transform: removeVersionKey },
  },
);

commentSchema.index({ ticket: 1, createdAt: 1, _id: 1 });
commentSchema.index({ ticket: 1, isInternal: 1, createdAt: 1, _id: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
