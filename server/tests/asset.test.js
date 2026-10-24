import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";

const [
  {
    validateAssetBody,
    validateAssignAsset,
    validateReturnAsset,
    validateCreateAssetRequest,
    validateCompleteAssetRequest,
  },
  { ASSET_TYPES, ASSET_STATUSES, REMOTE_TOOLS },
] = await Promise.all([
  import("../src/validators/assetValidators.js"),
  import("../src/constants/asset.js"),
]);

function runMiddleware(middleware, request) {
  return new Promise((resolve) => middleware(request, {}, (error) => resolve(error)));
}

test("ASSET constants define correct statuses and remote tools", () => {
  assert.ok(ASSET_TYPES.includes("laptop"));
  assert.ok(ASSET_STATUSES.includes("in_stock"));
  assert.ok(ASSET_STATUSES.includes("in_use"));
  assert.ok(REMOTE_TOOLS.includes("anydesk"));
  assert.ok(REMOTE_TOOLS.includes("teamviewer"));
});

test("validateAssetBody chuẩn hóa và kiểm tra thiết bị hợp lệ", async () => {
  const request = {
    body: {
      assetTag: "  LP-2026-001  ",
      name: "  ThinkPad T14s Gen 4  ",
      type: "laptop",
      serialNumber: "SN12345678",
      specs: "i7-1365U, 32GB RAM, 1TB SSD",
      os: "Windows 11 Pro",
      remoteTool: "anydesk",
      remoteId: "123 456 789",
    },
  };

  const error = await runMiddleware(validateAssetBody(true), request);
  assert.equal(error, undefined);
  assert.equal(request.body.assetTag, "LP-2026-001");
  assert.equal(request.body.name, "ThinkPad T14s Gen 4");
  assert.equal(request.body.remoteTool, "anydesk");
  assert.equal(request.body.remoteId, "123 456 789");
});

test("validateAssetBody từ chối assetTag không hợp lệ hoặc thiếu tên", async () => {
  const request = {
    body: {
      assetTag: "@@invalid tag@@",
      name: "",
    },
  };

  const error = await runMiddleware(validateAssetBody(true), request);
  assert.equal(error.statusCode, 400);
  assert.ok(error.details.length >= 2);
});

test("validateAssignAsset kiểm tra ID người nhận thiết bị", async () => {
  const validRequest = {
    body: {
      userId: "507f1f77bcf86cd799439011",
      note: "Cấp máy cho nhân sự mới",
    },
  };
  assert.equal(await runMiddleware(validateAssignAsset, validRequest), undefined);

  const invalidRequest = {
    body: {
      userId: "invalid-id",
    },
  };
  const error = await runMiddleware(validateAssignAsset, invalidRequest);
  assert.equal(error.statusCode, 400);
});

test("validateReturnAsset kiểm tra trạng thái trả về kho hoặc bảo trì", async () => {
  const request = {
    body: {
      status: "in_stock",
      note: "Thu hồi hoàn tất dự án",
    },
  };
  assert.equal(await runMiddleware(validateReturnAsset, request), undefined);

  const invalidRequest = {
    body: {
      status: "in_use",
    },
  };
  const error = await runMiddleware(validateReturnAsset, invalidRequest);
  assert.equal(error.statusCode, 400);
});

test("validateCreateAssetRequest và validateCompleteAssetRequest", async () => {
  const createRequest = {
    body: {
      employeeId: "507f1f77bcf86cd799439011",
      assetType: "laptop",
      note: "Nhân viên mới cần máy làm việc",
    },
  };
  assert.equal(await runMiddleware(validateCreateAssetRequest, createRequest), undefined);

  const completeRequest = {
    body: {
      assetId: "507f1f77bcf86cd799439012",
      note: "Bàn giao máy ThinkPad",
    },
  };
  assert.equal(await runMiddleware(validateCompleteAssetRequest, completeRequest), undefined);
});

