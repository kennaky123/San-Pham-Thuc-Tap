import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { env } from "./env.js";
import ApiError from "../utils/ApiError.js";

const serverRoot = fileURLToPath(new URL("../../", import.meta.url));
const uploadDirectory = path.resolve(serverRoot, env.uploadDir);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const extensionByMimeType = Object.freeze({
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
});

mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => {
    const extension = extensionByMimeType[file.mimetype];
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

function fileFilter(_request, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new ApiError(400, "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP."));
    return;
  }

  callback(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: env.maxFilesPerTicket,
  },
});

export async function removeUploadedFiles(files = []) {
  const paths = files
    .map((file) => file?.path)
    .filter((filePath) => typeof filePath === "string" && filePath.length > 0);

  await Promise.allSettled(paths.map((filePath) => unlink(filePath)));
}

export function getUploadedFilePath(storageKey) {
  if (
    typeof storageKey !== "string" ||
    storageKey.length === 0 ||
    path.basename(storageKey) !== storageKey
  ) {
    throw new ApiError(404, "Không tìm thấy tệp đính kèm.");
  }

  return path.resolve(uploadDirectory, storageKey);
}
