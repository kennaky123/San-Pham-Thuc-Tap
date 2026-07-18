import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_ISSUER,
} from "../utils/generateAccessToken.js";

function extractBearerToken(request) {
  const authorizationHeader = request.get("authorization");

  if (!authorizationHeader) {
    throw new ApiError(401, "Bạn cần đăng nhập để truy cập tài nguyên này.");
  }

  const [scheme, token, ...extraParts] = authorizationHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || extraParts.length > 0) {
    throw new ApiError(401, "Authorization header không hợp lệ.");
  }

  return token;
}

export async function authenticate(request, _response, next) {
  try {
    const token = extractBearerToken(request);
    const decodedToken = jwt.verify(token, env.jwtAccessSecret, {
      algorithms: ["HS256"],
      issuer: ACCESS_TOKEN_ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
    });

    if (!decodedToken.sub) {
      throw new ApiError(401, "Access token không hợp lệ.");
    }

    const user = await User.findById(decodedToken.sub).select(
      "+passwordChangedAt +tokenVersion",
    );

    if (!user) {
      throw new ApiError(401, "Tài khoản của access token không còn tồn tại.");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Tài khoản đã bị vô hiệu hóa.");
    }

    if ((decodedToken.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new ApiError(401, "Phiên đăng nhập đã bị thu hồi.");
    }

    if (user.changedPasswordAfter(decodedToken.iat)) {
      throw new ApiError(
        401,
        "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.",
      );
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."),
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Access token không hợp lệ."));
    }

    return next(error);
  }
}
