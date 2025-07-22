"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Week 1", sales: 8000 },
  { name: "Week 2", sales: 9500 },
  { name: "Week 3", sales: 11000 },
  { name: "Week 4", sales: 13500 },
];

export default function Chart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#F97316"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
