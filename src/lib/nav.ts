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

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ventas", label: "Ventas", icon: Receipt },
  { href: "/pos", label: "Nueva venta", icon: PlusCircle },
  { href: "/cierres", label: "Cierres", icon: Wallet },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/informes", label: "Informes", icon: FileText },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/informes", label: "Mis informes", icon: FileText },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
