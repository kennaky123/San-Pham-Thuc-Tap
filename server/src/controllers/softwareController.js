import { publishDataChanged } from "../services/realtimeService.js";
import * as softwareService from "../services/softwareService.js";

export async function listSoftwareLicenses(request, response, next) {
  try {
    const data = await softwareService.listSoftwareLicenses(
      request.softwareQuery,
      request.user,
    );
    return response.status(200).json({
      success: true,
      message: "Lấy danh sách bản quyền phần mềm thành công.",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSoftwareLicense(request, response, next) {
  try {
    const license = await softwareService.getSoftwareLicense(request.params.licenseId);
    return response.status(200).json({
      success: true,
      message: "Lấy thông tin bản quyền thành công.",
      data: { license },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createSoftwareLicense(request, response, next) {
  try {
    const license = await softwareService.createSoftwareLicense(
      request.body,
      request.user,
    );
    publishDataChanged("software");
    return response.status(201).json({
      success: true,
      message: "Thêm bản quyền phần mềm thành công.",
      data: { license },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSoftwareLicense(request, response, next) {
  try {
    const license = await softwareService.updateSoftwareLicense(
      request.params.licenseId,
      request.body,
      request.user,
    );
    publishDataChanged("software");
    return response.status(200).json({
      success: true,
      message: "Cập nhật thông tin bản quyền thành công.",
      data: { license },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSoftwareLicense(request, response, next) {
  try {
    await softwareService.deleteSoftwareLicense(request.params.licenseId);
    publishDataChanged("software");
    return response.status(200).json({
      success: true,
      message: "Xóa bản quyền phần mềm thành công.",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

export async function allocateLicense(request, response, next) {
  try {
    const license = await softwareService.allocateLicense(
      request.params.licenseId,
      request.body,
      request.user,
    );
    publishDataChanged("software");
    return response.status(200).json({
      success: true,
      message: `Cấp phát bản quyền ${license.name} cho nhân viên thành công.`,
      data: { license },
    });
  } catch (error) {
    return next(error);
  }
}

export async function revokeLicense(request, response, next) {
  try {
    const license = await softwareService.revokeLicense(
      request.params.licenseId,
      request.body,
      request.user,
    );
    publishDataChanged("software");
    return response.status(200).json({
      success: true,
      message: `Thu hồi bản quyền ${license.name} thành công.`,
      data: { license },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFinOpsSummary(_request, response, next) {
  try {
    const finOps = await softwareService.getFinOpsSummary();
    return response.status(200).json({
      success: true,
      message: "Lấy báo cáo FinOps & chi phí CNTT thành công.",
      data: { finOps },
    });
  } catch (error) {
    return next(error);
  }
}

