import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPLETED_STATUSES,
  DASHBOARD_STATUS_DEFINITIONS,
  PROCESSING_STATUSES,
  buildLastNDaysSeries,
  fillEnumSeries,
  formatAverageResolutionTime,
  getDateKeyInTimeZone,
  normalizeDashboardSummary,
  shiftCalendarDateKey,
} from "../src/services/dashboardService.js";

test("getDateKeyInTimeZone xác định đúng ngày Việt Nam", () => {
  const date = new Date("2026-07-17T17:05:00.000Z");

  assert.equal(
    getDateKeyInTimeZone(date, "Asia/Ho_Chi_Minh"),
    "2026-07-18",
  );
});

test("shiftCalendarDateKey xử lý đúng năm nhuận và giao năm", () => {
  assert.equal(shiftCalendarDateKey("2024-02-28", 1), "2024-02-29");
  assert.equal(shiftCalendarDateKey("2026-01-01", -1), "2025-12-31");
});

test("buildLastNDaysSeries trả đủ 7 ngày và bổ sung giá trị 0", () => {
  const rows = Object.freeze([
    Object.freeze({ _id: "2026-07-12", value: 1 }),
    Object.freeze({ _id: "2026-07-15", value: 3 }),
    Object.freeze({ _id: "2026-07-18", value: 2 }),
  ]);

  const series = buildLastNDaysSeries(rows, {
    now: new Date("2026-07-17T17:05:00.000Z"),
    days: 7,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  assert.equal(series.length, 7);
  assert.equal(series[0].date, "2026-07-12");
  assert.equal(series[6].date, "2026-07-18");
  assert.deepEqual(
    series.map((item) => item.value),
    [1, 0, 0, 3, 0, 0, 2],
  );
  assert.equal(rows[0].value, 1);
});

test("buildLastNDaysSeries cộng các bucket trùng ngày", () => {
  const series = buildLastNDaysSeries(
    [
      { _id: "2026-07-18", value: 2 },
      { _id: "2026-07-18", value: 3 },
      { _id: "2026-07-01", value: 99 },
    ],
    {
      now: new Date("2026-07-18T05:00:00.000+07:00"),
      days: 7,
    },
  );

  assert.equal(series[6].value, 5);
});

test("fillEnumSeries trả đủ trạng thái theo đúng thứ tự", () => {
  const series = fillEnumSeries(
    [
      { _id: "resolved", value: 4 },
      { _id: "pending", value: 2 },
    ],
    DASHBOARD_STATUS_DEFINITIONS,
  );

  assert.deepEqual(
    series.map((item) => item.key),
    [
      "pending",
      "assigned",
      "in_progress",
      "waiting_user",
      "resolved",
      "closed",
      "cancelled",
    ],
  );
  assert.deepEqual(
    series.map((item) => item.value),
    [2, 0, 0, 0, 4, 0, 0],
  );
});

test("formatAverageResolutionTime trả giờ và sample rõ ràng", () => {
  assert.deepEqual(formatAverageResolutionTime(5_400_000, 3), {
    sampleSize: 3,
    milliseconds: 5_400_000,
    minutes: 90,
    hours: 1.5,
  });

  assert.deepEqual(formatAverageResolutionTime(null, 0), {
    sampleSize: 0,
    milliseconds: null,
    minutes: null,
    hours: null,
  });
});

test("normalizeDashboardSummary xử lý đúng database rỗng", () => {
  assert.deepEqual(normalizeDashboardSummary({}, {}), {
    totalTickets: 0,
    pendingTickets: 0,
    processingTickets: 0,
    completedTickets: 0,
    urgentTickets: 0,
    averageResolutionTime: {
      sampleSize: 0,
      milliseconds: null,
      minutes: null,
      hours: null,
    },
  });
});

test("dashboard định nghĩa đúng nhóm ticket xử lý và hoàn thành", () => {
  assert.deepEqual([...PROCESSING_STATUSES], [
    "assigned",
    "in_progress",
    "waiting_user",
  ]);
  assert.deepEqual([...COMPLETED_STATUSES], ["resolved", "closed"]);
});
