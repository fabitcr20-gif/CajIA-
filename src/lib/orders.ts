import { OrderStatus, PaymentStatus } from "@/lib/types";

type BadgeTone = "navy" | "accent" | "success" | "warning" | "neutral";

export const ORDER_STATUSES: OrderStatus[] = ["pendiente", "preparando", "en_ruta", "entregado", "cancelado", "devuelto"];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  pendiente: { label: "Pendiente", tone: "warning" },
  preparando: { label: "Preparando", tone: "warning" },
  en_ruta: { label: "En ruta", tone: "accent" },
  entregado: { label: "Entregado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "neutral" },
  devuelto: { label: "Devuelto", tone: "neutral" },
};

export const PAYMENT_STATUSES: PaymentStatus[] = ["pendiente", "parcial", "pagado"];

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  pendiente: { label: "Pago pendiente", tone: "warning" },
  parcial: { label: "Pago parcial", tone: "warning" },
  pagado: { label: "Pagado", tone: "success" },
};
