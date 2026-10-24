import mongoose from "mongoose";
import {
  ASSET_REQUEST_STATUSES,
  ASSET_STATUSES,
  ASSET_TYPES,
  REMOTE_TOOLS,
} from "../constants/asset.js";
import ApiError from "../utils/ApiError.js";

function reject(errors, next) {
  return errors.length
    ? next(new ApiError(400, "Dữ liệu đầu vào không hợp lệ.", errors))
    : next();
}

function text(value, max) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return Symbol.for("invalid");
  const trimmed = value.trim();
  if (trimmed.length > max) return Symbol.for("invalid");
  return trimmed || null;
}

function isInvalid(value) {
  return value === Symbol.for("invalid");
}

export function validateAssetId(request, _response, next) {
  const id = request.params.assetId ?? request.params.requestId;
  return mongoose.isObjectIdOrHexString(id)
    ? next()
    : next(new ApiError(400, "Mã định danh không hợp lệ."));
}

export function validateAssetQuery(request, _response, next) {
  const { status, type, search, assignedTo } = request.query ?? {};
  const errors = [];

  if (status && !ASSET_STATUSES.includes(status)) errors.push("Trạng thái lọc không hợp lệ.");
  if (type && !ASSET_TYPES.includes(type)) errors.push("Loại thiết bị lọc không hợp lệ.");
  if (assignedTo && !mongoose.isObjectIdOrHexString(assignedTo)) {
    errors.push("Người dùng lọc không hợp lệ.");
  }
  if (search && (typeof search !== "string" || search.length > 100)) {
    errors.push("Từ khóa tìm kiếm không hợp lệ.");
  }

  request.assetQuery = {
    status: status || null,
    type: type || null,
    search: typeof search === "string" ? search.trim() : null,
    assignedTo: assignedTo || null,
  };
  return reject(errors, next);
}

export function validateAssetBody(isCreate) {
  return (request, _response, next) => {
    const body = request.body ?? {};
    const errors = [];
    const result = {};

    const fields = {
      assetTag: 40,
      name: 120,
      serialNumber: 80,
      specs: 300,
      os: 80,
      remoteId: 60,
      notes: 500,
    };

    for (const [field, max] of Object.entries(fields)) {
      const value = text(body[field], max);
      if (isInvalid(value)) errors.push(`Trường ${field} không hợp lệ (tối đa ${max} ký tự).`);
      else if (value !== undefined) result[field] = value;
    }

    if (isCreate || "assetTag" in body) {
      if (!result.assetTag || !/^[A-Za-z0-9._-]{2,40}$/.test(result.assetTag)) {
        errors.push("Asset Tag chỉ gồm chữ, số, dấu chấm, gạch ngang (2-40 ký tự).");
      }
    }
    if ((isCreate || "name" in body) && (!result.name || result.name.length < 2)) {
      errors.push("Tên thiết bị phải có ít nhất 2 ký tự.");
    }

    if (body.type !== undefined) {
      if (!ASSET_TYPES.includes(body.type)) errors.push("Loại thiết bị không hợp lệ.");
      else result.type = body.type;
    }

    if (body.status !== undefined) {
      if (!ASSET_STATUSES.includes(body.status)) errors.push("Trạng thái thiết bị không hợp lệ.");
      else result.status = body.status;
    }

    if (body.remoteTool !== undefined) {
      if (!REMOTE_TOOLS.includes(body.remoteTool)) errors.push("Phần mềm điều khiển từ xa không hợp lệ.");
      else result.remoteTool = body.remoteTool;
    }

    if (result.remoteId && !/^[A-Za-z0-9@._\s-]{3,60}$/.test(result.remoteId)) {
      errors.push("ID AnyDesk / TeamViewer chỉ gồm chữ, số, khoảng trắng, @ . _ -");
    }

    if (body.purchaseDate !== undefined) {
      if (body.purchaseDate === null || body.purchaseDate === "") {
        result.purchaseDate = null;
      } else {
        const date = new Date(body.purchaseDate);
        if (Number.isNaN(date.getTime())) errors.push("Ngày mua không hợp lệ.");
        else result.purchaseDate = date;
      }
    }

    request.body = result;
    return reject(errors, next);
  };
}

export function validateAssignAsset(request, _response, next) {
  const { userId } = request.body ?? {};
  const note = text(request.body?.note, 500);
  const errors = [];

  if (!mongoose.isObjectIdOrHexString(userId)) errors.push("Vui lòng chọn nhân viên nhận thiết bị.");
  if (isInvalid(note)) errors.push("Ghi chú tối đa 500 ký tự.");

  request.body = { userId, note: isInvalid(note) ? null : note ?? null };
  return reject(errors, next);
}

export function validateReturnAsset(request, _response, next) {
  const status = request.body?.status ?? "in_stock";
  const note = text(request.body?.note, 500);
  const errors = [];

  if (!["in_stock", "maintenance"].includes(status)) {
    errors.push("Thiết bị thu hồi chỉ có thể về Kho hoặc Bảo trì.");
  }
  if (isInvalid(note)) errors.push("Ghi chú tối đa 500 ký tự.");

  request.body = { status, note: isInvalid(note) ? null : note ?? null };
  return reject(errors, next);
}

export function validateRequestQuery(request, _response, next) {
  const { status } = request.query ?? {};
  if (status && !ASSET_REQUEST_STATUSES.includes(status)) {
    return next(new ApiError(400, "Trạng thái yêu cầu không hợp lệ."));
  }
  request.assetRequestQuery = { status: status || null };
  return next();
}

export function validateCreateAssetRequest(request, _response, next) {
  const body = request.body ?? {};
  const note = text(body.note, 1000);
  const assetType = body.assetType ?? "laptop";
  const errors = [];

  if (!mongoose.isObjectIdOrHexString(body.employeeId)) errors.push("Vui lòng chọn nhân viên cần cấp thiết bị.");
  if (body.technicianId && !mongoose.isObjectIdOrHexString(body.technicianId)) {
    errors.push("Kỹ thuật viên không hợp lệ.");
  }
  if (!ASSET_TYPES.includes(assetType)) errors.push("Loại thiết bị không hợp lệ.");
  if (isInvalid(note)) errors.push("Ghi chú tối đa 1000 ký tự.");

  request.body = {
    employeeId: body.employeeId,
    technicianId: body.technicianId || null,
    assetType,
    note: isInvalid(note) ? null : note ?? null,
  };
  return reject(errors, next);
}

export function validateCompleteAssetRequest(request, _response, next) {
  const { assetId } = request.body ?? {};
  const note = text(request.body?.note, 500);
  const errors = [];

  if (!mongoose.isObjectIdOrHexString(assetId)) errors.push("Vui lòng chọn thiết bị trong kho để bàn giao.");
  if (isInvalid(note)) errors.push("Ghi chú tối đa 500 ký tự.");

  request.body = { assetId, note: isInvalid(note) ? null : note ?? null };
  return reject(errors, next);
}

export function validateCancelAssetRequest(request, _response, next) {
  const reason = text(request.body?.reason, 500);
  if (isInvalid(reason)) return next(new ApiError(400, "Lý do hủy tối đa 500 ký tự."));
  request.body = { reason: reason ?? null };
  return next();
}

