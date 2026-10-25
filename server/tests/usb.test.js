import assert from "node:assert/strict";
import test from "node:test";
import {
  USB_DEVICE_STATUSES,
  USB_DEVICE_TYPES,
  USB_EVENT_TYPES,
} from "../src/constants/usb.js";
import {
  validateAgentUsbEvent,
  validateUpdateUsbPolicy,
  validateUsbQuery,
} from "../src/validators/usbValidators.js";
import { getServerNetworkInfo } from "../src/services/usbService.js";

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (err) => resolve(err));
  });
}

test("USB constants định nghĩa đúng các trạng thái và sự kiện", () => {
  assert.deepEqual(USB_DEVICE_STATUSES, ["trusted", "unverified", "blocked"]);
  assert.deepEqual(USB_EVENT_TYPES, ["connected", "disconnected"]);
  assert.ok(USB_DEVICE_TYPES.includes("storage"));
  assert.ok(USB_DEVICE_TYPES.includes("input_hid"));
});

test("validateAgentUsbEvent chuẩn hóa dữ liệu sự kiện cắm USB từ agent", async () => {
  const req = {
    body: {
      deviceId: "usbstor\\disk&ven_sandisk&prod_ultra\\123456",
      deviceName: "  SanDisk Ultra 64GB  ",
      vendor: "SanDisk",
      serialNumber: "123456",
      deviceType: "storage",
      driveLetter: "E:",
      volumeName: "DATA (64GB)",
      eventType: "connected",
      hostname: "DESKTOP-NV01",
      osUsername: "User01",
      ipAddress: "192.168.1.20",
    },
  };

  const err = await runMiddleware(validateAgentUsbEvent, req);
  assert.equal(err, undefined);
  assert.equal(
    req.usbAgentEvent.deviceId,
    "USBSTOR\\DISK&VEN_SANDISK&PROD_ULTRA\\123456",
  );
  assert.equal(req.usbAgentEvent.deviceName, "SanDisk Ultra 64GB");
  assert.equal(req.usbAgentEvent.eventType, "connected");
  assert.equal(req.usbAgentEvent.hostname, "DESKTOP-NV01");
});

test("validateAgentUsbEvent từ chối khi thiếu deviceId hoặc hostname", async () => {
  const req = {
    body: {
      deviceName: "SanDisk Ultra",
    },
  };

  const err = await runMiddleware(validateAgentUsbEvent, req);
  assert.ok(err);
  assert.equal(err.statusCode, 400);
});

test("validateUpdateUsbPolicy kiểm tra trạng thái phê duyệt hoặc chặn USB", async () => {
  const req = {
    body: {
      status: "trusted",
      note: "Đã kiểm tra an toàn thông tin DLP",
    },
  };

  const err = await runMiddleware(validateUpdateUsbPolicy, req);
  assert.equal(err, undefined);
  assert.equal(req.usbPolicyPayload.status, "trusted");
  assert.equal(req.usbPolicyPayload.note, "Đã kiểm tra an toàn thông tin DLP");
});

test("validateUsbQuery lọc theo trạng thái và loại kết nối", async () => {
  const req = {
    query: {
      status: "unverified",
      connectionState: "connected",
      search: "SanDisk",
    },
  };

  const err = await runMiddleware(validateUsbQuery, req);
  assert.equal(err, undefined);
  assert.equal(req.usbQuery.status, "unverified");
  assert.equal(req.usbQuery.connectionState, "connected");
  assert.equal(req.usbQuery.search, "SanDisk");
});

test("getServerNetworkInfo trả về thông tin hostname và port của server", () => {
  const info = getServerNetworkInfo();
  assert.ok(info.serverHostname);
  assert.equal(typeof info.port, "number");
  assert.ok(Array.isArray(info.lanAddresses));
});
