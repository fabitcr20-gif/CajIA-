"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  addDaysToKey,
  formatCurrency,
  getSalesInRange,
  methodLabel,
  shortDateLabel,
  sumTotal,
  timeLabel,
  todayKey,
} from "@/lib/selectors";
import { PaymentMethod } from "@/lib/types";

type FilterKey = "hoy" | "ayer" | "semana" | "mes" | "personalizado";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "ayer", label: "Ayer" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "personalizado", label: "Personalizado" },
];

const METHOD_TONE: Record<PaymentMethod, "navy" | "accent" | "warning"> = {
  efectivo: "navy",
  tarjeta: "accent",
  sinpe: "warning",
};

export default function VentasPage() {
  const sales = useCajiaStore((s) => s.sales);
  const today = todayKey();
  const [filter, setFilter] = useState<FilterKey>("hoy");
  const [customStart, setCustomStart] = useState(addDaysToKey(today, -7));
  const [customEnd, setCustomEnd] = useState(today);

  const { start, end } = useMemo(() => {
    switch (filter) {
      case "hoy":
        return { start: today, end: today };
      case "ayer": {
        const y = addDaysToKey(today, -1);
        return { start: y, end: y };
      }
      case "semana":
        return { start: addDaysToKey(today, -6), end: today };
      case "mes":
        return { start: today.slice(0, 8) + "01", end: today };
      case "personalizado":
        return { start: customStart, end: customEnd };
    }
  }, [filter, today, customStart, customEnd]);

  const rangeSales = useMemo(
    () => getSalesInRange(sales, start, end).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [sales, start, end]
  );

  const showDate = filter !== "hoy" && filter !== "ayer";
  const total = sumTotal(rangeSales);

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Historial de ventas" />

      <div className="mb-4 flex flex-wrap gap-2 overflow-x-auto sm:mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.key ? "bg-navy-800 text-white" : "bg-white text-navy-600 border border-navy-100 hover:bg-navy-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "personalizado" && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 sm:mb-6">
          <label className="flex items-center gap-2 text-sm text-navy-600">
            Desde
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-600">
            Hasta
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy-900"
            />
          </label>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:max-w-md">
        <Card className="p-4">
          <p className="text-[13px] font-medium text-navy-500">Ventas del período</p>
          <p className="mt-1.5 text-xl font-semibold text-navy-900">{formatCurrency(total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-medium text-navy-500">Transacciones</p>
          <p className="mt-1.5 text-xl font-semibold text-navy-900">{rangeSales.length}</p>
        </Card>
      </div>

      {/* Mobile: stacked list (avoids squeezing 4-5 columns into a narrow table) */}
      <Card className="divide-y divide-navy-50 overflow-hidden sm:hidden">
        {rangeSales.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-navy-400">No hay ventas registradas en este período.</p>
        ) : (
          rangeSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-navy-900">{sale.label}</p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {showDate ? `${shortDateLabel(sale.date)} · ` : ""}
                  {timeLabel(sale.timestamp)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[14px] font-semibold text-navy-900">{formatCurrency(sale.total)}</span>
                <Badge tone={METHOD_TONE[sale.method]}>{methodLabel(sale.method)}</Badge>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Tablet/desktop: full table */}
      <Card className="hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                {showDate && <th className="px-4 py-3 font-medium sm:px-6">Fecha</th>}
                <th className="px-4 py-3 font-medium sm:px-6">Hora</th>
                <th className="px-4 py-3 font-medium sm:px-6">Venta</th>
                <th className="px-4 py-3 font-medium sm:px-6">Método</th>
                <th className="px-4 py-3 text-right font-medium sm:px-6">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rangeSales.length === 0 ? (
                <tr>
                  <td colSpan={showDate ? 5 : 4} className="px-4 py-10 text-center text-navy-400 sm:px-6">
                    No hay ventas registradas en este período.
                  </td>
                </tr>
              ) : (
                rangeSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-navy-50/50">
                    {showDate && (
                      <td className="whitespace-nowrap px-4 py-3 text-navy-500 sm:px-6">{shortDateLabel(sale.date)}</td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-navy-500 sm:px-6">{timeLabel(sale.timestamp)}</td>
                    <td className="px-4 py-3 font-medium text-navy-900 sm:px-6">{sale.label}</td>
                    <td className="px-4 py-3 sm:px-6">
                      <Badge tone={METHOD_TONE[sale.method]}>{methodLabel(sale.method)}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy-900 sm:px-6">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
