export const PRIORITY_OPTIONS = Object.freeze([
  {
    value: "low",
    label: "Thấp",
    description: "Không ảnh hưởng đến công việc hiện tại",
  },
  {
    value: "medium",
    label: "Trung bình",
    description: "Ảnh hưởng một phần đến công việc",
  },
  {
    value: "high",
    label: "Cao",
    description: "Công việc bị gián đoạn đáng kể",
  },
  {
    value: "urgent",
    label: "Khẩn cấp",
    description: "Hệ thống hoặc công việc quan trọng bị dừng",
  },
]);

const VALID_PRIORITIES = new Set(
  PRIORITY_OPTIONS.map((priority) => priority.value),
);

export function validateTicketField(name, value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (name === "title") {
    if (normalizedValue.length < 5) {
      return "Tiêu đề phải có ít nhất 5 ký tự.";
    }

    if (normalizedValue.length > 200) {
      return "Tiêu đề không được vượt quá 200 ký tự.";
    }
  }

  if (name === "category" && !normalizedValue) {
    return "Vui lòng chọn danh mục sự cố.";
  }

  if (name === "priority" && !VALID_PRIORITIES.has(normalizedValue)) {
    return "Vui lòng chọn mức độ ưu tiên hợp lệ.";
  }

  if (name === "description") {
    if (normalizedValue.length < 10) {
      return "Mô tả chi tiết phải có ít nhất 10 ký tự.";
    }

    if (normalizedValue.length > 5000) {
      return "Mô tả không được vượt quá 5000 ký tự.";
    }
  }

  return "";
}

export function validateTicketForm(values) {
  return ["title", "category", "priority", "description"].reduce(
    (errors, fieldName) => {
      const message = validateTicketField(fieldName, values[fieldName]);

      if (message) {
        errors[fieldName] = message;
      }

      return errors;
    },
    {},
  );
}

export function validateImageFile(file, maxFileSizeMb) {
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  if (!allowedMimeTypes.has(file.type)) {
    return `${file.name}: chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.`;
  }

  if (file.size === 0) {
    return `${file.name}: tệp ảnh đang trống.`;
  }

  if (file.size > maxFileSizeMb * 1024 * 1024) {
    return `${file.name}: dung lượng vượt quá ${maxFileSizeMb} MB.`;
  }

  return "";
}
