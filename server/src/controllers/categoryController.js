import Category from "../models/Category.js";
import Ticket from "../models/Ticket.js";
import ApiError from "../utils/ApiError.js";

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function getUniqueSlug(name, excludedId = null) {
  const baseSlug = createSlug(name) || "danh-muc";
  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const filter = { slug, ...(excludedId && { _id: { $ne: excludedId } }) };
    if (!(await Category.exists(filter))) return slug;
  }
  throw new ApiError(409, "Không thể tạo slug duy nhất cho danh mục.");
}

export async function listActiveCategories(_request, response, next) {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug description")
      .sort({ name: 1, _id: 1 })
      .lean();

    return response.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công.",
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminCategories(_request, response, next) {
  try {
    const [categories, ticketCounts] = await Promise.all([
      Category.find().sort({ name: 1, _id: 1 }).lean(),
      Ticket.aggregate([{ $group: { _id: "$category", ticketCount: { $sum: 1 } } }]),
    ]);
    const countByCategory = new Map(ticketCounts.map((row) => [String(row._id), row.ticketCount]));
    return response.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục quản trị thành công.",
      data: { categories: categories.map((category) => ({ ...category, ticketCount: countByCategory.get(String(category._id)) ?? 0 })) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(request, response, next) {
  try {
    const duplicate = await Category.exists({ name: new RegExp(`^${request.body.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    if (duplicate) throw new ApiError(409, "Tên danh mục đã tồn tại.");

    const category = await Category.create({
      name: request.body.name,
      slug: await getUniqueSlug(request.body.name),
      description: request.body.description,
      isActive: request.body.isActive,
      createdBy: request.user._id,
      updatedBy: request.user._id,
    });
    return response.status(201).json({
      success: true,
      message: "Thêm danh mục thành công.",
      data: { category: { ...category.toObject(), ticketCount: 0 } },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(request, response, next) {
  try {
    const category = await Category.findById(request.params.categoryId);
    if (!category) throw new ApiError(404, "Không tìm thấy danh mục.");

    const duplicate = await Category.exists({
      _id: { $ne: category._id },
      name: new RegExp(`^${request.body.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (duplicate) throw new ApiError(409, "Tên danh mục đã tồn tại.");

    const nameChanged = category.name !== request.body.name;
    category.name = request.body.name;
    category.description = request.body.description;
    category.isActive = request.body.isActive;
    category.updatedBy = request.user._id;
    if (nameChanged) category.slug = await getUniqueSlug(request.body.name, category._id);
    await category.save();
    const ticketCount = await Ticket.countDocuments({ category: category._id });

    return response.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công.",
      data: { category: { ...category.toObject(), ticketCount } },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(request, response, next) {
  try {
    const category = await Category.findById(request.params.categoryId);
    if (!category) throw new ApiError(404, "Không tìm thấy danh mục.");
    if (await Ticket.exists({ category: category._id })) {
      throw new ApiError(409, "Không thể xóa danh mục đã có ticket. Hãy tạm ẩn danh mục.");
    }
    await Category.deleteOne({ _id: category._id });
    return response.status(200).json({
      success: true,
      message: "Xóa danh mục thành công.",
      data: { categoryId: String(category._id) },
    });
  } catch (error) {
    return next(error);
  }
}
