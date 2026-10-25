import mongoose from "mongoose";
import {
  USB_DEVICE_STATUSES,
  USB_DEVICE_TYPES,
  USB_EVENT_TYPES,
} from "../constants/usb.js";
import ApiError from "../utils/ApiError.js";

function reject(errors, next) {
  return errors.length
    ? next(new ApiError(400, "Dữ liệu thiết bị USB không hợp lệ.", errors))
    : next();
}

function text(value, max) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return Symbol.for("invalid");
  const trimmed = value.trim();
  if (trimmed.length > max) return Symbol.for("invalid");
  return trimmed || null;
}

function isInvalid(value) {
  return value === Symbol.for("invalid");
}

export function validateUsbId(request, _response, next) {
  const id = request.params.usbId;
  return mongoose.isObjectIdOrHexString(id)
    ? next()
    : next(new ApiError(400, "Mã định danh thiết bị USB không hợp lệ."));
}

export function validateUsbQuery(request, _response, next) {
  const { status, deviceType, eventType, connectionState, search } = request.query ?? {};
  const errors = [];

  if (status && !USB_DEVICE_STATUSES.includes(status)) {
    errors.push("Trạng thái bảo mật lọc không hợp lệ.");
  }
  if (deviceType && !USB_DEVICE_TYPES.includes(deviceType)) {
    errors.push("Loại thiết bị lọc không hợp lệ.");
  }
  if (eventType && !USB_EVENT_TYPES.includes(eventType)) {
    errors.push("Loại sự kiện lọc không hợp lệ.");
  }
  if (connectionState && !["connected", "disconnected"].includes(connectionState)) {
    errors.push("Trạng thái kết nối lọc không hợp lệ.");
  }
  if (search && (typeof search !== "string" || search.length > 100)) {
    errors.push("Từ khóa tìm kiếm không hợp lệ.");
  }

  request.usbQuery = {
    status: status || null,
    deviceType: deviceType || null,
    eventType: eventType || null,
    connectionState: connectionState || null,
    search: typeof search === "string" ? search.trim() : null,
  };

  return reject(errors, next);
}

export function validateAgentUsbEvent(request, _response, next) {
  const body = request.body ?? {};
  const errors = [];

  const deviceId = text(body.deviceId, 200);
  const deviceName = text(body.deviceName, 200);
  const vendor = text(body.vendor, 120);
  const serialNumber = text(body.serialNumber, 120);
  const driveLetter = text(body.driveLetter, 20);
  const volumeName = text(body.volumeName, 120);
  const hostname = text(body.hostname, 120);
  const osUsername = text(body.osUsername, 120);
  const ipAddress = text(body.ipAddress, 80);
  const agentVersion = text(body.agentVersion, 40);

  if (!deviceId || isInvalid(deviceId) || deviceId.length < 3) {
    errors.push("deviceId bắt buộc và tối đa 200 ký tự.");
  }
  if (!deviceName || isInvalid(deviceName) || deviceName.length < 2) {
    errors.push("deviceName bắt buộc và tối đa 200 ký tự.");
  }
  if (!hostname || isInvalid(hostname) || hostname.length < 1) {
    errors.push("hostname của máy trạm là bắt buộc.");
  }
  if (isInvalid(vendor)) errors.push("vendor không hợp lệ.");
  if (isInvalid(serialNumber)) errors.push("serialNumber không hợp lệ.");
  if (isInvalid(driveLetter)) errors.push("driveLetter không hợp lệ.");
  if (isInvalid(volumeName)) errors.push("volumeName không hợp lệ.");
  if (isInvalid(osUsername)) errors.push("osUsername không hợp lệ.");
  if (isInvalid(ipAddress)) errors.push("ipAddress không hợp lệ.");
  if (isInvalid(agentVersion)) errors.push("agentVersion không hợp lệ.");

  const eventType = body.eventType || "connected";
  if (!USB_EVENT_TYPES.includes(eventType)) {
    errors.push("eventType phải là connected hoặc disconnected.");
  }

  const deviceType = body.deviceType || "storage";
  if (!USB_DEVICE_TYPES.includes(deviceType)) {
    errors.push("deviceType không hợp lệ.");
  }

  request.usbAgentEvent = {
    deviceId: typeof deviceId === "string" ? deviceId.toUpperCase() : "",
    deviceName: typeof deviceName === "string" ? deviceName : "",
    vendor: typeof vendor === "string" && vendor ? vendor : "Unknown USB Vendor",
    serialNumber: typeof serialNumber === "string" ? serialNumber : null,
    deviceType,
    driveLetter: typeof driveLetter === "string" ? driveLetter : null,
    volumeName: typeof volumeName === "string" ? volumeName : null,
    eventType,
    hostname: typeof hostname === "string" ? hostname : "UNKNOWN-PC",
    osUsername: typeof osUsername === "string" ? osUsername : null,
    ipAddress: typeof ipAddress === "string" ? ipAddress : null,
    agentVersion: typeof agentVersion === "string" && agentVersion ? agentVersion : "1.0.0-win64",
  };

  return reject(errors, next);
}

export function validateUpdateUsbPolicy(request, _response, next) {
  const body = request.body ?? {};
  const errors = [];
  const result = {};

  if (body.status !== undefined) {
    if (!USB_DEVICE_STATUSES.includes(body.status)) {
      errors.push("Trạng thái chính sách USB không hợp lệ (trusted, unverified, blocked).");
    } else {
      result.status = body.status;
    }
  }

  if (body.assignedUserId !== undefined) {
    if (body.assignedUserId === null || body.assignedUserId === "") {
      result.assignedUser = null;
    } else if (!mongoose.isObjectIdOrHexString(body.assignedUserId)) {
      errors.push("ID nhân viên gán thiết bị không hợp lệ.");
    } else {
      result.assignedUser = body.assignedUserId;
    }
  }

  if (body.note !== undefined) {
    const note = text(body.note, 1000);
    if (isInvalid(note)) {
      errors.push("Ghi chú tối đa 1000 ký tự.");
    } else {
      result.note = note;
    }
  }

  request.usbPolicyPayload = result;
  return reject(errors, next);
}
