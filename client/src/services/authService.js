import axiosClient from "../api/axiosClient.js";
import { USER_ROLES } from "../constants/roles.js";

function createInvalidAuthResponseError() {
  const error = new Error("Phản hồi xác thực không hợp lệ.");
  error.code = "INVALID_AUTH_RESPONSE";
  return error;
}

export function isValidUser(user) {
  return Boolean(
    user &&
      typeof user._id === "string" &&
      typeof user.email === "string" &&
      typeof user.fullName === "string" &&
      USER_ROLES.includes(user.role),
  );
}

export function parseAuthenticationData(authenticationData) {
  if (
    !isValidUser(authenticationData?.user) ||
    typeof authenticationData?.accessToken !== "string" ||
    authenticationData.accessToken.length === 0
  ) {
    throw createInvalidAuthResponseError();
  }

  return authenticationData;
}

export async function login(credentials) {
  const response = await axiosClient.post("/auth/login", credentials, {
    skipAuth: true,
  });
  return parseAuthenticationData(response.data?.data);
}

export async function register(payload) {
  const response = await axiosClient.post("/auth/register", payload, {
    skipAuth: true,
  });
  return parseAuthenticationData(response.data?.data);
}

export function getLoginError(error) {
  if (error?.code === "ECONNABORTED") {
    return {
      message: "Máy chủ phản hồi quá lâu. Vui lòng thử lại.",
      details: [],
    };
  }

  if (error?.code === "INVALID_AUTH_RESPONSE") {
    return {
      message: "Không thể xác thực tài khoản từ phản hồi của máy chủ.",
      details: [],
    };
  }

  const statusCode = error?.response?.status;
  const responseData = error?.response?.data;
  const apiMessage =
    typeof responseData?.message === "string" ? responseData.message : "";
  const details = Array.isArray(responseData?.errors)
    ? responseData.errors
        .filter((item) => typeof item === "string")
        .slice(0, 4)
    : [];

  if (!error?.response) {
    return {
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.",
      details: [],
    };
  }

  if (statusCode === 400) {
    return {
      message: apiMessage || "Dữ liệu đăng nhập không hợp lệ.",
      details,
    };
  }

  if (statusCode === 401) {
    return {
      message: apiMessage || "Email hoặc mật khẩu không chính xác.",
      details: [],
    };
  }

  if (statusCode === 403) {
    return {
      message: apiMessage || "Tài khoản đã bị vô hiệu hóa.",
      details: [],
    };
  }

  if (statusCode === 429) {
    return {
      message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
      details: [],
    };
  }

  return {
    message: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
    details: [],
  };
}
