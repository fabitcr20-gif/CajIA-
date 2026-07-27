"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/selectors";

interface WeeklySalesChartProps {
  data: { label: string; total: number }[];
}

export function WeeklySalesChart({ data }: WeeklySalesChartProps) {
  const interval = data.length > 10 ? Math.ceil(data.length / 8) : 0;

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#dbe3f0" strokeDasharray="3 5" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={interval}
            tick={{ fill: "#5b7099", fontSize: 12 }}
            tickFormatter={(label: string) => label.replace(/^Semana\s+/, "S")}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#5b7099", fontSize: 11 }}
            tickFormatter={(v) => `₡${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "#eef2f9" }}
            formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #dbe3f0", fontSize: 13 }}
          />
          <Bar dataKey="total" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
