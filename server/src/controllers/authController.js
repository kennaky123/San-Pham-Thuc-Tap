import { env } from "../config/env.js";
import { unlink } from "node:fs/promises";
import { getUploadedFilePath, removeUploadedFiles } from "../config/upload.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";

function buildAuthenticationData(user) {
  return {
    user: user.toJSON(),
    accessToken: generateAccessToken(user),
    tokenType: "Bearer",
    expiresIn: env.jwtAccessExpiresIn,
  };
}

export async function register(request, response, next) {
  try {
    const { fullName, email, password, phone, department, avatar } =
      request.body;

    const existingUser = await User.exists({ email });

    if (existingUser) {
      throw new ApiError(409, "Email đã được sử dụng.");
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      department,
      avatar,
      role: "user",
      status: "active",
    });

    return response.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      data: buildAuthenticationData(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Email đã được sử dụng."));
    }

    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email }).select(
      "+password +tokenVersion",
    );

    const passwordIsCorrect = user
      ? await user.comparePassword(password)
      : false;

    if (!user || !passwordIsCorrect) {
      throw new ApiError(401, "Email hoặc mật khẩu không chính xác.");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Tài khoản đã bị vô hiệu hóa.");
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return response.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: buildAuthenticationData(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(request, response, next) {
  try {
    return response.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công.",
      data: {
        user: request.user.toJSON(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function changePassword(request, response, next) {
  try {
    const { currentPassword, newPassword } = request.body;
    const user = await User.findById(request.user._id).select(
      "+password +passwordChangedAt +tokenVersion",
    );

    if (!user) {
      throw new ApiError(404, "Không tìm thấy tài khoản.");
    }

    const currentPasswordIsCorrect =
      await user.comparePassword(currentPassword);

    if (!currentPasswordIsCorrect) {
      throw new ApiError(400, "Mật khẩu hiện tại không chính xác.");
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return response.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công.",
      data: buildAuthenticationData(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(request, response, next) {
  try {
    const { fullName, phone, department } = request.body;
    const user = await User.findById(request.user._id);

    if (!user) {
      throw new ApiError(404, "Không tìm thấy tài khoản.");
    }

    user.fullName = fullName;
    user.phone = phone;
    user.department = department;

    await user.save();

    return response.status(200).json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công.",
      data: buildAuthenticationData(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateAvatar(request, response, next) {
  try {
    if (!request.file) {
      throw new ApiError(400, "Vui lòng chọn tệp ảnh đại diện.");
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new ApiError(404, "Không tìm thấy tài khoản.");
    }

    const previousAvatar = user.avatar;
    user.avatar = request.file.filename;
    await user.save();

    if (previousAvatar && previousAvatar !== user.avatar) {
      try {
        await unlink(getUploadedFilePath(previousAvatar));
      } catch {
        // Ảnh cũ có thể là URL bên ngoài hoặc đã được dọn trước đó.
      }
    }

    return response.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công.",
      data: buildAuthenticationData(user),
    });
  } catch (error) {
    if (request.file) await removeUploadedFiles([request.file]);
    return next(error);
  }
}

export async function getAvatar(request, response, next) {
  try {
    const avatarExists = await User.exists({ avatar: request.params.filename });
    if (!avatarExists) throw new ApiError(404, "Không tìm thấy ảnh đại diện.");
    const filePath = getUploadedFilePath(request.params.filename);
    return response.sendFile(filePath, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}
