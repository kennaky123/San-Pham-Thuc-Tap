import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../constants/ticket.js";
import Category from "../models/Category.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export const DASHBOARD_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const PROCESSING_STATUSES = Object.freeze([
  "assigned",
  "in_progress",
  "waiting_user",
]);
export const COMPLETED_STATUSES = Object.freeze(["resolved", "closed"]);

const STATUS_DEFINITIONS = Object.freeze([
  { key: "pending", name: "Đang chờ" },
  { key: "assigned", name: "Đã phân công" },
  { key: "in_progress", name: "Đang xử lý" },
  { key: "waiting_user", name: "Chờ người dùng" },
  { key: "resolved", name: "Đã giải quyết" },
  { key: "closed", name: "Đã đóng" },
  { key: "cancelled", name: "Đã hủy" },
]);

const PRIORITY_LABELS = Object.freeze({
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
});

function roundToTwoDecimals(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getDateKeyInTimeZone(
  date,
  timeZone = DASHBOARD_TIME_ZONE,
) {
  const normalizedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(normalizedDate.getTime())) {
    throw new TypeError("Ngày tham chiếu dashboard không hợp lệ.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(normalizedDate);
  const partValues = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${partValues.year}-${partValues.month}-${partValues.day}`;
}

export function shiftCalendarDateKey(dateKey, amount) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match || !Number.isInteger(amount)) {
    throw new TypeError("Ngày hoặc số ngày dịch chuyển không hợp lệ.");
  }

  const shiftedDate = new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]) + amount,
    ),
  );

  return shiftedDate.toISOString().slice(0, 10);
}

export function buildLastNDaysSeries(
  rows,
  {
    now = new Date(),
    days = 7,
    timeZone = DASHBOARD_TIME_ZONE,
  } = {},
) {
  if (!Number.isInteger(days) || days < 1 || days > 366) {
    throw new RangeError("Số ngày thống kê phải từ 1 đến 366.");
  }

  const todayKey = getDateKeyInTimeZone(now, timeZone);
  const dateKeys = Array.from({ length: days }, (_item, index) =>
    shiftCalendarDateKey(todayKey, index - days + 1),
  );
  const allowedDateKeys = new Set(dateKeys);
  const countByDate = new Map();

  for (const row of rows ?? []) {
    const dateKey = row._id ?? row.date;
    const rawValue = row.value ?? row.count ?? 0;
    const value = Number(rawValue);

    if (
      allowedDateKeys.has(dateKey) &&
      Number.isFinite(value) &&
      value >= 0
    ) {
      countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + value);
    }
  }

  return dateKeys.map((dateKey) => {
    const dateParts = dateKey.split("-");
    const month = dateParts[1];
    const day = dateParts[2];

    return {
      date: dateKey,
      name: `${day}/${month}`,
      value: countByDate.get(dateKey) ?? 0,
    };
  });
}

export function fillEnumSeries(rows, definitions) {
  const countByKey = new Map();

  for (const row of rows ?? []) {
    const key = row._id ?? row.key;
    const value = Number(row.value ?? row.count ?? 0);

    if (typeof key === "string" && Number.isFinite(value) && value >= 0) {
      countByKey.set(key, (countByKey.get(key) ?? 0) + value);
    }
  }

  return definitions.map(({ key, name }) => ({
    key,
    name,
    value: countByKey.get(key) ?? 0,
  }));
}

export function formatAverageResolutionTime(
  averageMilliseconds,
  sampleSize,
) {
  const normalizedAverage = Number(averageMilliseconds);
  const normalizedSampleSize = Number(sampleSize);

  if (
    !Number.isFinite(normalizedAverage) ||
    normalizedAverage < 0 ||
    !Number.isInteger(normalizedSampleSize) ||
    normalizedSampleSize < 1
  ) {
    return {
      sampleSize: 0,
      milliseconds: null,
      minutes: null,
      hours: null,
    };
  }

  return {
    sampleSize: normalizedSampleSize,
    milliseconds: Math.round(normalizedAverage),
    minutes: roundToTwoDecimals(normalizedAverage / 60_000),
    hours: roundToTwoDecimals(normalizedAverage / 3_600_000),
  };
}

export function normalizeDashboardSummary(rawSummary, resolutionStats) {
  return {
    totalTickets: Number(rawSummary?.totalTickets ?? 0),
    pendingTickets: Number(rawSummary?.pendingTickets ?? 0),
    processingTickets: Number(rawSummary?.processingTickets ?? 0),
    completedTickets: Number(rawSummary?.completedTickets ?? 0),
    urgentTickets: Number(rawSummary?.urgentTickets ?? 0),
    averageResolutionTime: formatAverageResolutionTime(
      resolutionStats?.averageMilliseconds,
      Number(resolutionStats?.sampleSize ?? 0),
    ),
  };
}

function getVietnamDateRange(referenceDate) {
  const todayKey = getDateKeyInTimeZone(
    referenceDate,
    DASHBOARD_TIME_ZONE,
  );
  const startKey = shiftCalendarDateKey(todayKey, -6);
  const endExclusiveKey = shiftCalendarDateKey(todayKey, 1);

  return {
    startDate: new Date(`${startKey}T00:00:00+07:00`),
    endExclusiveDate: new Date(`${endExclusiveKey}T00:00:00+07:00`),
    from: startKey,
    to: todayKey,
  };
}

function getTicketSnapshot() {
  return Ticket.aggregate([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalTickets: { $sum: 1 },
              pendingTickets: {
                $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
              },
              processingTickets: {
                $sum: {
                  $cond: [
                    { $in: ["$status", PROCESSING_STATUSES] },
                    1,
                    0,
                  ],
                },
              },
              completedTickets: {
                $sum: {
                  $cond: [
                    { $in: ["$status", COMPLETED_STATUSES] },
                    1,
                    0,
                  ],
                },
              },
              urgentTickets: {
                $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] },
              },
            },
          },
          { $project: { _id: 0 } },
        ],
        byStatus: [
          { $group: { _id: "$status", value: { $sum: 1 } } },
        ],
        byCategory: [
          { $group: { _id: "$category", value: { $sum: 1 } } },
        ],
      },
    },
  ]);
}

function getTicketCreationTrend(range) {
  return Ticket.aggregate([
    {
      $match: {
        createdAt: {
          $gte: range.startDate,
          $lt: range.endExclusiveDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$createdAt",
            format: "%Y-%m-%d",
            timezone: DASHBOARD_TIME_ZONE,
          },
        },
        value: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

function getResolutionStatistics() {
  return Ticket.aggregate([
    {
      $match: {
        status: { $in: COMPLETED_STATUSES },
        resolvedAt: { $type: "date" },
      },
    },
    {
      $match: {
        $expr: { $gte: ["$resolvedAt", "$createdAt"] },
      },
    },
    {
      $group: {
        _id: null,
        sampleSize: { $sum: 1 },
        averageMilliseconds: {
          $avg: { $subtract: ["$resolvedAt", "$createdAt"] },
        },
      },
    },
    { $project: { _id: 0 } },
  ]);
}

function mergeCategoryStatistics(categories, categoryRows) {
  const countByCategory = new Map(
    (categoryRows ?? []).map((row) => [String(row._id), Number(row.value)]),
  );
  const knownCategoryIds = new Set(
    categories.map((category) => String(category._id)),
  );
  let unknownCount = 0;

  for (const row of categoryRows ?? []) {
    if (!row._id || !knownCategoryIds.has(String(row._id))) {
      unknownCount += Number(row.value ?? 0);
    }
  }

  const result = categories.map((category) => ({
    categoryId: category._id,
    key: category.slug,
    name: category.name,
    value: countByCategory.get(String(category._id)) ?? 0,
  }));

  if (unknownCount > 0) {
    result.push({
      categoryId: null,
      key: "unknown",
      name: "Không xác định",
      value: unknownCount,
    });
  }

  return result.sort(
    (left, right) =>
      right.value - left.value || left.name.localeCompare(right.name, "vi"),
  );
}

async function getTechnicianPerformance() {
  const [technicians, ticketStatistics] = await Promise.all([
    User.find({ role: "technician" })
      .select("fullName")
      .sort({ fullName: 1, _id: 1 })
      .lean(),
    Ticket.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTo",
          inProgress: {
            $sum: {
              $cond: [
                { $in: ["$status", PROCESSING_STATUSES] },
                1,
                0,
              ],
            },
          },
          completed: {
            $sum: {
              $cond: [
                { $in: ["$status", COMPLETED_STATUSES] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);
  const statisticsByTechnician = new Map(
    ticketStatistics.map((item) => [String(item._id), item]),
  );

  return technicians
    .map((technician) => {
      const statistics = statisticsByTechnician.get(String(technician._id));

      return {
        technicianId: technician._id,
        name: technician.fullName,
        inProgress: Number(statistics?.inProgress ?? 0),
        completed: Number(statistics?.completed ?? 0),
      };
    })
    .sort(
      (left, right) =>
        right.inProgress - left.inProgress ||
        right.completed - left.completed ||
        left.name.localeCompare(right.name, "vi"),
    );
}

async function getLatestTickets() {
  const tickets = await Ticket.find()
    .select(
      "ticketCode title status priority category createdBy assignedTo " +
        "createdAt lastActivityAt",
    )
    .populate({ path: "category", select: "name" })
    .populate({ path: "createdBy", select: "fullName" })
    .populate({ path: "assignedTo", select: "fullName" })
    .sort({ createdAt: -1, _id: -1 })
    .limit(5)
    .lean();

  return tickets.map((ticket) => ({
    id: ticket._id,
    ticketCode: ticket.ticketCode,
    title: ticket.title,
    status: ticket.status,
    statusLabel:
      STATUS_DEFINITIONS.find((item) => item.key === ticket.status)?.name ??
      ticket.status,
    priority: ticket.priority,
    priorityLabel: PRIORITY_LABELS[ticket.priority] ?? ticket.priority,
    createdAt: ticket.createdAt,
    lastActivityAt: ticket.lastActivityAt,
    category: ticket.category
      ? { id: ticket.category._id, name: ticket.category.name }
      : null,
    requester: ticket.createdBy
      ? { id: ticket.createdBy._id, fullName: ticket.createdBy.fullName }
      : null,
    assignedTo: ticket.assignedTo
      ? { id: ticket.assignedTo._id, fullName: ticket.assignedTo.fullName }
      : null,
  }));
}

export async function getAdminDashboard(referenceDate = new Date()) {
  const normalizedReferenceDate =
    referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate);

  if (Number.isNaN(normalizedReferenceDate.getTime())) {
    throw new TypeError("Ngày tham chiếu dashboard không hợp lệ.");
  }

  const range = getVietnamDateRange(normalizedReferenceDate);
  const [
    snapshotResult,
    creationTrend,
    resolutionResult,
    categories,
    technicianPerformance,
    latestTickets,
  ] = await Promise.all([
    getTicketSnapshot(),
    getTicketCreationTrend(range),
    getResolutionStatistics(),
    Category.find().select("name slug").sort({ name: 1, _id: 1 }).lean(),
    getTechnicianPerformance(),
    getLatestTickets(),
  ]);
  const snapshot = snapshotResult[0] ?? {};
  const rawSummary = snapshot.summary?.[0] ?? {};
  const resolutionStats = resolutionResult[0] ?? {};
  const ticketsByStatus = fillEnumSeries(
    snapshot.byStatus,
    STATUS_DEFINITIONS,
  );
  const ticketsCreatedLast7Days = buildLastNDaysSeries(
    creationTrend,
    {
      now: normalizedReferenceDate,
      days: 7,
      timeZone: DASHBOARD_TIME_ZONE,
    },
  );

  return {
    generatedAt: normalizedReferenceDate,
    timeZone: DASHBOARD_TIME_ZONE,
    trendPeriod: {
      days: 7,
      from: range.from,
      to: range.to,
    },
    definitions: {
      processingStatuses: [...PROCESSING_STATUSES],
      completedStatuses: [...COMPLETED_STATUSES],
      averageResolutionTimeBasis: "createdAt_to_resolvedAt",
    },
    summary: normalizeDashboardSummary(rawSummary, resolutionStats),
    charts: {
      ticketsByCategory: mergeCategoryStatistics(
        categories,
        snapshot.byCategory,
      ),
      ticketsByStatus,
      ticketsCreatedLast7Days,
      technicianPerformance,
    },
    latestTickets,
  };
}

export const DASHBOARD_STATUS_DEFINITIONS = STATUS_DEFINITIONS;
export const DASHBOARD_PRIORITY_KEYS = TICKET_PRIORITIES;
export const DASHBOARD_STATUS_KEYS = TICKET_STATUSES;
