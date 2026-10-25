import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishDataChanged } from "../services/realtimeService.js";
import {
  deleteUsbDevice,
  getServerNetworkInfo,
  listUsbDashboardData,
  recordAgentUsbEvent,
  updateUsbDevicePolicy,
} from "../services/usbService.js";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleAgentPing(_request, response, next) {
  try {
    const networkInfo = getServerNetworkInfo();
    return response.status(200).json({
      success: true,
      message: "IT Helpdesk USB Security Server đang hoạt động.",
      data: {
        online: true,
        serverTime: new Date().toISOString(),
        networkInfo,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleAgentUsbEvent(request, response, next) {
  try {
    const result = await recordAgentUsbEvent(request.usbAgentEvent, request.ip);

    publishDataChanged("usb", {
      usbAlert: {
        eventType: result.eventLog.eventType,
        deviceName: result.device.deviceName,
        vendor: result.device.vendor,
        deviceId: result.device.deviceId,
        driveLetter: result.device.driveLetter,
        hostname: result.eventLog.hostname,
        osUsername: result.eventLog.osUsername,
        ipAddress: result.eventLog.ipAddress,
        status: result.device.status,
        isNewDevice: result.isNewDevice,
        alertLevel: result.alertLevel,
        occurredAt: result.eventLog.createdAt,
      },
    });

    let policyMessage =
      "Thiết bị USB chưa được xác minh. Đã gửi cảnh báo tới Admin & Kỹ thuật viên.";
    if (result.device.status === "trusted") {
      policyMessage = "Thiết bị USB nằm trong danh sách hợp lệ (Whitelisted).";
    } else if (result.device.status === "blocked") {
      policyMessage =
        "CẢNH BÁO: Thiết bị USB này bị cấm sử dụng (Blacklisted) bởi Quản trị viên!";
    }

    return response.status(201).json({
      success: true,
      message: policyMessage,
      data: {
        ...result,
        policyStatus: result.device.status,
        policyMessage,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleDownloadAgent(_request, response, next) {
  try {
    const exePath = path.resolve(
      __dirname,
      "../../../usb-agent/ITHelpdeskUSBAgent.exe",
    );
    if (!fs.existsSync(exePath)) {
      throw new ApiError(
        404,
        "File ITHelpdeskUSBAgent.exe chưa được đóng gói trên máy chủ.",
      );
    }

    return response.download(exePath, "ITHelpdeskUSBAgent.exe");
  } catch (error) {
    return next(error);
  }
}

export async function handleGetUsbDashboard(request, response, next) {
  try {
    const data = await listUsbDashboardData(request.usbQuery);
    return response.status(200).json({
      success: true,
      message: "Lấy dữ liệu giám sát thiết bị USB thành công.",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleGetNetworkInfo(_request, response, next) {
  try {
    const networkInfo = getServerNetworkInfo();
    return response.status(200).json({
      success: true,
      message: "Lấy thông tin mạng LAN máy chủ thành công.",
      data: { networkInfo },
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleUpdateUsbPolicy(request, response, next) {
  try {
    const device = await updateUsbDevicePolicy(
      request.params.usbId,
      request.usbPolicyPayload,
      request.user._id,
    );
    publishDataChanged("usb");
    return response.status(200).json({
      success: true,
      message: "Cập nhật chính sách bảo mật thiết bị USB thành công.",
      data: { device },
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleDeleteUsbDevice(request, response, next) {
  try {
    await deleteUsbDevice(request.params.usbId);
    publishDataChanged("usb");
    return response.status(200).json({
      success: true,
      message: "Đã xóa thiết bị USB và lịch sử sự kiện liên quan.",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}
