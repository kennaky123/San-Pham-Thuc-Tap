import mongoose from "mongoose";

function removeVersionKey(_document, returnedObject) {
  delete returnedObject.__v;
  return returnedObject;
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc."],
      trim: true,
      minlength: [2, "Tên danh mục phải có ít nhất 2 ký tự."],
      maxlength: [100, "Tên danh mục không được vượt quá 100 ký tự."],
    },
    slug: {
      type: String,
      required: [true, "Slug danh mục là bắt buộc."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug danh mục không đúng định dạng.",
      ],
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Mô tả danh mục không được vượt quá 500 ký tự."],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
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
  {
    timestamps: true,
    toJSON: { transform: removeVersionKey },
    toObject: { transform: removeVersionKey },
  },
);

categorySchema.index({ isActive: 1, name: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
