"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Wallet, Receipt, Calculator, CreditCard, Star, CalendarDays, RotateCcw, ClipboardList } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WeeklySalesChart } from "@/components/charts/WeeklySalesChart";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import { TopProductsChart } from "@/components/charts/TopProductsChart";
import { ORDER_STATUS_META, ORDER_STATUSES } from "@/lib/orders";
import {
  addDaysToKey,
  averageTicket,
  breakdownByMethod,
  dateLabel,
  formatCurrency,
  getDailySeries,
  getReturnsForSales,
  getSalesInRange,
  methodLabel,
  mostUsedMethod,
  sumReturns,
  sumTotal,
  todayKey,
  topProducts,
} from "@/lib/selectors";

type RangeKey = "hoy" | "7d" | "30d" | "mes";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "mes", label: "Este mes" },
];

export default function EstadisticasPage() {
  const sales = useCajiaStore((s) => s.sales);
  const returns = useCajiaStore((s) => s.returns);
  const settings = useCajiaStore((s) => s.settings);
  const today = todayKey();
  const [range, setRange] = useState<RangeKey>("30d");

  const { start, end } = useMemo(() => {
    switch (range) {
      case "hoy":
        return { start: today, end: today };
      case "7d":
        return { start: addDaysToKey(today, -6), end: today };
      case "30d":
        return { start: addDaysToKey(today, -29), end: today };
      case "mes":
        return { start: today.slice(0, 8) + "01", end: today };
    }
  }, [range, today]);

  const rangeSales = useMemo(() => getSalesInRange(sales, start, end), [sales, start, end]);
  const dailySeries = useMemo(() => getDailySeries(sales, start, end), [sales, start, end]);
  const breakdown = breakdownByMethod(rangeSales);
  const products = topProducts(rangeSales, 5);
  const method = mostUsedMethod(rangeSales);
  const topProduct = products[0];

  const bestDay = dailySeries.reduce(
    (best, d) => (d.total > best.total ? d : best),
    { label: "", date: today, total: -1 }
  );

  const rangeReturnsTotal = sumReturns(getReturnsForSales(returns, rangeSales));
  const statusCounts = ORDER_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = rangeSales.filter((sale) => sale.status === s).length;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Estadísticas" />

      <div className="mb-5 flex flex-wrap gap-2 sm:mb-7">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              range === r.key ? "bg-navy-800 text-white" : "bg-white text-navy-600 border border-navy-100 hover:bg-navy-50"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Ventas totales" value={formatCurrency(sumTotal(rangeSales))} icon={<Wallet className="h-4 w-4" />} accent="accent" />
        <StatCard label="Número de ventas" value={String(rangeSales.length)} icon={<Receipt className="h-4 w-4" />} accent="navy" />
        <StatCard label="Ticket promedio" value={formatCurrency(averageTicket(rangeSales))} icon={<Calculator className="h-4 w-4" />} accent="sky" />
        <StatCard label="Método más usado" value={methodLabel(method)} icon={<CreditCard className="h-4 w-4" />} accent="amber" className="col-span-2 lg:col-span-1" />
        <StatCard
          label="Producto más vendido"
          value={topProduct ? `${topProduct.emoji} ${topProduct.name}` : "—"}
          icon={<Star className="h-4 w-4" />}
          accent="accent"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard
          label="Día de mayor venta"
          value={bestDay.total >= 0 ? dateLabel(bestDay.date) : "—"}
          icon={<CalendarDays className="h-4 w-4" />}
          accent="navy"
          className="col-span-2 lg:col-span-1"
        />
        {returns.length > 0 && (
          <StatCard
            label="Total devoluciones"
            value={`-${formatCurrency(rangeReturnsTotal)}`}
            icon={<RotateCcw className="h-4 w-4" />}
            accent="amber"
            className="col-span-2 lg:col-span-1"
          />
        )}
      </div>

      {settings.deliveryEnabled && (
        <div className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-[18px] w-[18px] text-navy-500" />
                Pedidos por estado
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {ORDER_STATUSES.map((s) => (
                  <div key={s} className="rounded-xl border border-navy-100 p-3 text-center">
                    <p className="text-2xl font-semibold text-navy-900">{statusCounts[s] ?? 0}</p>
                    <p className="mt-1 text-xs font-medium text-navy-500">{ORDER_STATUS_META[s].label}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas por día</CardTitle>
          </CardHeader>
          <CardBody>
            <WeeklySalesChart data={dailySeries} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas por método de pago</CardTitle>
          </CardHeader>
          <CardBody>
            <PaymentMethodChart breakdown={breakdown} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 sm:mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardBody>
            {products.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-400">No hay datos para este período.</p>
            ) : (
              <TopProductsChart data={products} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
