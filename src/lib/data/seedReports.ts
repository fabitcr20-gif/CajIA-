import { Sale, SavedReport } from "@/lib/types";
import { addDaysToKey, dateLabel, getSalesForDate, getSalesForMonth, sumTotal } from "@/lib/selectors";
import { DEMO_TODAY } from "@/lib/data/demoSales";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const name = MONTH_NAMES[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

export function buildSeedReports(sales: Sale[]): SavedReport[] {
  const yesterday = addDaysToKey(DEMO_TODAY, -1);
  const dayBeforeYesterday = addDaysToKey(DEMO_TODAY, -2);
  const monthKey = DEMO_TODAY.slice(0, 7);

  const yesterdayTotal = sumTotal(getSalesForDate(sales, yesterday));
  const dayBeforeTotal = sumTotal(getSalesForDate(sales, dayBeforeYesterday));
  const monthTotal = sumTotal(getSalesForMonth(sales, monthKey));

  return [
    {
      id: `seed-mensual-${monthKey}`,
      type: "mensual",
      title: `Cierre mensual — ${monthLabel(monthKey)}`,
      date: DEMO_TODAY,
      total: monthTotal,
      periodKey: monthKey,
    },
    {
      id: `seed-diario-${yesterday}`,
      type: "diario",
      title: `Cierre diario — ${dateLabel(yesterday)}`,
      date: yesterday,
      total: yesterdayTotal,
      periodKey: yesterday,
    },
    {
      id: `seed-diario-${dayBeforeYesterday}`,
      type: "diario",
      title: `Cierre diario — ${dateLabel(dayBeforeYesterday)}`,
      date: dayBeforeYesterday,
      total: dayBeforeTotal,
      periodKey: dayBeforeYesterday,
    },
  ];
}
