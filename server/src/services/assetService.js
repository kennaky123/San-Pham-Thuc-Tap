import Asset from "../models/Asset.js";
import AssetRequest from "../models/AssetRequest.js";
import TicketCounter from "../models/TicketCounter.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const personSelect = "fullName email department phone role status avatar";

const assetPopulate = [
  { path: "assignedTo", select: personSelect },
  { path: "history.user", select: "fullName email" },
  { path: "history.performedBy", select: "fullName role" },
];

const requestPopulate = [
  { path: "employee", select: personSelect },
  { path: "requestedBy", select: "fullName role" },
  { path: "technician", select: "fullName email" },
  { path: "asset", select: "assetTag name type status" },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findActiveEmployee(userId) {
  const employee = await User.findOne({
    _id: userId,
    role: { $in: ["user", "technician"] },
    status: "active",
  });

  if (!employee) {
    throw new ApiError(400, "Nhân viên không tồn tại hoặc đã bị khóa.");
  }

  return employee;
}

/* ----------------------------- Thiết bị (Asset) ----------------------------- */

export async function listAssets(query, user) {
  const filter = {};

  if (user.role === "user") {
    filter.assignedTo = user._id;
  } else if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  if (query.search) {
    const pattern = { $regex: escapeRegex(query.search), $options: "i" };
    const matchedUsers = await User.find({ fullName: pattern }).select("_id").lean();
    filter.$or = [
      { assetTag: pattern },
      { name: pattern },
      { serialNumber: pattern },
      { assignedTo: { $in: matchedUsers.map((item) => item._id) } },
    ];
  }

  const [assets, summaryRows] = await Promise.all([
    Asset.find(filter)
      .select("-history")
      .populate({ path: "assignedTo", select: personSelect })
      .sort({ updatedAt: -1, _id: -1 })
      .lean(),
    Asset.aggregate([
      ...(user.role === "user" ? [{ $match: { assignedTo: user._id } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const summary = { total: 0, in_stock: 0, in_use: 0, maintenance: 0, retired: 0 };
  for (const row of summaryRows) {
    summary[row._id] = row.count;
    summary.total += row.count;
  }

  return { assets, summary };
}

export async function getAsset(assetId, user) {
  const asset = await Asset.findOne({
    _id: assetId,
    ...(user.role === "user" && { assignedTo: user._id }),
  }).populate(assetPopulate);

  if (!asset) throw new ApiError(404, "Không tìm thấy thiết bị.");
  return asset;
}

export async function createAsset(input, actor) {
  const exists = await Asset.exists({ assetTag: input.assetTag.toUpperCase() });
  if (exists) throw new ApiError(409, "Mã thiết bị (Asset Tag) đã tồn tại.");

  const asset = await Asset.create({
    ...input,
    status: input.status === "in_use" ? "in_stock" : input.status,
    history: [{ action: "created", performedBy: actor._id, note: "Nhập kho thiết bị mới." }],
  });

  return asset.populate(assetPopulate);
}

export async function updateAsset(assetId, input, actor) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Không tìm thấy thiết bị.");

  if (input.assetTag && input.assetTag.toUpperCase() !== asset.assetTag) {
    const duplicated = await Asset.exists({
      assetTag: input.assetTag.toUpperCase(),
      _id: { $ne: asset._id },
    });
    if (duplicated) throw new ApiError(409, "Mã thiết bị (Asset Tag) đã tồn tại.");
  }

  const { status, ...fields } = input;
  Object.assign(asset, fields);

  if (status && status !== asset.status) {
    if (asset.status === "in_use" || status === "in_use") {
      throw new ApiError(
        400,
        "Dùng chức năng Cấp phát / Thu hồi để thay đổi trạng thái đang sử dụng.",
      );
    }
    asset.history.push({
      action: "status_changed",
      performedBy: actor._id,
      note: `Chuyển trạng thái: ${asset.status} → ${status}`,
    });
    asset.status = status;
  } else {
    asset.history.push({ action: "updated", performedBy: actor._id, note: "Cập nhật thông tin thiết bị." });
  }

  await asset.save();
  return asset.populate(assetPopulate);
}

export async function deleteAsset(assetId) {
  const asset = await Asset.findById(assetId).select("status");
  if (!asset) throw new ApiError(404, "Không tìm thấy thiết bị.");
  if (asset.status === "in_use") {
    throw new ApiError(400, "Không thể xóa thiết bị đang được nhân viên sử dụng. Hãy thu hồi trước.");
  }
  await asset.deleteOne();
}

export async function assignAsset(assetId, { userId, note }, actor) {
  const employee = await findActiveEmployee(userId);
  const now = new Date();

  const asset = await Asset.findOneAndUpdate(
    { _id: assetId, status: "in_stock" },
    {
      $set: { status: "in_use", assignedTo: employee._id, assignedAt: now },
      $push: {
        history: {
          action: "assigned",
          user: employee._id,
          performedBy: actor._id,
          note: note || `Cấp phát cho ${employee.fullName}.`,
          at: now,
        },
      },
    },
    { new: true },
  );

  if (!asset) {
    throw new ApiError(409, "Thiết bị không tồn tại hoặc không còn ở trạng thái Trong kho.");
  }

  return asset.populate(assetPopulate);
}

export async function returnAsset(assetId, { note, status = "in_stock" }, actor) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Không tìm thấy thiết bị.");
  if (asset.status !== "in_use") {
    throw new ApiError(400, "Thiết bị hiện không được cấp phát cho nhân viên nào.");
  }

  const previousUser = asset.assignedTo;
  asset.history.push({
    action: "returned",
    user: previousUser,
    performedBy: actor._id,
    note: note || (status === "maintenance" ? "Thu hồi để bảo trì." : "Thu hồi về kho."),
  });
  asset.status = status;
  asset.assignedTo = null;
  asset.assignedAt = null;

  await asset.save();
  return asset.populate(assetPopulate);
}

export async function listAssignableEmployees() {
  return User.find({ role: { $in: ["user", "technician"] }, status: "active" })
    .select("fullName email department role")
    .sort({ fullName: 1 })
    .lean();
}

/* ------------------------ Yêu cầu cấp phát (Request) ------------------------ */

async function generateRequestCode() {
  const year = new Date().getFullYear();
  const counter = await TicketCounter.findOneAndUpdate(
    { _id: `asset-request:${year}` },
    { $inc: { sequence: 1 }, $setOnInsert: { year } },
    { new: true, upsert: true },
  );
  return `AR-${year}-${String(counter.sequence).padStart(4, "0")}`;
}

export async function listAssetRequests(query, user) {
  const filter = {};
  if (user.role === "user") filter.employee = user._id;
  if (query.status) filter.status = query.status;

  return AssetRequest.find(filter)
    .populate(requestPopulate)
    .sort({ createdAt: -1, _id: -1 })
    .lean();
}

export async function createAssetRequest(input, actor) {
  await findActiveEmployee(input.employeeId);

  if (input.technicianId) {
    const technician = await User.exists({
      _id: input.technicianId,
      role: "technician",
      status: "active",
    });
    if (!technician) throw new ApiError(400, "Kỹ thuật viên không tồn tại hoặc không hoạt động.");
  }

  const request = await AssetRequest.create({
    requestCode: await generateRequestCode(),
    employee: input.employeeId,
    assetType: input.assetType,
    note: input.note,
    requestedBy: actor._id,
    technician: input.technicianId || null,
    status: input.technicianId ? "in_progress" : "pending",
    acceptedAt: input.technicianId ? new Date() : null,
  });

  return request.populate(requestPopulate);
}

export async function acceptAssetRequest(requestId, actor) {
  const request = await AssetRequest.findOneAndUpdate(
    { _id: requestId, status: "pending" },
    { $set: { status: "in_progress", technician: actor._id, acceptedAt: new Date() } },
    { new: true },
  );

  if (!request) throw new ApiError(409, "Yêu cầu không tồn tại hoặc đã có người tiếp nhận.");
  return request.populate(requestPopulate);
}

export async function completeAssetRequest(requestId, { assetId, note }, actor) {
  const request = await AssetRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Không tìm thấy yêu cầu cấp phát.");
  if (!["pending", "in_progress"].includes(request.status)) {
    throw new ApiError(400, "Yêu cầu đã hoàn tất hoặc đã bị hủy.");
  }
  if (
    actor.role === "technician" &&
    request.technician &&
    !request.technician.equals(actor._id)
  ) {
    throw new ApiError(403, "Yêu cầu này đang do kỹ thuật viên khác xử lý.");
  }

  await assignAsset(
    assetId,
    { userId: request.employee, note: note || `Bàn giao theo yêu cầu ${request.requestCode}.` },
    actor,
  );

  request.asset = assetId;
  request.status = "completed";
  request.completedAt = new Date();
  request.technician = request.technician ?? actor._id;
  request.acceptedAt = request.acceptedAt ?? request.completedAt;
  await request.save();

  return request.populate(requestPopulate);
}

export async function cancelAssetRequest(requestId, { reason }) {
  const request = await AssetRequest.findOneAndUpdate(
    { _id: requestId, status: { $in: ["pending", "in_progress"] } },
    { $set: { status: "cancelled", cancelledAt: new Date(), cancelReason: reason || null } },
    { new: true },
  );

  if (!request) throw new ApiError(400, "Yêu cầu không tồn tại hoặc không thể hủy.");
  return request.populate(requestPopulate);
}

