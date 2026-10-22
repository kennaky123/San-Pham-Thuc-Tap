import dotenv from "dotenv";

dotenv.config({ quiet: true });

const supportedNodeEnvironments = new Set([
  "development",
  "test",
  "production",
]);

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST?.trim() || "127.0.0.1",
  port: parsePositiveInteger(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI?.trim() ?? "",
  clientUrl: process.env.CLIENT_URL?.trim() || "http://127.0.0.1:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET?.trim() ?? "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN?.trim() || "365d",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET?.trim() ?? "",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN?.trim() || "7d",
  bcryptSaltRounds: parsePositiveInteger(process.env.BCRYPT_SALT_ROUNDS, 12),
  uploadDir: process.env.UPLOAD_DIR?.trim() || "uploads",
  maxFileSizeMb: parsePositiveInteger(process.env.MAX_FILE_SIZE_MB, 5),
  maxFilesPerTicket: parsePositiveInteger(
    process.env.MAX_FILES_PER_TICKET,
    5,
  ),
});

export function validateEnv() {
  if (!supportedNodeEnvironments.has(env.nodeEnv)) {
    throw new Error(
      "NODE_ENV phải là development, test hoặc production.",
    );
  }

  const requiredVariables = {
    MONGODB_URI: env.mongoUri,
    JWT_ACCESS_SECRET: env.jwtAccessSecret,
    JWT_REFRESH_SECRET: env.jwtRefreshSecret,
  };

  const missingVariables = Object.entries(requiredVariables)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVariables.length > 0) {
    throw new Error(
      `Thiếu biến môi trường bắt buộc: ${missingVariables.join(", ")}.`,
    );
  }

  if (
    env.jwtAccessSecret &&
    env.jwtAccessSecret === env.jwtRefreshSecret
  ) {
    throw new Error("JWT_ACCESS_SECRET và JWT_REFRESH_SECRET phải khác nhau.");
  }
}
