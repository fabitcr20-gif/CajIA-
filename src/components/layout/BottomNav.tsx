"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Plus, Wallet, Menu, X } from "lucide-react";
import { buildMobileMoreItems } from "@/lib/nav";
import { useCajiaStore } from "@/lib/store";
import { BUSINESS_PRESETS } from "@/lib/data/businessPresets";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const businessPresetId = useCajiaStore((s) => s.businessPresetId);
  const MOBILE_MORE_ITEMS = buildMobileMoreItems(BUSINESS_PRESETS[businessPresetId].productsLabel);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-navy-950/40" />
          <div
            className="absolute bottom-[64px] left-0 right-0 animate-fade-in rounded-t-2xl bg-white p-4 pb-[env(safe-area-inset-bottom)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-navy-900">Más opciones</p>
              <button onClick={() => setMoreOpen(false)} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium ${
                      isActive(item.href)
                        ? "border-accent-500 bg-accent-50 text-accent-700"
                        : "border-navy-100 text-navy-700 hover:bg-navy-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-navy-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <NavIcon href="/dashboard" label="Inicio" icon={LayoutDashboard} active={isActive("/dashboard")} />
        <NavIcon href="/ventas" label="Ventas" icon={Receipt} active={isActive("/ventas")} />

        <Link
          href="/pos"
          className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/30 ring-4 ring-white active:bg-accent-700"
          aria-label="Nueva venta"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </Link>

        <NavIcon href="/cierres" label="Cierres" icon={Wallet} active={isActive("/cierres")} />

        <button
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 px-3 text-[11px] font-medium ${
            moreOpen ? "text-accent-600" : "text-navy-400"
          }`}
        >
          <Menu className="h-5 w-5" />
          Más
        </button>
      </nav>
    </>
  );
}

function NavIcon({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 px-3 text-[11px] font-medium ${
        active ? "text-accent-600" : "text-navy-400"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}
