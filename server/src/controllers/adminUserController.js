import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

export async function listAdminUsers(_request, response, next) {
  try {
    const [users, ticketCounts] = await Promise.all([
      User.find()
        .select("fullName email phone department role status lastLoginAt createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .lean(),
      Ticket.aggregate([
        { $group: { _id: "$createdBy", ticketCount: { $sum: 1 } } },
      ]),
    ]);
    const countByUser = new Map(ticketCounts.map((row) => [String(row._id), row.ticketCount]));

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công.",
      data: {
        users: users.map((user) => ({
          ...user,
          ticketCount: countByUser.get(String(user._id)) ?? 0,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}
