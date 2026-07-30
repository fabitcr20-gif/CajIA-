export type PaymentMethod = "efectivo" | "tarjeta" | "sinpe" | "transferencia" | "otro";

// A pedido's lifecycle. Walk-in / immediate sales are always "entregado" —
// this only becomes meaningful once a business turns on deliveryEnabled.
export type OrderStatus = "pendiente" | "preparando" | "en_ruta" | "entregado" | "cancelado" | "devuelto";

export type PaymentStatus = "pendiente" | "parcial" | "pagado";

export interface DeliveryInfo {
  courierName?: string;
  courierCompany?: string;
  ownRoute?: boolean;
  trackingNumber?: string;
  deliveryAt?: string; // ISO datetime
}

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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  discount?: number;
  delivery?: DeliveryInfo;
}

export type ReturnType = "producto" | "dinero" | "cambio";

export interface Return {
  id: string;
  saleId: string;
  type: ReturnType;
  reason: string;
  date: string; // yyyy-MM-dd
  amount: number;
  productId?: string;
  notes?: string;
}

export type HistoryEventType =
  | "venta"
  | "pedido_entregado"
  | "pedido_cancelado"
  | "producto_devuelto"
  | "dinero_reembolsado"
  | "cambio_estado";

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  timestamp: string;
  description: string;
  saleId?: string;
}

export interface PaymentBreakdown {
  efectivo: number;
  tarjeta: number;
  sinpe: number;
  transferencia: number;
  otro: number;
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
  returnsTotal: number;
  discountsTotal: number;
  netTotal: number;
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
  returnsTotal: number;
  discountsTotal: number;
  netTotal: number;
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
  deliveryEnabled: boolean;
}
