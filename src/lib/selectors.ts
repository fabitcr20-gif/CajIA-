import { PaymentBreakdown, PaymentMethod, Sale } from "@/lib/types";
import { DEMO_TODAY } from "@/lib/data/demoSales";

export function todayKey(): string {
  return DEMO_TODAY;
}

export function addDaysToKey(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function dateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function shortDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

export function timeLabel(timestamp: string): string {
  const dt = new Date(timestamp);
  return dt.toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatCurrency(amount: number): string {
  return "₡" + Math.round(amount).toLocaleString("es-CR");
}

export function getSalesForDate(sales: Sale[], dateStr: string): Sale[] {
  return sales.filter((s) => s.date === dateStr);
}

export function getSalesInRange(sales: Sale[], startDate: string, endDate: string): Sale[] {
  return sales.filter((s) => s.date >= startDate && s.date <= endDate);
}

export function getSalesForMonth(sales: Sale[], monthKey: string): Sale[] {
  return sales.filter((s) => s.date.startsWith(monthKey));
}

export function sumTotal(sales: Sale[]): number {
  return sales.reduce((sum, s) => sum + s.total, 0);
}

export function breakdownByMethod(sales: Sale[]): PaymentBreakdown {
  const breakdown: PaymentBreakdown = { efectivo: 0, tarjeta: 0, sinpe: 0 };
  for (const s of sales) {
    breakdown[s.method] += s.total;
  }
  return breakdown;
}

export function averageTicket(sales: Sale[]): number {
  if (sales.length === 0) return 0;
  return sumTotal(sales) / sales.length;
}

export function mostUsedMethod(sales: Sale[]): PaymentMethod {
  const breakdown = breakdownByMethod(sales);
  const entries = Object.entries(breakdown) as [PaymentMethod, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function methodLabel(method: PaymentMethod): string {
  return { efectivo: "Efectivo", tarjeta: "Tarjeta", sinpe: "SINPE" }[method];
}

export interface TopProduct {
  name: string;
  emoji: string;
  quantity: number;
  total: number;
}

export function topProducts(sales: Sale[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const s of sales) {
    for (const i of s.items) {
      const existing = map.get(i.name);
      if (existing) {
        existing.quantity += i.quantity;
        existing.total += i.price * i.quantity;
      } else {
        map.set(i.name, {
          name: i.name,
          emoji: i.emoji,
          quantity: i.quantity,
          total: i.price * i.quantity,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

export function peakHourRange(sales: Sale[]): string {
  if (sales.length === 0) return "N/A";
  const counts = new Array(24).fill(0);
  for (const s of sales) {
    const hour = new Date(s.timestamp).getHours();
    counts[hour]++;
  }
  let maxHour = 0;
  let maxCount = -1;
  for (let h = 0; h < 24; h++) {
    const windowCount = counts[h] + (counts[h + 1] || 0) + (counts[h + 2] || 0);
    if (windowCount > maxCount) {
      maxCount = windowCount;
      maxHour = h;
    }
  }
  const format = (h: number) => {
    const period = h >= 12 ? "p.m." : "a.m.";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:00 ${period}`;
  };
  return `${format(maxHour)} y las ${format(maxHour + 3)}`;
}

export function getWeekSalesByDay(sales: Sale[], endDate: string): { label: string; date: string; total: number }[] {
  const days: { label: string; date: string; total: number }[] = [];
  const labels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  for (let i = 6; i >= 0; i--) {
    const date = addDaysToKey(endDate, -i);
    const daySales = getSalesForDate(sales, date);
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    days.push({ label: labels[dow], date, total: sumTotal(daySales) });
  }
  return days;
}

export function getDailySeries(sales: Sale[], startDate: string, endDate: string): { label: string; date: string; total: number }[] {
  const days: { label: string; date: string; total: number }[] = [];
  let cursor = startDate;
  let guard = 0;
  while (cursor <= endDate && guard < 366) {
    const daySales = getSalesForDate(sales, cursor);
    days.push({ label: shortDateLabel(cursor), date: cursor, total: sumTotal(daySales) });
    cursor = addDaysToKey(cursor, 1);
    guard++;
  }
  return days;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
