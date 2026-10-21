import User from "../models/User.js";
import { unlink } from "node:fs/promises";
import { getUploadedFilePath } from "../config/upload.js";
import Ticket from "../models/Ticket.js";
import Rating from "../models/Rating.js";
import ApiError from "../utils/ApiError.js";

const ACTIVE_TICKET_STATUSES = ["assigned", "in_progress", "waiting_user"];
const COMPLETED_TICKET_STATUSES = ["resolved", "closed"];

function serializeTechnician(user, statistics = {}) {
  const active = Number(statistics.active ?? 0);
  const accountIsActive = user.status === "active";

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    specialization: user.department,
    avatar: user.avatar,
    accountStatus: user.status,
    status: accountIsActive ? (active > 0 ? "busy" : "online") : "offline",
    active,
    completed: Number(statistics.completed ?? 0),
    rating:
      statistics.averageRating == null
        ? null
        : Math.round(Number(statistics.averageRating) * 10) / 10,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getTechnicianStatistics() {
  const [ticketRows, ratingRows] = await Promise.all([
    Ticket.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTo",
          active: {
            $sum: { $cond: [{ $in: ["$status", ACTIVE_TICKET_STATUSES] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $in: ["$status", COMPLETED_TICKET_STATUSES] }, 1, 0] },
          },
        },
      },
    ]),
    Rating.aggregate([
      { $group: { _id: "$technician", averageRating: { $avg: "$score" } } },
    ]),
  ]);
  const statistics = new Map(
    ticketRows.map((row) => [String(row._id), { ...row }]),
  );

  for (const row of ratingRows) {
    const key = String(row._id);
    statistics.set(key, { ...statistics.get(key), averageRating: row.averageRating });
  }

  return statistics;
}

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

export async function listAdminTechnicians(_request, response, next) {
  try {
    const [technicians, statistics] = await Promise.all([
      User.find({ role: "technician" })
        .select("fullName email phone department avatar status createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .lean(),
      getTechnicianStatistics(),
    ]);

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách kỹ thuật viên thành công.",
      data: {
        technicians: technicians.map((user) =>
          serializeTechnician(user, statistics.get(String(user._id))),
        ),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTechnician(request, response, next) {
  try {
    const existingUser = await User.exists({ email: request.body.email });
    if (existingUser) throw new ApiError(409, "Email đã được sử dụng.");

    const user = await User.create({
      fullName: request.body.fullName,
      email: request.body.email,
      password: request.body.password,
      phone: request.body.phone,
      department: request.body.specialization,
      role: "technician",
      status: request.body.status === "offline" ? "inactive" : "active",
    });

    return response.status(201).json({
      success: true,
      message: "Thêm kỹ thuật viên thành công.",
      data: { technician: serializeTechnician(user.toObject()) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTechnician(request, response, next) {
  try {
    const user = await User.findOne({ _id: request.params.technicianId, role: "technician" });
    if (!user) throw new ApiError(404, "Không tìm thấy kỹ thuật viên.");

    const duplicateEmail = await User.exists({
      _id: { $ne: user._id },
      email: request.body.email,
    });
    if (duplicateEmail) throw new ApiError(409, "Email đã được sử dụng.");

    user.fullName = request.body.fullName;
    user.email = request.body.email;
    user.phone = request.body.phone;
    user.department = request.body.specialization;
    user.status = request.body.status === "offline" ? "inactive" : "active";
    if (request.body.password) user.password = request.body.password;
    await user.save();

    const statistics = await getTechnicianStatistics();
    return response.status(200).json({
      success: true,
      message: "Cập nhật kỹ thuật viên thành công.",
      data: { technician: serializeTechnician(user.toObject(), statistics.get(String(user._id))) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTechnician(request, response, next) {
  try {
    const user = await User.findOne({ _id: request.params.technicianId, role: "technician" });
    if (!user) throw new ApiError(404, "Không tìm thấy kỹ thuật viên.");

    const relatedTickets = await Ticket.exists({
      $or: [{ assignedTo: user._id }, { createdBy: user._id }],
    });
    if (relatedTickets) {
      throw new ApiError(409, "Không thể xóa kỹ thuật viên đã có ticket liên quan. Hãy đặt tài khoản ở trạng thái ngoại tuyến.");
    }

    await User.deleteOne({ _id: user._id });
    if (user.avatar) {
      try {
        await unlink(getUploadedFilePath(user.avatar));
      } catch {
        // Avatar có thể là URL bên ngoài hoặc file đã được dọn trước đó.
      }
    }
    return response.status(200).json({
      success: true,
      message: "Xóa kỹ thuật viên thành công.",
      data: { technicianId: String(user._id) },
    });
  } catch (error) {
    return next(error);
  }
}
