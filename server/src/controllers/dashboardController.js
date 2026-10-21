import {
  getAdminDashboard,
  getTechnicianDashboard,
  getUserDashboard,
} from "../services/dashboardService.js";

export async function getDashboard(request, response, next) {
  try {
    const dashboard = await getAdminDashboard();

    response.set("Cache-Control", "private, no-store");
    response.vary("Authorization");

    return response.status(200).json({
      success: true,
      message: "Lấy dữ liệu dashboard thành công.",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserDashboardData(request, response, next) {
  try {
    const dashboard = await getUserDashboard(request.user._id);
    response.set("Cache-Control", "private, no-store");
    response.vary("Authorization");
    return response.status(200).json({
      success: true,
      message: "Lấy dữ liệu tổng quan người dùng thành công.",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTechnicianDashboardData(request, response, next) {
  try {
    const dashboard = await getTechnicianDashboard(request.user._id);

    response.set("Cache-Control", "private, no-store");
    response.vary("Authorization");

    return response.status(200).json({
      success: true,
      message: "Lấy dữ liệu dashboard kỹ thuật viên thành công.",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
}
