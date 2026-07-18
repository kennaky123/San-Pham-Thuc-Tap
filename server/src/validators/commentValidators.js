import ApiError from "../utils/ApiError.js";

const MAX_PAGE = 1_000_000;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return Number.NaN;
  }

  const normalizedValue = String(value);

  if (!/^\d+$/.test(normalizedValue)) {
    return Number.NaN;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);
  return Number.isSafeInteger(parsedValue) ? parsedValue : Number.NaN;
}

export function validateCreateComment(request, _response, next) {
  try {
    const body = request.body ?? {};
    const errors = [];
    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (content.length < 1 || content.length > 5000) {
      errors.push("Nội dung trao đổi phải có từ 1 đến 5000 ký tự.");
    }

    if (Object.hasOwn(body, "isInternal")) {
      errors.push(
        "Không gửi isInternal trong request; hãy sử dụng đúng endpoint.",
      );
    }

    request.body = { content };

    if (errors.length > 0) {
      return next(
        new ApiError(400, "Dữ liệu comment không hợp lệ.", errors),
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateCommentListQuery(request, _response, next) {
  try {
    const query = request.query ?? {};
    const errors = [];
    const page = parsePositiveInteger(query.page, 1);
    const limit = parsePositiveInteger(query.limit, 20);
    const sortOrder = query.sortOrder ?? "asc";

    if (!Number.isSafeInteger(page) || page < 1 || page > MAX_PAGE) {
      errors.push(`Trang phải là số nguyên từ 1 đến ${MAX_PAGE}.`);
    }

    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      errors.push("Số comment mỗi trang phải nằm trong khoảng 1 đến 100.");
    }

    if (typeof sortOrder !== "string" || !["asc", "desc"].includes(sortOrder)) {
      errors.push("Thứ tự comment phải là asc hoặc desc.");
    }

    request.commentQuery = { page, limit, sortOrder };

    if (errors.length > 0) {
      return next(
        new ApiError(400, "Tham số danh sách comment không hợp lệ.", errors),
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
