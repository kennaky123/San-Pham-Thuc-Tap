import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatDashboardNumber } from "../../utils/dashboardFormatters.js";
import ChartEmptyState from "./ChartEmptyState.jsx";

const STATUS_COLORS = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  waiting_user: "#f97316",
  resolved: "#10b981",
  closed: "#64748b",
  cancelled: "#ef4444",
};

function StatusTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{item.name}</p>
      <p className="mt-1 text-slate-600">
        {formatDashboardNumber(item.value)} ticket
      </p>
    </div>
  );
}

function TicketsByStatusChart({ data }) {
  const chartData = data.filter((item) => item.value > 0);
  const totalTickets = data.reduce((total, item) => total + item.value, 0);

  if (totalTickets === 0) {
    return (
      <ChartEmptyState message="Chưa có ticket để phân bổ theo trạng thái." />
    );
  }

  return (
    <div className="min-w-0">
      <div
        className="h-64 w-full min-w-0"
        role="img"
        aria-label={`Biểu đồ phân bổ ${formatDashboardNumber(totalTickets)} ticket theo trạng thái`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart accessibilityLayer>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="54%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {chartData.map((item) => (
                <Cell
                  key={item.key}
                  fill={STATUS_COLORS[item.key] ?? "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip content={<StatusTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {data.map((item) => (
          <li
            key={item.key}
            className="flex min-w-0 items-center justify-between gap-3 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.key] ?? "#94a3b8" }}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-semibold text-slate-800">
              {formatDashboardNumber(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketsByStatusChart;
