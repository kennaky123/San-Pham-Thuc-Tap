import { publishDataChanged } from "../services/realtimeService.js";
import * as assetService from "../services/assetService.js";

export async function listAssets(request, response, next) {
  try {
    const data = await assetService.listAssets(request.assetQuery, request.user);
    return response.status(200).json({
      success: true,
      message: "Lấy danh sách thiết bị thành công.",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAsset(request, response, next) {
  try {
    const asset = await assetService.getAsset(request.params.assetId, request.user);
    return response.status(200).json({
      success: true,
      message: "Lấy thông tin thiết bị thành công.",
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createAsset(request, response, next) {
  try {
    const asset = await assetService.createAsset(request.body, request.user);
    publishDataChanged("assets");
    return response.status(201).json({
      success: true,
      message: "Thêm thiết bị vào kho thành công.",
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateAsset(request, response, next) {
  try {
    const asset = await assetService.updateAsset(request.params.assetId, request.body, request.user);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: "Cập nhật thông tin thiết bị thành công.",
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAsset(request, response, next) {
  try {
    await assetService.deleteAsset(request.params.assetId);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: "Xóa thiết bị thành công.",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function assignAsset(request, response, next) {
  try {
    const asset = await assetService.assignAsset(request.params.assetId, request.body, request.user);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: `Cấp phát thiết bị ${asset.assetTag} thành công.`,
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function returnAsset(request, response, next) {
  try {
    const asset = await assetService.returnAsset(request.params.assetId, request.body, request.user);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: `Thu hồi thiết bị ${asset.assetTag} về kho thành công.`,
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAssignableEmployees(_request, response, next) {
  try {
    const employees = await assetService.listAssignableEmployees();
    return response.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên thành công.",
      data: { employees },
    });
  } catch (error) {
    return next(error);
  }
}

/* ------------------------ Asset Requests ------------------------ */

export async function listAssetRequests(request, response, next) {
  try {
    const requests = await assetService.listAssetRequests(request.assetRequestQuery, request.user);
    return response.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu cấp phát thành công.",
      data: { requests },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createAssetRequest(request, response, next) {
  try {
    const assetRequest = await assetService.createAssetRequest(request.body, request.user);
    publishDataChanged("assets");
    return response.status(201).json({
      success: true,
      message: "Gửi yêu cầu cấp phát thiết bị thành công.",
      data: { request: assetRequest },
    });
  } catch (error) {
    return next(error);
  }
}

export async function acceptAssetRequest(request, response, next) {
  try {
    const assetRequest = await assetService.acceptAssetRequest(request.params.requestId, request.user);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: "Đã tiếp nhận yêu cầu cấp phát.",
      data: { request: assetRequest },
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeAssetRequest(request, response, next) {
  try {
    const assetRequest = await assetService.completeAssetRequest(
      request.params.requestId,
      request.body,
      request.user,
    );
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: "Bàn giao thiết bị cho nhân viên thành công.",
      data: { request: assetRequest },
    });
  } catch (error) {
    return next(error);
  }
}

export async function cancelAssetRequest(request, response, next) {
  try {
    const assetRequest = await assetService.cancelAssetRequest(request.params.requestId, request.body);
    publishDataChanged("assets");
    return response.status(200).json({
      success: true,
      message: "Đã hủy yêu cầu cấp phát.",
      data: { request: assetRequest },
    });
  } catch (error) {
    return next(error);
  }
}

