import { DailyClosure, MonthlyClosure, Sale } from "@/lib/types";
import {
  addDaysToKey,
  averageTicket,
  breakdownByMethod,
  mostUsedMethod,
  peakHourRange,
  percentChange,
  sumTotal,
  topProducts,
  getSalesForDate,
  getSalesForMonth,
} from "@/lib/selectors";
import { generateDailyAIAnalysis, generateMonthlyAIAnalysis } from "@/lib/services/aiService";
import { DEMO_TODAY } from "@/lib/data/demoSales";

export async function buildDailyClosure(sales: Sale[], date: string): Promise<DailyClosure> {
  const daySales = getSalesForDate(sales, date);
  const yesterdaySales = getSalesForDate(sales, addDaysToKey(date, -1));

  const totalSales = sumTotal(daySales);
  const breakdown = breakdownByMethod(daySales);
  const transactions = daySales.length;
  const topProds = topProducts(daySales, 5);
  const peakHours = peakHourRange(daySales);
  const method = mostUsedMethod(daySales);
  const percentVsYesterday = percentChange(totalSales, sumTotal(yesterdaySales));

  const aiAnalysis = await generateDailyAIAnalysis({
    totalSales,
    transactions,
    breakdown,
    mostUsedMethod: method,
    percentVsYesterday,
    peakHours,
    topProducts: topProds,
  });

  return {
    id: `closure-${date}`,
    date,
    totalSales,
    breakdown,
    transactions,
    averageTicket: averageTicket(daySales),
    topProducts: topProds,
    peakHours,
    aiAnalysis,
    generatedAt: new Date().toISOString(),
  };
}

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const name = MONTH_NAMES[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

function weeksInMonth(sales: Sale[], monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  let daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (monthKey === DEMO_TODAY.slice(0, 7)) {
    daysInMonth = Math.min(daysInMonth, Number(DEMO_TODAY.slice(8, 10)));
  }
  const weeks: { label: string; total: number }[] = [];
  let weekNum = 1;
  for (let start = 1; start <= daysInMonth; start += 7, weekNum++) {
    const end = Math.min(start + 6, daysInMonth);
    const startKey = `${monthKey}-${String(start).padStart(2, "0")}`;
    const endKey = `${monthKey}-${String(end).padStart(2, "0")}`;
    const weekSales = sales.filter((s) => s.date >= startKey && s.date <= endKey);
    weeks.push({ label: `Semana ${weekNum}`, total: sumTotal(weekSales) });
  }
  return weeks;
}

export async function buildMonthlyClosure(sales: Sale[], monthKey: string): Promise<MonthlyClosure> {
  const monthSales = getSalesForMonth(sales, monthKey);
  const totalSales = sumTotal(monthSales);
  const breakdown = breakdownByMethod(monthSales);
  const transactions = monthSales.length;
  const method = mostUsedMethod(monthSales);
  const weeklyTotals = weeksInMonth(sales, monthKey);
  const label = monthLabel(monthKey);

  const aiAnalysis = await generateMonthlyAIAnalysis({
    monthLabel: label,
    totalSales,
    transactions,
    breakdown,
    mostUsedMethod: method,
    weeklyTotals,
  });

  return {
    id: `monthly-${monthKey}`,
    month: monthKey,
    monthLabel: label,
    totalSales,
    breakdown,
    transactions,
    averageTicket: averageTicket(monthSales),
    weeklyTotals,
    aiAnalysis,
    generatedAt: new Date().toISOString(),
  };
}
