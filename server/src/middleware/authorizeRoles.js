import { USER_ROLES } from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export function authorizeRoles(...allowedRoles) {
  const invalidRoles = allowedRoles.filter(
    (role) => !USER_ROLES.includes(role),
  );

  if (allowedRoles.length === 0 || invalidRoles.length > 0) {
    throw new Error("Cấu hình role middleware không hợp lệ.");
  }

  return function roleMiddleware(request, _response, next) {
    if (!request.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập."));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(
        new ApiError(403, "Bạn không có quyền thực hiện thao tác này."),
      );
    }

    return next();
  };
}
