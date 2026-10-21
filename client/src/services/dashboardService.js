import axiosClient from "../api/axiosClient.js";

const SUMMARY_FIELDS = [
  "totalTickets",
  "pendingTickets",
  "processingTickets",
  "completedTickets",
];

function isNonNegativeNumber(value) {
  return Number.isFinite(value) && value >= 0;
}

function isValidSeriesItem(item, requiredStringFields, numberFields) {
  return Boolean(
    item &&
      requiredStringFields.every(
        (field) => typeof item[field] === "string" && item[field].length > 0,
      ) &&
      numberFields.every((field) => isNonNegativeNumber(item[field])),
  );
}

function isValidDashboard(dashboard) {
  if (
    !dashboard ||
    typeof dashboard.generatedAt !== "string" ||
    Number.isNaN(new Date(dashboard.generatedAt).getTime()) ||
    typeof dashboard.timeZone !== "string" ||
    !dashboard.summary ||
    !dashboard.charts ||
    !Array.isArray(dashboard.latestTickets)
  ) {
    return false;
  }

  if (
    !SUMMARY_FIELDS.every((field) =>
      isNonNegativeNumber(dashboard.summary[field]),
    )
  ) {
    return false;
  }

  const {
    ticketsByCategory,
    ticketsByStatus,
    ticketsCreatedLast7Days,
    ticketsResolvedLast7Days,
    technicianPerformance,
  } = dashboard.charts;

  return Boolean(
    Array.isArray(ticketsByCategory) &&
      ticketsByCategory.every((item) =>
        isValidSeriesItem(item, ["key", "name"], ["value"]),
      ) &&
      Array.isArray(ticketsByStatus) &&
      ticketsByStatus.every((item) =>
        isValidSeriesItem(item, ["key", "name"], ["value"]),
      ) &&
      Array.isArray(ticketsCreatedLast7Days) &&
      ticketsCreatedLast7Days.every((item) =>
        isValidSeriesItem(item, ["date", "name"], ["value"]),
      ) &&
      Array.isArray(ticketsResolvedLast7Days) &&
      ticketsResolvedLast7Days.every((item) =>
        isValidSeriesItem(item, ["date", "name"], ["value"]),
      ) &&
      Array.isArray(technicianPerformance) &&
      technicianPerformance.every((item) =>
        isValidSeriesItem(
          item,
          ["technicianId", "name"],
          ["inProgress", "completed"],
        ),
      )
  );
}

function isValidTechnicianDashboard(dashboard) {
  const summary = dashboard?.summary;
  const summaryFields = [
    "assignedTickets",
    "assignedToday",
    "inProgressTickets",
    "waitingUserTickets",
    "urgentTickets",
    "completedThisWeek",
    "assignedThisMonth",
    "completedThisMonth",
    "completionRate",
  ];

  return Boolean(
    dashboard &&
      typeof dashboard.generatedAt === "string" &&
      !Number.isNaN(new Date(dashboard.generatedAt).getTime()) &&
      typeof dashboard.timeZone === "string" &&
      summary &&
      summaryFields.every((field) => isNonNegativeNumber(summary[field])) &&
      Array.isArray(dashboard.workTickets) &&
      dashboard.workTickets.every(
        (ticket) =>
          ticket &&
          typeof ticket.id === "string" &&
          typeof ticket.ticketCode === "string" &&
          typeof ticket.title === "string" &&
          typeof ticket.priority === "string" &&
          typeof ticket.status === "string" &&
          typeof ticket.createdAt === "string",
      ),
  );
}

function isValidUserDashboard(dashboard) {
  const summary = dashboard?.summary;
  return Boolean(
    dashboard &&
      typeof dashboard.generatedAt === "string" &&
      summary &&
      ["totalTickets", "processingTickets", "waitingUserTickets", "completedTickets"].every(
        (field) => isNonNegativeNumber(summary[field]),
      ) &&
      Array.isArray(dashboard.recentTickets),
  );
}

function createInvalidResponseError() {
  const error = new Error("Phản hồi dashboard không hợp lệ.");
  error.code = "INVALID_DASHBOARD_RESPONSE";
  return error;
}

export async function getAdminDashboard({ signal } = {}) {
  const response = await axiosClient.get("/dashboard", { signal });
  const dashboard = response.data?.data;

  if (!isValidDashboard(dashboard)) {
    throw createInvalidResponseError();
  }

  return dashboard;
}

export async function getTechnicianDashboard({ signal } = {}) {
  const response = await axiosClient.get("/dashboard/technician", { signal });
  const dashboard = response.data?.data;

  if (!isValidTechnicianDashboard(dashboard)) {
    throw createInvalidResponseError();
  }

  return dashboard;
}

export async function getUserDashboard({ signal } = {}) {
  const response = await axiosClient.get("/dashboard/user", { signal });
  const dashboard = response.data?.data;
  if (!isValidUserDashboard(dashboard)) throw createInvalidResponseError();
  return dashboard;
}

export function getDashboardErrorMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
  }

  if (error?.code === "INVALID_DASHBOARD_RESPONSE") {
    return "Dữ liệu dashboard nhận được không đúng định dạng.";
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
  }

  if (error.response.status === 403) {
    return "Tài khoản của bạn không có quyền xem dashboard này.";
  }

  if (error.response.status >= 500) {
    return "Máy chủ đang gặp sự cố khi tổng hợp dữ liệu dashboard.";
  }

  const apiMessage = error.response.data?.message;
  return typeof apiMessage === "string" && apiMessage.length > 0
    ? apiMessage
    : "Không thể tải dữ liệu dashboard. Vui lòng thử lại.";
}
