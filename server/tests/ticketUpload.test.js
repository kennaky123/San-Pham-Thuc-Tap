import assert from "node:assert/strict";
import { access, unlink } from "node:fs/promises";
import test from "node:test";
import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import {
  cleanupTicketAttachmentUpload,
  uploadTicketAttachments,
  validateTicketAttachmentContent,
} from "../src/middleware/ticketAttachmentUpload.js";
import { getUploadedFilePath } from "../src/config/upload.js";
import { validateCreateTicket } from "../src/validators/ticketValidators.js";

function createUploadTestApp(onFilesCaptured) {
  const app = express();

  app.post(
    "/upload",
    uploadTicketAttachments,
    (requestObject, _response, next) => {
      onFilesCaptured(requestObject.files ?? []);
      next();
    },
    validateTicketAttachmentContent,
    validateCreateTicket,
    (requestObject, response) => {
      response.status(201).json({
        success: true,
        files: requestObject.files.map((file) => ({
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
        })),
      });
    },
    cleanupTicketAttachmentUpload,
  );

  app.use((error, _request, response, _next) => {
    response.status(error.statusCode ?? error.status ?? 400).json({
      success: false,
      message: error.message,
    });
  });

  return app;
}

function validTicketFields(overrides = {}) {
  return {
    title: "Không thể kết nối máy in",
    description: "Máy tính không thể kết nối máy in tại phòng làm việc.",
    category: new mongoose.Types.ObjectId().toString(),
    priority: "medium",
    ...overrides,
  };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("upload ticket nhận ảnh hợp lệ và sinh phần mở rộng từ MIME", async () => {
  let uploadedFiles = [];
  const app = createUploadTestApp((files) => {
    uploadedFiles = files;
  });

  try {
    const response = await request(app)
      .post("/upload")
      .field(validTicketFields())
      .attach(
        "attachments",
        Buffer.concat([
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          Buffer.from("test-content"),
        ]),
        {
        filename: "anh-loi.exe",
        contentType: "image/png",
        },
      );

    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.files.length, 1);
    assert.match(response.body.files[0].filename, /\.png$/);
    assert.equal(response.body.files[0].mimetype, "image/png");
    assert.equal(await fileExists(uploadedFiles[0].path), true);
  } finally {
    await Promise.all(
      uploadedFiles.map((file) => unlink(file.path).catch(() => undefined)),
    );
  }
});

test("validation lỗi sẽ xóa ảnh Multer đã ghi ra đĩa", async () => {
  let uploadedFiles = [];
  const app = createUploadTestApp((files) => {
    uploadedFiles = files;
  });
  const response = await request(app)
    .post("/upload")
    .field(validTicketFields({ title: "Lỗi" }))
    .attach(
      "attachments",
      Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("test-content")]),
      {
        filename: "anh-loi.jpg",
        contentType: "image/jpeg",
      },
    );

  assert.equal(response.status, 400, JSON.stringify(response.body));
  assert.equal(uploadedFiles.length, 1);
  assert.equal(await fileExists(uploadedFiles[0].path), false);
});

test("upload ticket từ chối loại tệp không được hỗ trợ", async () => {
  let uploadedFiles = [];
  const app = createUploadTestApp((files) => {
    uploadedFiles = files;
  });
  const response = await request(app)
    .post("/upload")
    .field(validTicketFields())
    .attach("attachments", Buffer.from("not-an-image"), {
      filename: "tai-lieu.pdf",
      contentType: "application/pdf",
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /JPEG, PNG hoặc WebP/);
  assert.equal(uploadedFiles.length, 0);
});

test("upload ticket từ chối tệp giả mạo MIME ảnh và dọn file", async () => {
  let uploadedFiles = [];
  const app = createUploadTestApp((files) => {
    uploadedFiles = files;
  });
  const response = await request(app)
    .post("/upload")
    .field(validTicketFields())
    .attach("attachments", Buffer.from("not-really-a-png"), {
      filename: "gia-mao.png",
      contentType: "image/png",
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /không phải ảnh hợp lệ/);
  assert.equal(uploadedFiles.length, 1);
  assert.equal(await fileExists(uploadedFiles[0].path), false);
});

test("đường dẫn attachment không cho phép thoát khỏi thư mục upload", () => {
  assert.throws(
    () => getUploadedFilePath("../secret.txt"),
    /Không tìm thấy tệp đính kèm/,
  );
});
