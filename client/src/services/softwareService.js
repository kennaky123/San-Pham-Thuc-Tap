import axiosClient from "../api/axiosClient.js";

function invalid(message) {
  const error = new Error(message);
  error.code = "INVALID_SOFTWARE_RESPONSE";
  return error;
}

export async function getSoftwareLicenses(params = {}, { signal } = {}) {
  const response = await axiosClient.get("/software", { params, signal });
  const data = response.data?.data;
  if (!data || !Array.isArray(data.licenses)) {
    throw invalid("Phản hồi danh sách bản quyền phần mềm không hợp lệ.");
  }
  return data;
}

export async function getSoftwareLicense(licenseId, { signal } = {}) {
  const response = await axiosClient.get(`/software/${licenseId}`, { signal });
  const license = response.data?.data?.license;
  if (!license) throw invalid("Phản hồi thông tin bản quyền không hợp lệ.");
  return license;
}

export async function getFinOpsSummary({ signal } = {}) {
  const response = await axiosClient.get("/software/finops", { signal });
  const finOps = response.data?.data?.finOps;
  if (!finOps) throw invalid("Phản hồi báo cáo FinOps không hợp lệ.");
  return finOps;
}

export async function createSoftwareLicense(payload) {
  const response = await axiosClient.post("/software", payload);
  return response.data?.data?.license;
}

export async function updateSoftwareLicense(licenseId, payload) {
  const response = await axiosClient.patch(`/software/${licenseId}`, payload);
  return response.data?.data?.license;
}

export async function deleteSoftwareLicense(licenseId) {
  const response = await axiosClient.delete(`/software/${licenseId}`);
  return response.data;
}

export async function allocateLicense(licenseId, { userId, note }) {
  const response = await axiosClient.post(`/software/${licenseId}/allocate`, {
    userId,
    note,
  });
  return response.data?.data?.license;
}

export async function revokeLicense(licenseId, { userId }) {
  const response = await axiosClient.post(`/software/${licenseId}/revoke`, {
    userId,
  });
  return response.data?.data?.license;
}

export function formatCurrencyVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
}
