import { open } from "node:fs/promises";
import { env } from "../config/env.js";
import { removeUploadedFiles, upload } from "../config/upload.js";
import ApiError from "../utils/ApiError.js";

function hasExpectedImageSignature(mimeType, header) {
  if (mimeType === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return header.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }

  if (mimeType === "image/webp") {
    return (
      header.subarray(0, 4).toString("ascii") === "RIFF" &&
      header.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

async function hasValidImageContent(file) {
  const fileHandle = await open(file.path, "r");

  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(header, 0, header.length, 0);
    return bytesRead > 0 && hasExpectedImageSignature(file.mimetype, header);
  } finally {
    await fileHandle.close();
  }
}

export function uploadTicketAttachments(request, response, next) {
  upload.array("attachments", env.maxFilesPerTicket)(
    request,
    response,
    (error) => next(error),
  );
}

export async function validateTicketAttachmentContent(
  request,
  _response,
  next,
) {
  try {
    const files = request.files ?? [];
    const validationResults = await Promise.all(
      files.map((file) => hasValidImageContent(file)),
    );
    const invalidFileIndex = validationResults.findIndex((isValid) => !isValid);

    if (invalidFileIndex >= 0) {
      return next(
        new ApiError(
          400,
          `Nội dung tệp ${files[invalidFileIndex].originalname} không phải ảnh hợp lệ.`,
        ),
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export async function cleanupTicketAttachmentUpload(
  error,
  request,
  _response,
  next,
) {
  await removeUploadedFiles(request.files);
  request.files = [];
  next(error);
}
