import { Banknote, CreditCard, Smartphone, Landmark, MoreHorizontal, type LucideIcon } from "lucide-react";
import { PaymentMethod } from "@/lib/types";

// Single source of truth for payment methods: order, label, icon, and chart
// color. Every screen that lists/renders payment methods (POS, edit sale,
// Configuración, Cierres, Estadísticas, PDF) reads from here instead of
// keeping its own hardcoded list.
export const PAYMENT_METHODS: PaymentMethod[] = ["efectivo", "tarjeta", "sinpe", "transferencia", "otro"];

export const PAYMENT_METHOD_META: Record<PaymentMethod, { label: string; icon: LucideIcon; color: string }> = {
  efectivo: { label: "Efectivo", icon: Banknote, color: "#5b7099" },
  tarjeta: { label: "Tarjeta", icon: CreditCard, color: "#0d9488" },
  sinpe: { label: "SINPE Móvil", icon: Smartphone, color: "#f0a83a" },
  transferencia: { label: "Transferencia", icon: Landmark, color: "#7c3aed" },
  otro: { label: "Otro", icon: MoreHorizontal, color: "#6b7280" },
};
