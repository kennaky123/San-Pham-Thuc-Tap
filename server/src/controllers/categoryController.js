import Category from "../models/Category.js";

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
