"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopProduct } from "@/lib/selectors";

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const chartData = data.map((p) => ({ name: `${p.emoji} ${p.name}`, cantidad: p.quantity }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#dbe3f0" strokeDasharray="3 5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#5b7099", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={140}
            tick={{ fill: "#172033", fontSize: 12.5 }}
          />
          <Tooltip
            cursor={{ fill: "#eef2f9" }}
            formatter={(value) => [`${value} unidades`, "Vendidos"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #dbe3f0", fontSize: 13 }}
          />
          <Bar dataKey="cantidad" fill="#0d9488" radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
