import { getAdminDashboard } from "../services/dashboardService.js";

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
