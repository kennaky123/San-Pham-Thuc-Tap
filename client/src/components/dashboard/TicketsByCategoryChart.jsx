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

function truncateCategoryName(value) {
  return value.length > 16 ? `${value.slice(0, 15)}…` : value;
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="max-w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{item.name}</p>
      <p className="mt-1 text-slate-600">
        {formatDashboardNumber(item.value)} ticket
      </p>
    </div>
  );
}

function TicketsByCategoryChart({ data }) {
  const chartData = data.filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <ChartEmptyState message="Chưa có ticket thuộc danh mục nào trong hệ thống." />
    );
  }

  const chartHeight = Math.max(260, chartData.length * 44);

  return (
    <div className="min-w-0">
      <div
        className="max-h-[28rem] min-w-0 overflow-y-auto overflow-x-hidden pr-1"
        role="img"
        aria-label="Biểu đồ số ticket theo từng danh mục"
      >
        <div className="w-full min-w-0" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 2, right: 12, bottom: 2, left: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 11 }}
                tickFormatter={truncateCategoryName}
                width={108}
              />
              <Tooltip
                content={<CategoryTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar
                dataKey="value"
                name="Ticket"
                fill="#3b82f6"
                radius={[0, 6, 6, 0]}
                barSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="sr-only">
        {chartData.map((item) => (
          <li key={item.key}>
            {item.name}: {item.value} ticket
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TicketsByCategoryChart;
