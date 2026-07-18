export function getHealth(_request, response, next) {
  try {
    return response.status(200).json({
      success: true,
      message: "IT Helpdesk API đang hoạt động.",
      data: {
        service: "it-helpdesk-server",
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Number(process.uptime().toFixed(2)),
      },
    });
  } catch (error) {
    return next(error);
  }
}
