import multer from "multer";
import { env } from "../config/env.js";

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) {
    return _next(error);
  }

  const errorStatus = error.statusCode ?? error.status;
  let statusCode = Number.isInteger(errorStatus) ? errorStatus : 500;
  let message = error.message || "Đã xảy ra lỗi máy chủ.";
  let details = error.details ?? null;

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = `Mỗi ảnh không được vượt quá ${env.maxFileSizeMb} MB.`;
    } else if (
      error.code === "LIMIT_FILE_COUNT" ||
      error.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      statusCode = 400;
      message = `Chỉ được đính kèm tối đa ${env.maxFilesPerTicket} ảnh.`;
    } else {
      statusCode = 400;
      message = "Không thể tải tệp đính kèm. Vui lòng kiểm tra lại tệp.";
    }
  } else if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    Object.hasOwn(error, "body")
  ) {
    statusCode = 400;
    message = "Dữ liệu JSON không hợp lệ.";
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Dữ liệu gửi lên vượt quá giới hạn cho phép.";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Dữ liệu không hợp lệ.";
    details = Object.values(error.errors ?? {}).map(
      (validationError) => validationError.message,
    );
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = `Giá trị của trường ${error.path} không hợp lệ.`;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "Dữ liệu đã tồn tại trong hệ thống.";
  } else if (error.name === "VersionError") {
    statusCode = 409;
    message = "Dữ liệu vừa được cập nhật. Vui lòng tải lại và thử lại.";
  }

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  if (env.nodeEnv !== "test") {
    console.error(error);
  }

  const responseBody = {
    success: false,
    message:
      statusCode === 500 && env.nodeEnv === "production"
        ? "Đã xảy ra lỗi máy chủ."
        : message,
    data: null,
    ...(details && { errors: details }),
    ...(env.nodeEnv === "development" && { stack: error.stack }),
  };

  return response.status(statusCode).json(responseBody);
}
