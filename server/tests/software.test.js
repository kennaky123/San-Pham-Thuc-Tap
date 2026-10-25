import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";

const [
  {
    validateSoftwareBody,
    validateAllocateLicense,
    validateRevokeLicense,
    validateSoftwareQuery,
  },
  { LICENSE_TYPES, BILLING_CYCLES, SOFTWARE_CATEGORIES, LICENSE_STATUSES },
] = await Promise.all([
  import("../src/validators/softwareValidators.js"),
  import("../src/constants/software.js"),
]);

function runMiddleware(middleware, request) {
  return new Promise((resolve) => middleware(request, {}, (error) => resolve(error)));
}

test("SOFTWARE constants define correct categories, billing cycles and license types", () => {
  assert.ok(LICENSE_TYPES.includes("saas_subscription"));
  assert.ok(LICENSE_TYPES.includes("perpetual"));
  assert.ok(BILLING_CYCLES.includes("monthly"));
  assert.ok(BILLING_CYCLES.includes("yearly"));
  assert.ok(SOFTWARE_CATEGORIES.includes("Văn phòng & Email"));
  assert.ok(LICENSE_STATUSES.includes("active"));
  assert.ok(LICENSE_STATUSES.includes("expiring_soon"));
  assert.ok(LICENSE_STATUSES.includes("expired"));
});

test("validateSoftwareBody chuẩn hóa dữ liệu bản quyền hợp lệ", async () => {
  const request = {
    body: {
      name: "  Microsoft 365 Business Standard  ",
      vendor: "  Microsoft Corporation  ",
      category: "Văn phòng & Email",
      type: "saas_subscription",
      totalSeats: "25",
      costPerSeat: "280000",
      billingCycle: "monthly",
      currency: "vnd",
      portalUrl: "https://admin.microsoft.com",
    },
  };

  const error = await runMiddleware(validateSoftwareBody(true), request);
  assert.equal(error, undefined);
  assert.equal(request.body.name, "Microsoft 365 Business Standard");
  assert.equal(request.body.vendor, "Microsoft Corporation");
  assert.equal(request.body.totalSeats, 25);
  assert.equal(request.body.costPerSeat, 280000);
  assert.equal(request.body.billingCycle, "monthly");
  assert.equal(request.body.currency, "VND");
});

test("validateSoftwareBody từ chối khi thiếu tên hoặc totalSeats < 1", async () => {
  const request = {
    body: {
      name: "",
      vendor: "Adobe",
      totalSeats: 0,
    },
  };

  const error = await runMiddleware(validateSoftwareBody(true), request);
  assert.equal(error.statusCode, 400);
  assert.ok(error.details.length >= 2);
});

test("validateAllocateLicense kiểm tra userId nhân viên", async () => {
  const validRequest = {
    body: {
      userId: "507f1f77bcf86cd799439011",
      note: "Cấp bản quyền Office cho kế toán viên",
    },
  };
  assert.equal(await runMiddleware(validateAllocateLicense, validRequest), undefined);

  const invalidRequest = {
    body: {
      userId: "invalid-id",
    },
  };
  const error = await runMiddleware(validateAllocateLicense, invalidRequest);
  assert.equal(error.statusCode, 400);
});

test("validateRevokeLicense yêu cầu userId", async () => {
  const validRequest = {
    body: {
      userId: "507f1f77bcf86cd799439011",
    },
  };
  assert.equal(await runMiddleware(validateRevokeLicense, validRequest), undefined);

  const invalidRequest = {
    body: {},
  };
  const error = await runMiddleware(validateRevokeLicense, invalidRequest);
  assert.equal(error.statusCode, 400);
});

test("validateSoftwareQuery lọc theo category và search", async () => {
  const request = {
    query: {
      category: "Thiết kế & Đồ họa",
      search: "Adobe",
    },
  };
  assert.equal(await runMiddleware(validateSoftwareQuery, request), undefined);
  assert.equal(request.softwareQuery.category, "Thiết kế & Đồ họa");
  assert.equal(request.softwareQuery.search, "Adobe");
});

