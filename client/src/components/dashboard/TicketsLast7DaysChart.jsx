import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDashboardNumber } from "../../utils/dashboardFormatters.js";
import ChartEmptyState from "./ChartEmptyState.jsx";

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">Ngày {label}</p>
      <p className="mt-1 text-slate-600">
        {formatDashboardNumber(payload[0].value)} ticket mới
      </p>
    </div>
  );
}

function TicketsLast7DaysChart({ data }) {
  const hasTickets = data.some((item) => item.value > 0);

  if (!hasTickets) {
    return (
      <ChartEmptyState message="Không có ticket mới trong 7 ngày gần nhất." />
    );
  }

  return (
    <div className="min-w-0">
      <div
        className="h-72 w-full min-w-0"
        role="img"
        aria-label="Biểu đồ số ticket được tạo trong 7 ngày gần nhất"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, bottom: 0, left: -12 }}
            accessibilityLayer
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval={0}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              width={36}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ fill: "#eff6ff" }}
            />
            <Bar
              dataKey="value"
              name="Ticket mới"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              maxBarSize={46}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.date}>
            Ngày {item.name}: {item.value} ticket mới
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketsLast7DaysChart;
