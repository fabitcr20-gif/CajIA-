import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Wallet,
  BarChart3,
  Package,
  FileText,
  Settings,
  ClipboardList,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavOptions {
  productsLabel: string; // adapts "Productos" to the current business type (e.g. "Servicios")
  deliveryEnabled: boolean; // shows/hides the Pedidos module
}

export function buildNavItems({ productsLabel, deliveryEnabled }: NavOptions): NavItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ventas", label: "Ventas", icon: Receipt },
    { href: "/pos", label: "Nueva venta", icon: PlusCircle },
    { href: "/cierres", label: "Cierres", icon: Wallet },
    ...(deliveryEnabled ? [{ href: "/pedidos", label: "Pedidos", icon: ClipboardList }] : []),
    { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/productos", label: productsLabel, icon: Package },
    { href: "/informes", label: "Informes", icon: FileText },
    { href: "/historial", label: "Historial", icon: History },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];
}

export function buildMobileMoreItems({ productsLabel, deliveryEnabled }: NavOptions): NavItem[] {
  return [
    ...(deliveryEnabled ? [{ href: "/pedidos", label: "Pedidos", icon: ClipboardList }] : []),
    { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
    { href: "/productos", label: productsLabel, icon: Package },
    { href: "/informes", label: "Mis informes", icon: FileText },
    { href: "/historial", label: "Historial", icon: History },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];
}
