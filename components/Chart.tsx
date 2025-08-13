"use client";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface ChartData {
  name: string;
  sales: number;
  orders: number;
  change: string;
}

interface ChartProps {
  data?: ChartData[];
  height?: number;
}

const defaultData = [
  { name: "Week 1", sales: 8000, orders: 5, change: "+5.2%" },
  { name: "Week 2", sales: 9500, orders: 7, change: "+12.3%" },
  { name: "Week 3", sales: 11000, orders: 6, change: "+6.5%" },
  { name: "Week 4", sales: 13500, orders: 8, change: "+16.2%" },
];

export default function Chart({
  data = defaultData,
  height = 300,
}: ChartProps) {
  // Ensure data is valid before rendering
  const chartData =
    data && Array.isArray(data) && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.7} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6B7280", fontSize: 12 }}
          tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: number, name: string) => [
            name === "sales" ? `Rs. ${value.toLocaleString()}` : value,
            name === "sales" ? "Revenue" : "Orders",
          ]}
          labelStyle={{ color: "#374151", fontWeight: "600" }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#F97316"
          strokeWidth={3}
          fill="url(#salesGradient)"
          dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#F97316", strokeWidth: 2, fill: "white" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
