import ApiError from "../utils/ApiError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\s-]{8,20}$/;

function validatePassword(password, fieldName = "Mật khẩu") {
  const errors = [];

  if (typeof password !== "string" || password.length === 0) {
    return [`${fieldName} là bắt buộc.`];
  }

  if (password.length < 8) {
    errors.push(`${fieldName} phải có ít nhất 8 ký tự.`);
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push(`${fieldName} không được vượt quá 72 byte.`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(`${fieldName} phải có ít nhất một chữ thường.`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(`${fieldName} phải có ít nhất một chữ hoa.`);
  }

  if (!/\d/.test(password)) {
    errors.push(`${fieldName} phải có ít nhất một chữ số.`);
  }

  return errors;
}

function rejectInvalidInput(errors, next) {
  if (errors.length > 0) {
    return next(
      new ApiError(400, "Dữ liệu đầu vào không hợp lệ.", errors),
    );
  }

  return next();
}

export function validateRegister(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (fullName.length < 2 || fullName.length > 100) {
      errors.push("Họ tên phải có từ 2 đến 100 ký tự.");
    }

    if (!emailPattern.test(email) || email.length > 254) {
      errors.push("Email không đúng định dạng.");
    }

    errors.push(...validatePassword(body.password));

    if (body.phone !== undefined && body.phone !== null && body.phone !== "") {
      if (typeof body.phone !== "string" || !phonePattern.test(body.phone.trim())) {
        errors.push("Số điện thoại không đúng định dạng.");
      }
    }

    if (
      body.department !== undefined &&
      body.department !== null &&
      (typeof body.department !== "string" ||
        body.department.trim().length > 100)
    ) {
      errors.push("Phòng ban không được vượt quá 100 ký tự.");
    }

    if (
      body.avatar !== undefined &&
      body.avatar !== null &&
      (typeof body.avatar !== "string" || body.avatar.trim().length > 500)
    ) {
      errors.push("Đường dẫn ảnh đại diện không được vượt quá 500 ký tự.");
    }

    if (Object.hasOwn(body, "role") || Object.hasOwn(body, "status")) {
      errors.push("Không được tự chỉ định vai trò hoặc trạng thái tài khoản.");
    }

    request.body = {
      ...body,
      fullName,
      email: email.toLowerCase(),
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      department:
        typeof body.department === "string"
          ? body.department.trim() || null
          : null,
      avatar:
        typeof body.avatar === "string" ? body.avatar.trim() || null : null,
    };

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateLogin(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!emailPattern.test(email) || email.length > 254) {
      errors.push("Email không đúng định dạng.");
    }

    if (typeof body.password !== "string" || body.password.length === 0) {
      errors.push("Mật khẩu là bắt buộc.");
    }

    request.body = {
      ...body,
      email: email.toLowerCase(),
    };

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}

export function validateChangePassword(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];

    if (
      typeof body.currentPassword !== "string" ||
      body.currentPassword.length === 0
    ) {
      errors.push("Mật khẩu hiện tại là bắt buộc.");
    }

    errors.push(...validatePassword(body.newPassword, "Mật khẩu mới"));

    if (body.newPassword !== body.confirmNewPassword) {
      errors.push("Xác nhận mật khẩu mới không khớp.");
    }

    if (
      typeof body.currentPassword === "string" &&
      body.currentPassword === body.newPassword
    ) {
      errors.push("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }

    return rejectInvalidInput(errors, next);
  } catch (error) {
    return next(error);
  }
}
