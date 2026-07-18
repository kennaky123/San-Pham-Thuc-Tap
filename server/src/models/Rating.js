import mongoose from "mongoose";

export const RATING_SCORES = Object.freeze([1, 2, 3, 4, 5]);

function removeVersionKey(_document, returnedObject) {
  delete returnedObject.__v;
  return returnedObject;
}

const ratingSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket là bắt buộc."],
      immutable: true,
      unique: true,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người đánh giá là bắt buộc."],
      immutable: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Technician được đánh giá là bắt buộc."],
      immutable: true,
    },
    score: {
      type: Number,
      required: [true, "Điểm đánh giá là bắt buộc."],
      enum: {
        values: RATING_SCORES,
        message: "Điểm đánh giá phải là số nguyên từ 1 đến 5.",
      },
    },
    feedback: {
      type: String,
      default: null,
      trim: true,
      maxlength: [
        1000,
        "Nội dung đánh giá không được vượt quá 1000 ký tự.",
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { transform: removeVersionKey },
    toObject: { transform: removeVersionKey },
  },
);

ratingSchema.index({ technician: 1, createdAt: -1 });
ratingSchema.index({ ratedBy: 1, createdAt: -1 });
ratingSchema.index({ score: 1, createdAt: -1 });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
