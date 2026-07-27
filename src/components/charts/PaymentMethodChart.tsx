"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PaymentBreakdown } from "@/lib/types";
import { formatCurrency } from "@/lib/selectors";

const COLORS: Record<string, string> = {
  Efectivo: "#5b7099",
  Tarjeta: "#0d9488",
  SINPE: "#f0a83a",
};

export function PaymentMethodChart({ breakdown }: { breakdown: PaymentBreakdown }) {
  const data = [
    { name: "Efectivo", value: breakdown.efectivo },
    { name: "Tarjeta", value: breakdown.tarjeta },
    { name: "SINPE", value: breakdown.sinpe },
  ];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="95%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={COLORS[d.name]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: "1px solid #dbe3f0", fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.name] }} />
              <span className="text-navy-600">{d.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy-900">{formatCurrency(d.value)}</span>
              <span className="w-9 text-right text-xs text-navy-400">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
