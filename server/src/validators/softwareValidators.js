import mongoose from "mongoose";
import {
  BILLING_CYCLES,
  LICENSE_STATUSES,
  LICENSE_TYPES,
  SOFTWARE_CATEGORIES,
} from "../constants/software.js";
import ApiError from "../utils/ApiError.js";

function reject(errors, next) {
  return errors.length
    ? next(new ApiError(400, "Dữ liệu bản quyền không hợp lệ.", errors))
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

export function validateSoftwareId(request, _response, next) {
  const id = request.params.licenseId;
  return mongoose.isObjectIdOrHexString(id)
    ? next()
    : next(new ApiError(400, "Mã định danh bản quyền không hợp lệ."));
}

export function validateSoftwareQuery(request, _response, next) {
  const { category, type, status, search } = request.query ?? {};
  const errors = [];

  if (category && !SOFTWARE_CATEGORIES.includes(category)) {
    errors.push("Danh mục lọc không hợp lệ.");
  }
  if (type && !LICENSE_TYPES.includes(type)) {
    errors.push("Loại bản quyền lọc không hợp lệ.");
  }
  if (status && !LICENSE_STATUSES.includes(status)) {
    errors.push("Trạng thái lọc không hợp lệ.");
  }
  if (search && (typeof search !== "string" || search.length > 100)) {
    errors.push("Từ khóa tìm kiếm không hợp lệ.");
  }

  request.softwareQuery = {
    category: category || null,
    type: type || null,
    status: status || null,
    search: typeof search === "string" ? search.trim() : null,
  };
  return reject(errors, next);
}

export function validateSoftwareBody(isCreate) {
  return (request, _response, next) => {
    const body = request.body ?? {};
    const errors = [];
    const result = {};

    const fields = {
      name: 150,
      vendor: 100,
      licenseKey: 300,
      portalUrl: 255,
      notes: 1000,
      currency: 10,
    };

    for (const [field, max] of Object.entries(fields)) {
      const val = text(body[field], max);
      if (isInvalid(val)) errors.push(`Trường ${field} không hợp lệ (tối đa ${max} ký tự).`);
      else if (val !== undefined) result[field] = val;
    }

    if (result.currency) {
      result.currency = result.currency.toUpperCase();
    }

    if ((isCreate || "name" in body) && (!result.name || result.name.length < 2)) {
      errors.push("Tên phần mềm phải có ít nhất 2 ký tự.");
    }
    if ((isCreate || "vendor" in body) && (!result.vendor || result.vendor.length < 2)) {
      errors.push("Tên hãng/nhà cung cấp phải có ít nhất 2 ký tự.");
    }

    if (body.category !== undefined) {
      if (!SOFTWARE_CATEGORIES.includes(body.category)) {
        errors.push("Danh mục phần mềm không hợp lệ.");
      } else {
        result.category = body.category;
      }
    }

    if (body.type !== undefined) {
      if (!LICENSE_TYPES.includes(body.type)) {
        errors.push("Loại bản quyền không hợp lệ.");
      } else {
        result.type = body.type;
      }
    }

    if (body.billingCycle !== undefined) {
      if (!BILLING_CYCLES.includes(body.billingCycle)) {
        errors.push("Chu kỳ thanh toán không hợp lệ.");
      } else {
        result.billingCycle = body.billingCycle;
      }
    }

    if (isCreate || "totalSeats" in body) {
      const seats = Number(body.totalSeats);
      if (!Number.isInteger(seats) || seats < 1) {
        errors.push("Tổng số bản quyền (Seats) phải là số nguyên dương >= 1.");
      } else {
        result.totalSeats = seats;
      }
    }

    if (body.costPerSeat !== undefined) {
      const cost = Number(body.costPerSeat);
      if (Number.isNaN(cost) || cost < 0) {
        errors.push("Chi phí mỗi bản quyền không hợp lệ.");
      } else {
        result.costPerSeat = cost;
      }
    }

    if (body.purchaseDate !== undefined) {
      if (!body.purchaseDate) {
        result.purchaseDate = new Date();
      } else {
        const d = new Date(body.purchaseDate);
        if (Number.isNaN(d.getTime())) errors.push("Ngày bắt đầu mua không hợp lệ.");
        else result.purchaseDate = d;
      }
    }

    if (body.expiryDate !== undefined) {
      if (!body.expiryDate) {
        result.expiryDate = null;
      } else {
        const d = new Date(body.expiryDate);
        if (Number.isNaN(d.getTime())) errors.push("Ngày hết hạn không hợp lệ.");
        else result.expiryDate = d;
      }
    }

    request.body = result;
    return reject(errors, next);
  };
}

export function validateAllocateLicense(request, _response, next) {
  const { userId } = request.body ?? {};
  const note = text(request.body?.note, 300);
  const errors = [];

  if (!mongoose.isObjectIdOrHexString(userId)) {
    errors.push("Vui lòng chọn nhân viên để cấp bản quyền.");
  }
  if (isInvalid(note)) {
    errors.push("Ghi chú tối đa 300 ký tự.");
  }

  request.body = { userId, note: isInvalid(note) ? null : note ?? null };
  return reject(errors, next);
}

export function validateRevokeLicense(request, _response, next) {
  const { userId } = request.body ?? {};
  if (!mongoose.isObjectIdOrHexString(userId)) {
    return next(new ApiError(400, "Vui lòng chọn nhân viên cần thu hồi bản quyền."));
  }
  request.body = { userId };
  return next();
}
