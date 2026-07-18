const numberFormatter = new Intl.NumberFormat("vi-VN");
const dateTimeFormatters = new Map();
const generatedTimeFormatters = new Map();

function getDateTimeFormatter(timeZone) {
  if (!dateTimeFormatters.has(timeZone)) {
    dateTimeFormatters.set(
      timeZone,
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone,
      }),
    );
  }

  return dateTimeFormatters.get(timeZone);
}

function getGeneratedTimeFormatter(timeZone) {
  if (!generatedTimeFormatters.has(timeZone)) {
    generatedTimeFormatters.set(
      timeZone,
      new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      }),
    );
  }

  return generatedTimeFormatters.get(timeZone);
}

export function formatDashboardNumber(value) {
  return Number.isFinite(value) ? numberFormatter.format(value) : "—";
}

export function formatDashboardDateTime(value, timeZone) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    return getDateTimeFormatter(timeZone).format(date);
  } catch {
    return "—";
  }
}

export function formatDashboardGeneratedAt(value, timeZone) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    return getGeneratedTimeFormatter(timeZone).format(date);
  } catch {
    return "—";
  }
}

export function getNameInitials(fullName = "") {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
