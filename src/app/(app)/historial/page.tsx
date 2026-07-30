"use client";

import { useMemo } from "react";
import { Receipt, CheckCircle2, XCircle, RotateCcw, Banknote, RefreshCw, History } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { HistoryEventType } from "@/lib/types";

const EVENT_META: Record<HistoryEventType, { icon: typeof Receipt; color: string }> = {
  venta: { icon: Receipt, color: "bg-navy-50 text-navy-600" },
  pedido_entregado: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  pedido_cancelado: { icon: XCircle, color: "bg-red-50 text-red-500" },
  producto_devuelto: { icon: RotateCcw, color: "bg-amber-50 text-amber-600" },
  dinero_reembolsado: { icon: Banknote, color: "bg-amber-50 text-amber-600" },
  cambio_estado: { icon: RefreshCw, color: "bg-accent-50 text-accent-600" },
};

function formatEventTime(timestamp: string): string {
  const dt = new Date(timestamp);
  return dt.toLocaleString("es-CR", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function HistorialPage() {
  const historyEvents = useCajiaStore((s) => s.historyEvents);
  const sorted = useMemo(() => [...historyEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [historyEvents]);

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Historial" subtitle="Registro de ventas, pedidos y devoluciones" />

      {sorted.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400">
            <History className="h-6 w-6" />
          </span>
          <p className="text-sm text-navy-500">Aún no hay movimientos registrados.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-navy-50 overflow-hidden">
          {sorted.map((event) => {
            const meta = EVENT_META[event.type];
            const Icon = meta.icon;
            return (
              <div key={event.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-navy-900">{event.description}</p>
                  <p className="text-xs text-navy-400">{formatEventTime(event.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
