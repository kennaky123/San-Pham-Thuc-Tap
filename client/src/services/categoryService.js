import axiosClient from "../api/axiosClient.js";

function isValidCategory(category) {
  return Boolean(
    category &&
      typeof category._id === "string" &&
      typeof category.name === "string" &&
      category.name.trim().length > 0,
  );
}

function createInvalidCategoryResponseError() {
  const error = new Error("Phản hồi danh mục không hợp lệ.");
  error.code = "INVALID_CATEGORY_RESPONSE";
  return error;
}

export async function getActiveCategories({ signal } = {}) {
  const response = await axiosClient.get("/categories", { signal });
  const categories = response.data?.data?.categories;

  if (!Array.isArray(categories) || !categories.every(isValidCategory)) {
    throw createInvalidCategoryResponseError();
  }

  return categories.map((category) => ({
    id: category._id,
    name: category.name.trim(),
    slug: typeof category.slug === "string" ? category.slug : "",
    description:
      typeof category.description === "string" ? category.description : "",
  }));
}

export function getCategoryErrorMessage(error) {
  if (error?.code === "ERR_CANCELED") {
    return "";
  }

  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng tải lại danh mục.";
  }

  if (error?.code === "INVALID_CATEGORY_RESPONSE") {
    return "Dữ liệu danh mục nhận được không đúng định dạng.";
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ để tải danh mục.";
  }

  if (error.response.status === 403) {
    return "Tài khoản của bạn không có quyền xem danh mục.";
  }

  const apiMessage = error.response.data?.message;
  return typeof apiMessage === "string" && apiMessage.length > 0
    ? apiMessage
    : "Không thể tải danh mục. Vui lòng thử lại.";
}
