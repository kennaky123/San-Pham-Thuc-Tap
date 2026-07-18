import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
process.env.JWT_REFRESH_SECRET =
  "test-refresh-secret-with-at-least-32-characters";

const [
  { default: User },
  { authorizeRoles },
  { authenticate },
  { validateRegister },
  {
    ACCESS_TOKEN_AUDIENCE,
    ACCESS_TOKEN_ISSUER,
    generateAccessToken,
  },
] = await Promise.all([
  import("../src/models/User.js"),
  import("../src/middleware/authorizeRoles.js"),
  import("../src/middleware/authenticate.js"),
  import("../src/validators/authValidators.js"),
  import("../src/utils/generateAccessToken.js"),
]);

function runMiddleware(middleware, request) {
  return new Promise((resolve) => {
    middleware(request, {}, (error) => resolve(error));
  });
}

test("User JSON không chứa trường nhạy cảm", () => {
  const user = new User({
    fullName: "Nguyễn Văn A",
    email: "user@example.com",
    password: "Password123",
    passwordChangedAt: new Date(),
    tokenVersion: 2,
  });

  const result = user.toJSON();

  assert.equal(Object.hasOwn(result, "password"), false);
  assert.equal(Object.hasOwn(result, "passwordChangedAt"), false);
  assert.equal(Object.hasOwn(result, "tokenVersion"), false);
});

test("comparePassword kiểm tra bcrypt hash chính xác", async () => {
  const password = "Password123";
  const passwordHash = await bcrypt.hash(password, 4);
  const user = new User({
    fullName: "Nguyễn Văn A",
    email: "bcrypt@example.com",
    password: passwordHash,
  });

  assert.equal(await user.comparePassword(password), true);
  assert.equal(await user.comparePassword("WrongPassword123"), false);
});

test("generateAccessToken tạo JWT đúng subject và role", () => {
  const userId = new mongoose.Types.ObjectId();
  const token = generateAccessToken({
    _id: userId,
    role: "technician",
    tokenVersion: 3,
  });

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
    issuer: ACCESS_TOKEN_ISSUER,
    audience: ACCESS_TOKEN_AUDIENCE,
  });

  assert.equal(payload.sub, userId.toString());
  assert.equal(payload.role, "technician");
  assert.equal(payload.tokenVersion, 3);
});

test("validateRegister từ chối mật khẩu yếu và tự gán role", async () => {
  const request = {
    body: {
      fullName: "Nguyễn Văn A",
      email: "user@example.com",
      password: "weak",
      role: "admin",
    },
  };

  const error = await runMiddleware(validateRegister, request);

  assert.equal(error.statusCode, 400);
  assert.match(error.details.join(" "), /ít nhất 8 ký tự/);
  assert.match(error.details.join(" "), /Không được tự chỉ định vai trò/);
});

test("authorizeRoles từ chối role không được phép", async () => {
  const middleware = authorizeRoles("admin");
  const error = await runMiddleware(middleware, {
    user: { role: "user" },
  });

  assert.equal(error.statusCode, 403);
});

test("authenticate yêu cầu Bearer token", async () => {
  const error = await runMiddleware(authenticate, {
    get: () => undefined,
  });

  assert.equal(error.statusCode, 401);
  assert.match(error.message, /cần đăng nhập/);
});
