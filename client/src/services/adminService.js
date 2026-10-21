import axiosClient from "../api/axiosClient.js";

function invalid(message) {
  const error = new Error(message);
  error.code = "INVALID_ADMIN_RESPONSE";
  return error;
}

export async function getAdminUsers({ signal } = {}) {
  const users = (await axiosClient.get("/admin/users", { signal })).data?.data?.users;
  if (!Array.isArray(users)) throw invalid("Phản hồi danh sách người dùng không hợp lệ.");
  return users.map((user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    department: user.department ?? "Chưa cập nhật",
    role: user.role,
    status: user.status === "active" ? "active" : "locked",
    ticketCount: Number(user.ticketCount ?? 0),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    recentTickets: [],
  }));
}

export async function getAdminCategories({ signal } = {}) {
  const categories = (await axiosClient.get("/categories/admin", { signal })).data?.data?.categories;
  if (!Array.isArray(categories)) throw invalid("Phản hồi danh mục không hợp lệ.");
  return categories.map((category) => ({
    id: category._id,
    name: category.name,
    description: category.description ?? "",
    icon: category.name.slice(0, 2).toUpperCase(),
    tickets: Number(category.ticketCount ?? 0),
    active: Boolean(category.isActive),
  }));
}

function mapTechnician(technician) {
  return {
    id: technician._id,
    name: technician.fullName,
    email: technician.email,
    phone: technician.phone ?? "",
    specialization: technician.specialization ?? "Chưa cập nhật",
    active: Number(technician.active ?? 0),
    completed: Number(technician.completed ?? 0),
    rating: technician.rating == null ? "—" : technician.rating,
    status: technician.status,
  };
}

function mapCategory(category) {
  return {
    id: category._id,
    name: category.name,
    description: category.description ?? "",
    icon: category.name.slice(0, 2).toUpperCase(),
    tickets: Number(category.ticketCount ?? 0),
    active: Boolean(category.isActive),
  };
}

export async function getAdminTechnicians({ signal } = {}) {
  const technicians = (await axiosClient.get("/technicians/admin", { signal })).data?.data?.technicians;
  if (!Array.isArray(technicians)) throw invalid("Phản hồi kỹ thuật viên không hợp lệ.");
  return technicians.map(mapTechnician);
}

function toTechnicianPayload(values) {
  return {
    fullName: values.name,
    email: values.email,
    phone: values.phone,
    specialization: values.specialization,
    status: values.status,
    ...(values.password && { password: values.password }),
  };
}

export async function createAdminTechnician(values) {
  const response = await axiosClient.post("/technicians/admin", toTechnicianPayload(values));
  return mapTechnician(response.data?.data?.technician);
}

export async function updateAdminTechnician(id, values) {
  const response = await axiosClient.patch(`/technicians/admin/${id}`, toTechnicianPayload(values));
  return mapTechnician(response.data?.data?.technician);
}

export async function deleteAdminTechnician(id) {
  await axiosClient.delete(`/technicians/admin/${id}`);
}

export async function createAdminCategory(values) {
  const response = await axiosClient.post("/categories/admin", {
    name: values.name,
    description: values.description,
    isActive: values.active ?? true,
  });
  return mapCategory(response.data?.data?.category);
}

export async function updateAdminCategory(id, values) {
  const response = await axiosClient.patch(`/categories/admin/${id}`, {
    name: values.name,
    description: values.description,
    isActive: values.active,
  });
  return mapCategory(response.data?.data?.category);
}

export async function deleteAdminCategory(id) {
  await axiosClient.delete(`/categories/admin/${id}`);
}

export function getAdminErrorMessage(error) {
  if (!error?.response) return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
  return error.response.data?.message ?? "Không thể tải dữ liệu quản trị.";
}
