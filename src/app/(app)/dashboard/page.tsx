"use client";

import Link from "next/link";
import { Banknote, CreditCard, Smartphone, Receipt, Wallet, ArrowRight } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WeeklySalesChart } from "@/components/charts/WeeklySalesChart";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import {
  addDaysToKey,
  breakdownByMethod,
  formatCurrency,
  getSalesForDate,
  getWeekSalesByDay,
  methodLabel,
  percentChange,
  sumTotal,
  timeLabel,
  todayKey,
} from "@/lib/selectors";

const WEEKDAY_SHORT: Record<string, string> = {
  Domingo: "Dom",
  Lunes: "Lun",
  Martes: "Mar",
  Miércoles: "Mié",
  Jueves: "Jue",
  Viernes: "Vie",
  Sábado: "Sáb",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const sales = useCajiaStore((s) => s.sales);
  const settings = useCajiaStore((s) => s.settings);

  const today = todayKey();
  const yesterday = addDaysToKey(today, -1);
  const todaySales = getSalesForDate(sales, today);
  const yesterdaySales = getSalesForDate(sales, yesterday);

  const totalToday = sumTotal(todaySales);
  const totalYesterday = sumTotal(yesterdaySales);
  const change = percentChange(totalToday, totalYesterday);
  const breakdown = breakdownByMethod(todaySales);

  const weekData = getWeekSalesByDay(sales, today).map((d) => ({
    label: WEEKDAY_SHORT[d.label] ?? d.label,
    total: d.total,
  }));

  const recentActivity = [...todaySales]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  return (
    <div className="animate-fade-in pb-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
          {greeting()}, {settings.businessName} 👋
        </h1>
        <p className="mt-1 text-sm text-navy-500">Resumen de hoy</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Ventas de hoy"
          value={formatCurrency(totalToday)}
          icon={<Wallet className="h-4 w-4" />}
          accent="accent"
          trend={{ value: `${Math.abs(change).toFixed(1)}% respecto a ayer`, positive: change >= 0 }}
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Transacciones" value={String(todaySales.length)} icon={<Receipt className="h-4 w-4" />} accent="navy" />
        <StatCard label="Efectivo" value={formatCurrency(breakdown.efectivo)} icon={<Banknote className="h-4 w-4" />} accent="sky" />
        <StatCard label="Tarjeta" value={formatCurrency(breakdown.tarjeta)} icon={<CreditCard className="h-4 w-4" />} accent="amber" />
        <StatCard label="SINPE" value={formatCurrency(breakdown.sinpe)} icon={<Smartphone className="h-4 w-4" />} accent="accent" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas de la semana</CardTitle>
          </CardHeader>
          <CardBody>
            <WeeklySalesChart data={weekData} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
          </CardHeader>
          <CardBody>
            <PaymentMethodChart breakdown={breakdown} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardBody>
            {recentActivity.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-400">Aún no hay ventas registradas hoy.</p>
            ) : (
              <ul className="divide-y divide-navy-50">
                {recentActivity.map((sale) => (
                  <li key={sale.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-navy-900">{sale.label}</p>
                      <p className="text-xs text-navy-400">
                        {timeLabel(sale.timestamp)} · {methodLabel(sale.method)}
                      </p>
                    </div>
                    <span className="shrink-0 pl-3 text-[14px] font-semibold text-navy-900">
                      {formatCurrency(sale.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="flex flex-col justify-between bg-navy-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Tu caja está lista para cerrar</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-1 flex-col justify-between gap-4">
            <p className="text-sm text-navy-200">
              Has registrado {todaySales.length} ventas hoy.
            </p>
            <Link
              href="/cierres"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-accent-700"
            >
              Realizar cierre de caja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
