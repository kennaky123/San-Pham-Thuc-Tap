import ApiError from "../utils/ApiError.js";

export function notFound(request, _response, next) {
  return next(
    new ApiError(
      404,
      `Không tìm thấy endpoint ${request.method} ${request.originalUrl}.`,
    ),
  );
}
