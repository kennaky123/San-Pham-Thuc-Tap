import os from "node:os";
import { env } from "../config/env.js";
import UsbDevice from "../models/UsbDevice.js";
import UsbEventLog from "../models/UsbEventLog.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanIp(rawIp) {
  if (!rawIp) return "127.0.0.1";
  const str = String(rawIp).trim();
  if (str === "::1") return "127.0.0.1";
  if (str.startsWith("::ffff:")) return str.slice(7);
  return str;
}

export function getServerNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const lanAddresses = [];

  for (const [interfaceName, nets] of Object.entries(interfaces)) {
    for (const net of nets || []) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("169.254.")
      ) {
        lanAddresses.push({
          interfaceName,
          ip: net.address,
          serverUrl: `http://${net.address}:${env.port}`,
          webUrl: `http://${net.address}:5173`,
          agentDownloadUrl: `http://${net.address}:${env.port}/api/usb/download-agent`,
        });
      }
    }
  }

  const primaryLanIp = lanAddresses[0]?.ip || "127.0.0.1";

  return {
    serverHostname: os.hostname(),
    port: env.port,
    primaryLanIp,
    primaryServerUrl: `http://${primaryLanIp}:${env.port}`,
    primaryWebUrl: `http://${primaryLanIp}:5173`,
    lanAddresses,
  };
}

export async function recordAgentUsbEvent(payload, requestIp) {
  const now = new Date();
  const resolvedIp =
    payload.ipAddress && payload.ipAddress !== "127.0.0.1"
      ? payload.ipAddress
      : cleanIp(requestIp);

  const normalizedDeviceId = payload.deviceId.trim().toUpperCase();
  let device = await UsbDevice.findOne({ deviceId: normalizedDeviceId });
  let isNewDevice = false;

  if (!device) {
    isNewDevice = true;
    device = await UsbDevice.create({
      deviceId: normalizedDeviceId,
      deviceName: payload.deviceName,
      vendor: payload.vendor || "Unknown USB Vendor",
      serialNumber: payload.serialNumber || null,
      deviceType: payload.deviceType || "storage",
      driveLetter: payload.driveLetter || null,
      volumeName: payload.volumeName || null,
      status: "unverified",
      isCurrentlyConnected: payload.eventType === "connected",
      lastHost: {
        hostname: payload.hostname,
        osUsername: payload.osUsername || null,
        ipAddress: resolvedIp,
        connectedAt: payload.eventType === "connected" ? now : null,
        disconnectedAt: payload.eventType === "disconnected" ? now : null,
      },
      connectionCount: 1,
    });
  } else {
    device.deviceName = payload.deviceName || device.deviceName;
    if (payload.vendor) device.vendor = payload.vendor;
    if (payload.serialNumber) device.serialNumber = payload.serialNumber;
    if (payload.deviceType) device.deviceType = payload.deviceType;
    if (payload.driveLetter !== undefined) device.driveLetter = payload.driveLetter;
    if (payload.volumeName !== undefined) device.volumeName = payload.volumeName;

    device.isCurrentlyConnected = payload.eventType === "connected";
    device.lastHost = {
      hostname: payload.hostname || device.lastHost?.hostname || "UNKNOWN-PC",
      osUsername: payload.osUsername || device.lastHost?.osUsername || null,
      ipAddress: resolvedIp || device.lastHost?.ipAddress || null,
      connectedAt:
        payload.eventType === "connected"
          ? now
          : device.lastHost?.connectedAt || now,
      disconnectedAt:
        payload.eventType === "disconnected"
          ? now
          : device.lastHost?.disconnectedAt || null,
    };

    if (payload.eventType === "connected") {
      device.connectionCount = (device.connectionCount || 0) + 1;
    }

    await device.save();
  }

  const eventLog = await UsbEventLog.create({
    usbDevice: device._id,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    vendor: device.vendor,
    serialNumber: device.serialNumber,
    deviceType: device.deviceType,
    driveLetter: device.driveLetter,
    volumeName: device.volumeName,
    eventType: payload.eventType,
    deviceStatusAtEvent: device.status,
    hostname: payload.hostname,
    osUsername: payload.osUsername || null,
    ipAddress: resolvedIp,
    agentVersion: payload.agentVersion || "1.0.0-win64",
  });

  await device.populate([
    { path: "assignedUser", select: "fullName email department role" },
    { path: "reviewedBy", select: "fullName email role" },
  ]);

  let alertLevel = "info";
  if (device.status === "blocked") {
    alertLevel = "critical";
  } else if (device.status === "unverified") {
    alertLevel = "warning";
  }

  return {
    device: device.toObject(),
    eventLog: eventLog.toObject(),
    isNewDevice,
    alertLevel,
  };
}

export async function listUsbDashboardData(query = {}) {
  const deviceFilter = {};
  const eventFilter = {};

  if (query.status) {
    deviceFilter.status = query.status;
    eventFilter.deviceStatusAtEvent = query.status;
  }

  if (query.deviceType) {
    deviceFilter.deviceType = query.deviceType;
    eventFilter.deviceType = query.deviceType;
  }

  if (query.connectionState === "connected") {
    deviceFilter.isCurrentlyConnected = true;
  } else if (query.connectionState === "disconnected") {
    deviceFilter.isCurrentlyConnected = false;
  }

  if (query.eventType) {
    eventFilter.eventType = query.eventType;
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    deviceFilter.$or = [
      { deviceName: regex },
      { vendor: regex },
      { deviceId: regex },
      { serialNumber: regex },
      { "lastHost.hostname": regex },
      { "lastHost.osUsername": regex },
      { "lastHost.ipAddress": regex },
    ];
    eventFilter.$or = [
      { deviceName: regex },
      { vendor: regex },
      { deviceId: regex },
      { hostname: regex },
      { osUsername: regex },
      { ipAddress: regex },
    ];
  }

  const [devices, events, allDevices, totalEvents] = await Promise.all([
    UsbDevice.find(deviceFilter)
      .populate("assignedUser", "fullName email department role")
      .populate("reviewedBy", "fullName email role")
      .sort({ isCurrentlyConnected: -1, updatedAt: -1 })
      .lean(),
    UsbEventLog.find(eventFilter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    UsbDevice.find({}).select("status isCurrentlyConnected lastHost").lean(),
    UsbEventLog.countDocuments({}),
  ]);

  let currentlyConnected = 0;
  let unverifiedCount = 0;
  let trustedCount = 0;
  let blockedCount = 0;
  const activeHosts = new Set();

  for (const item of allDevices) {
    if (item.isCurrentlyConnected) currentlyConnected += 1;
    if (item.status === "unverified") unverifiedCount += 1;
    else if (item.status === "trusted") trustedCount += 1;
    else if (item.status === "blocked") blockedCount += 1;

    if (item.lastHost?.hostname) {
      activeHosts.add(item.lastHost.hostname.toUpperCase());
    }
  }

  return {
    devices,
    events,
    summary: {
      totalDevices: allDevices.length,
      currentlyConnected,
      unverifiedCount,
      trustedCount,
      blockedCount,
      totalEvents,
      activeHostsCount: activeHosts.size,
    },
    networkInfo: getServerNetworkInfo(),
  };
}

export async function updateUsbDevicePolicy(usbId, payload, reviewerId) {
  const device = await UsbDevice.findById(usbId);
  if (!device) {
    throw new ApiError(404, "Không tìm thấy thiết bị USB.");
  }

  if (payload.assignedUser) {
    const userExists = await User.exists({ _id: payload.assignedUser });
    if (!userExists) {
      throw new ApiError(404, "Nhân viên được chọn không tồn tại.");
    }
  }

  if (payload.status !== undefined) {
    device.status = payload.status;
  }
  if (payload.assignedUser !== undefined) {
    device.assignedUser = payload.assignedUser;
  }
  if (payload.note !== undefined) {
    device.note = payload.note;
  }

  device.reviewedBy = reviewerId;
  await device.save();

  await device.populate([
    { path: "assignedUser", select: "fullName email department role" },
    { path: "reviewedBy", select: "fullName email role" },
  ]);

  return device.toObject();
}

export async function deleteUsbDevice(usbId) {
  const device = await UsbDevice.findByIdAndDelete(usbId);
  if (!device) {
    throw new ApiError(404, "Không tìm thấy thiết bị USB cần xóa.");
  }

  await UsbEventLog.deleteMany({ usbDevice: device._id });
  return device.toObject();
}
