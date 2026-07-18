import User from "../models/User.js";

export async function listActiveTechnicians(_request, response, next) {
  try {
    const technicians = await User.find({
      role: "technician",
      status: "active",
    })
      .select("fullName email department avatar status")
      .sort({ fullName: 1, _id: 1 })
      .lean();

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên kỹ thuật thành công.",
      data: { technicians },
    });
  } catch (error) {
    return next(error);
  }
}
