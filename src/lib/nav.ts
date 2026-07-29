import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Wallet,
  BarChart3,
  Package,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// productsLabel adapts the "Productos" entry to the current business type
// (e.g. "Servicios" for a salón or taller de reparación).
export function buildNavItems(productsLabel: string): NavItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ventas", label: "Ventas", icon: Receipt },
    { href: "/pos", label: "Nueva venta", icon: PlusCircle },
    { href: "/cierres", label: "Cierres", icon: Wallet },
    { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/productos", label: productsLabel, icon: Package },
    { href: "/informes", label: "Informes", icon: FileText },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];
}

export function buildMobileMoreItems(productsLabel: string): NavItem[] {
  return [
    { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/productos", label: productsLabel, icon: Package },
    { href: "/informes", label: "Mis informes", icon: FileText },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];
}
