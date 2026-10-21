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
  pending: "#0091ff",
  assigned: "#6647f0",
  in_progress: "#7c3aed",
  waiting_user: "#f59e0b",
  resolved: "#00c07a",
  closed: "#646464",
  cancelled: "#ef4444",
};

function StatusTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-brand-bone bg-brand-ink px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">{item.name}</p>
      <p className="mt-1 font-mono text-brand-mint">
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
                  fill={STATUS_COLORS[item.key] ?? "#838383"}
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
            <span className="flex min-w-0 items-center gap-2 text-brand-slate">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: STATUS_COLORS[item.key] ?? "#838383",
                }}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-mono font-bold text-brand-ink">
              {formatDashboardNumber(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketsByStatusChart;
