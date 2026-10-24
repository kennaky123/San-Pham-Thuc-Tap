import axiosClient from "../api/axiosClient.js";

function invalid(message) {
  const error = new Error(message);
  error.code = "INVALID_ASSET_RESPONSE";
  return error;
}

export async function getAssets(params = {}, { signal } = {}) {
  const response = await axiosClient.get("/assets", { params, signal });
  const data = response.data?.data;
  if (!data || !Array.isArray(data.assets)) {
    throw invalid("Phản hồi danh sách thiết bị không hợp lệ.");
  }
  return data;
}

export async function getAsset(assetId, { signal } = {}) {
  const response = await axiosClient.get(`/assets/${assetId}`, { signal });
  const asset = response.data?.data?.asset;
  if (!asset) throw invalid("Phản hồi thông tin thiết bị không hợp lệ.");
  return asset;
}

export async function createAsset(payload) {
  const response = await axiosClient.post("/assets", payload);
  return response.data?.data?.asset;
}

export async function updateAsset(assetId, payload) {
  const response = await axiosClient.patch(`/assets/${assetId}`, payload);
  return response.data?.data?.asset;
}

export async function deleteAsset(assetId) {
  const response = await axiosClient.delete(`/assets/${assetId}`);
  return response.data;
}

export async function assignAsset(assetId, { userId, note }) {
  const response = await axiosClient.post(`/assets/${assetId}/assign`, { userId, note });
  return response.data?.data?.asset;
}

export async function returnAsset(assetId, { status = "in_stock", note }) {
  const response = await axiosClient.post(`/assets/${assetId}/return`, { status, note });
  return response.data?.data?.asset;
}

export async function getAssignableEmployees({ signal } = {}) {
  const response = await axiosClient.get("/assets/employees", { signal });
  const employees = response.data?.data?.employees;
  if (!Array.isArray(employees)) throw invalid("Phản hồi nhân viên không hợp lệ.");
  return employees;
}

/* ------------------------ Asset Requests ------------------------ */

export async function getAssetRequests(params = {}, { signal } = {}) {
  const response = await axiosClient.get("/assets/requests", { params, signal });
  const requests = response.data?.data?.requests;
  if (!Array.isArray(requests)) throw invalid("Phản hồi yêu cầu cấp phát không hợp lệ.");
  return requests;
}

export async function createAssetRequest(payload) {
  const response = await axiosClient.post("/assets/requests", payload);
  return response.data?.data?.request;
}

export async function acceptAssetRequest(requestId) {
  const response = await axiosClient.post(`/assets/requests/${requestId}/accept`);
  return response.data?.data?.request;
}

export async function completeAssetRequest(requestId, { assetId, note }) {
  const response = await axiosClient.post(`/assets/requests/${requestId}/complete`, {
    assetId,
    note,
  });
  return response.data?.data?.request;
}

export async function cancelAssetRequest(requestId, { reason }) {
  const response = await axiosClient.post(`/assets/requests/${requestId}/cancel`, {
    reason,
  });
  return response.data?.data?.request;
}

/**
 * Mở ứng dụng điều khiển từ xa bằng URL Protocol Scheme (AnyDesk / TeamViewer)
 * và tự động copy Remote ID vào clipboard.
 */
export async function launchRemoteDesktop(tool, rawId) {
  const id = String(rawId || "").replace(/\s+/g, "");
  if (!id) {
    throw new Error("Chưa có ID điều khiển từ xa cho thiết bị này.");
  }

  // Tự động copy ID vào Clipboard
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // Bỏ qua lỗi clipboard nếu trình duyệt chặn
    }
  }

  let protocolUrl;
  let appName;

  if (tool === "teamviewer") {
    protocolUrl = `teamviewer10://control?device=${id}`;
    appName = "TeamViewer";
  } else {
    protocolUrl = `anydesk:${id}`;
    appName = "AnyDesk";
  }

  // Mở deep-link
  window.location.href = protocolUrl;

  return { appName, id, protocolUrl };
}
