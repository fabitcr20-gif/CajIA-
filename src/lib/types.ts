export type PaymentMethod = "efectivo" | "tarjeta" | "sinpe";

export interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
  active: boolean;
}

export interface SaleItem {
  productId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO date (yyyy-MM-dd)
  timestamp: string; // full ISO datetime
  items: SaleItem[];
  total: number;
  method: PaymentMethod;
  label: string; // human readable summary, e.g. "Café americano x2"
}

export interface PaymentBreakdown {
  efectivo: number;
  tarjeta: number;
  sinpe: number;
}

export interface DailyClosure {
  id: string;
  date: string; // yyyy-MM-dd
  totalSales: number;
  breakdown: PaymentBreakdown;
  transactions: number;
  averageTicket: number;
  topProducts: { name: string; emoji: string; quantity: number; total: number }[];
  peakHours: string;
  aiAnalysis: string;
  generatedAt: string;
}

export interface MonthlyClosure {
  id: string;
  month: string; // yyyy-MM
  monthLabel: string;
  totalSales: number;
  breakdown: PaymentBreakdown;
  transactions: number;
  averageTicket: number;
  weeklyTotals: { label: string; total: number }[];
  aiAnalysis: string;
  generatedAt: string;
}

export type ReportType = "diario" | "mensual";

export interface SavedReport {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  total: number;
  // date (yyyy-MM-dd) for "diario" reports, month (yyyy-MM) for "mensual" reports.
  periodKey: string;
}

export interface BusinessSettings {
  businessName: string;
  businessType: string;
  currency: string;
  legalId: string;
  phone: string;
  email: string;
  paymentMethods: PaymentMethod[];
}
