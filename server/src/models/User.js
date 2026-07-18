import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { env } from "../config/env.js";

export const USER_ROLES = Object.freeze(["user", "technician", "admin"]);
export const USER_STATUSES = Object.freeze(["active", "inactive"]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\s-]{8,20}$/;

function removePrivateFields(_document, returnedObject) {
  delete returnedObject.password;
  delete returnedObject.passwordChangedAt;
  delete returnedObject.tokenVersion;
  delete returnedObject.__v;
  return returnedObject;
}

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc."],
      trim: true,
      minlength: [2, "Họ tên phải có ít nhất 2 ký tự."],
      maxlength: [100, "Họ tên không được vượt quá 100 ký tự."],
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc."],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email không được vượt quá 254 ký tự."],
      match: [emailPattern, "Email không đúng định dạng."],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc."],
      select: false,
      minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự."],
      validate: {
        validator(value) {
          return Buffer.byteLength(value, "utf8") <= 72;
        },
        message: "Mật khẩu không được vượt quá 72 byte.",
      },
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      match: [phonePattern, "Số điện thoại không đúng định dạng."],
    },
    department: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "Phòng ban không được vượt quá 100 ký tự."],
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Đường dẫn ảnh đại diện không được vượt quá 500 ký tự."],
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "Vai trò không hợp lệ.",
      },
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: USER_STATUSES,
        message: "Trạng thái tài khoản không hợp lệ.",
      },
      default: "active",
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: removePrivateFields },
    toObject: { transform: removePrivateFields },
  },
);

userSchema.index({ role: 1, status: 1 });

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(
  jwtIssuedAt,
) {
  if (!this.passwordChangedAt || !jwtIssuedAt) {
    return false;
  }

  const changedAtInSeconds = Math.floor(
    this.passwordChangedAt.getTime() / 1000,
  );
  return changedAtInSeconds > jwtIssuedAt;
};

const User = mongoose.model("User", userSchema);

export default User;
