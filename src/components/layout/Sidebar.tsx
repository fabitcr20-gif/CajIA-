"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { buildNavItems } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { useCajiaStore } from "@/lib/store";
import { BUSINESS_PRESETS } from "@/lib/data/businessPresets";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useCajiaStore((s) => s.settings);
  const businessPresetId = useCajiaStore((s) => s.businessPresetId);
  const logout = useCajiaStore((s) => s.logout);
  const NAV_ITEMS = buildNavItems({
    productsLabel: BUSINESS_PRESETS[businessPresetId].productsLabel,
    deliveryEnabled: settings.deliveryEnabled,
  });

  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-navy-800/60 md:bg-navy-900">
      <div className="px-6 py-6">
        <Logo light size="md" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                active
                  ? "bg-accent-600 text-white"
                  : "text-navy-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/20 text-sm font-semibold text-accent-400">
            {settings.businessName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{settings.businessName}</p>
            <p className="truncate text-xs text-navy-200/70">{settings.businessType}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-300 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
