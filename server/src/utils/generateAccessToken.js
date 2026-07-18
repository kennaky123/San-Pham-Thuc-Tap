import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const ACCESS_TOKEN_ISSUER = "it-helpdesk-api";
export const ACCESS_TOKEN_AUDIENCE = "it-helpdesk-client";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    },
    env.jwtAccessSecret,
    {
      algorithm: "HS256",
      subject: user._id.toString(),
      issuer: ACCESS_TOKEN_ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
      expiresIn: env.jwtAccessExpiresIn,
    },
  );
}
