import axiosClient from "../api/axiosClient.js";
import { clientEnv } from "../config/env.js";

function invalid(message) {
  const error = new Error(message);
  error.code = "INVALID_USB_RESPONSE";
  return error;
}

export async function getUsbDashboard(params = {}, { signal } = {}) {
  const response = await axiosClient.get("/usb", { params, signal });
  const data = response.data?.data;
  if (!data || !Array.isArray(data.devices) || !Array.isArray(data.events)) {
    throw invalid("Phản hồi dữ liệu giám sát thiết bị USB không hợp lệ.");
  }
  return data;
}

export async function getServerNetworkInfo({ signal } = {}) {
  const response = await axiosClient.get("/usb/network-info", { signal });
  const networkInfo = response.data?.data?.networkInfo;
  if (!networkInfo) {
    throw invalid("Phản hồi thông tin mạng LAN không hợp lệ.");
  }
  return networkInfo;
}

export async function updateUsbDevicePolicy(usbId, payload) {
  const response = await axiosClient.patch(`/usb/${usbId}/policy`, payload);
  return response.data?.data?.device;
}

export async function deleteUsbDevice(usbId) {
  const response = await axiosClient.delete(`/usb/${usbId}`);
  return response.data;
}

export async function sendAgentUsbEvent(payload) {
  const response = await axiosClient.post("/usb/agent-event", payload);
  return response.data?.data;
}

export function getAgentDownloadUrl() {
  return `${clientEnv.apiUrl}/usb/download-agent`;
}
