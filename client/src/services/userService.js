import axiosClient from "../api/axiosClient.js";
import {
  isValidUser,
  parseAuthenticationData,
} from "./authService.js";

let currentUserRequest = null;

function createInvalidUserResponseError(message) {
  const error = new Error(message);
  error.code = "INVALID_USER_RESPONSE";
  return error;
}

export function getCurrentUser() {
  if (!currentUserRequest) {
    currentUserRequest = axiosClient
      .get("/auth/me")
      .then((response) => {
        const user = response.data?.data?.user;

        if (!isValidUser(user)) {
          throw createInvalidUserResponseError(
            "Phản hồi thông tin tài khoản không hợp lệ.",
          );
        }

        return user;
      })
      .finally(() => {
        currentUserRequest = null;
      });
  }

  return currentUserRequest;
}

export async function changePassword(payload) {
  const response = await axiosClient.patch("/auth/change-password", payload);
  return parseAuthenticationData(response.data?.data);
}

export async function getActiveTechnicians({ signal } = {}) {
  const response = await axiosClient.get("/technicians", { signal });
  const technicians = response.data?.data?.technicians;

  if (
    !Array.isArray(technicians) ||
    !technicians.every(
      (technician) =>
        technician &&
        typeof technician._id === "string" &&
        typeof technician.fullName === "string",
    )
  ) {
    throw createInvalidUserResponseError(
      "Phản hồi danh sách technician không hợp lệ.",
    );
  }

  return technicians;
}

export function getUserServiceErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
  }

  if (
    error?.code === "INVALID_USER_RESPONSE" ||
    error?.code === "INVALID_AUTH_RESPONSE"
  ) {
    return "Dữ liệu tài khoản nhận được không đúng định dạng.";
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ để tải dữ liệu người dùng.";
  }

  if (error.response.status === 403) {
    return "Tài khoản của bạn không có quyền thực hiện thao tác này.";
  }

  const apiMessage = error.response.data?.message;
  return typeof apiMessage === "string" && apiMessage.length > 0
    ? apiMessage
    : "Không thể tải dữ liệu người dùng. Vui lòng thử lại.";
}
