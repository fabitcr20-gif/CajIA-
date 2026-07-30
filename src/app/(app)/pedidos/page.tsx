"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Truck, Package } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, methodLabel, shortDateLabel, timeLabel } from "@/lib/selectors";
import { ORDER_STATUS_META, ORDER_STATUSES, PAYMENT_STATUS_META, PAYMENT_STATUSES } from "@/lib/orders";
import { OrderStatus, PaymentStatus, Sale } from "@/lib/types";

type FilterKey = "activos" | "todos" | OrderStatus;

const ACTIVE_STATUSES: OrderStatus[] = ["pendiente", "preparando", "en_ruta"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "activos", label: "Activos" },
  { key: "todos", label: "Todos" },
  ...ORDER_STATUSES.map((s) => ({ key: s as FilterKey, label: ORDER_STATUS_META[s].label })),
];

function DeliveryForm({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const updateSaleDelivery = useCajiaStore((s) => s.updateSaleDelivery);
  const [courierName, setCourierName] = useState(sale.delivery?.courierName ?? "");
  const [courierCompany, setCourierCompany] = useState(sale.delivery?.courierCompany ?? "");
  const [ownRoute, setOwnRoute] = useState(sale.delivery?.ownRoute ?? false);
  const [trackingNumber, setTrackingNumber] = useState(sale.delivery?.trackingNumber ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateSaleDelivery(sale.id, {
      courierName: courierName || undefined,
      courierCompany: courierCompany || undefined,
      ownRoute: ownRoute || undefined,
      trackingNumber: trackingNumber || undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Repartidor (opcional)</label>
        <input
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Empresa de mensajería (opcional)</label>
        <input
          value={courierCompany}
          onChange={(e) => setCourierCompany(e.target.value)}
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Número de guía (opcional)</label>
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2.5 rounded-xl border border-navy-100 px-3.5 py-3">
        <input
          type="checkbox"
          checked={ownRoute}
          onChange={(e) => setOwnRoute(e.target.checked)}
          className="h-4 w-4 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
        />
        <span className="text-sm text-navy-700">Entrega por ruta propia</span>
      </label>
      <Button type="submit" fullWidth size="lg" className="mt-2">
        Guardar
      </Button>
    </form>
  );
}

function deliverySummary(sale: Sale): string | null {
  const d = sale.delivery;
  if (!d) return null;
  const parts = [d.courierName, d.courierCompany, d.ownRoute ? "Ruta propia" : null, d.trackingNumber ? `Guía: ${d.trackingNumber}` : null].filter(
    Boolean
  );
  return parts.length ? parts.join(" · ") : null;
}

export default function PedidosPage() {
  const sales = useCajiaStore((s) => s.sales);
  const settings = useCajiaStore((s) => s.settings);
  const updateSaleStatus = useCajiaStore((s) => s.updateSaleStatus);
  const updatePaymentStatus = useCajiaStore((s) => s.updatePaymentStatus);
  const [filter, setFilter] = useState<FilterKey>("activos");
  const [deliveryTarget, setDeliveryTarget] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const sorted = [...sales].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (filter === "todos") return sorted;
    if (filter === "activos") return sorted.filter((s) => ACTIVE_STATUSES.includes(s.status));
    return sorted.filter((s) => s.status === filter);
  }, [sales, filter]);

  if (!settings.deliveryEnabled) {
    return (
      <div className="animate-fade-in pb-6">
        <PageHeader title="Pedidos" />
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400">
            <Truck className="h-6 w-6" />
          </span>
          <p className="max-w-sm text-sm text-navy-500">
            El módulo de Pedidos está pensado para negocios con entregas. Actívalo desde{" "}
            <Link href="/configuracion" className="font-semibold text-accent-600 underline underline-offset-2">
              Configuración
            </Link>{" "}
            para empezar a usarlo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Pedidos" subtitle="Gestiona el estado de tus pedidos y entregas" />

      <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.key ? "bg-navy-800 text-white" : "bg-white text-navy-600 border border-navy-100 hover:bg-navy-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredSales.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400">
            <Package className="h-6 w-6" />
          </span>
          <p className="text-sm text-navy-500">No hay pedidos en esta categoría.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <Card key={sale.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-navy-900">{sale.label}</p>
                    <Badge tone={ORDER_STATUS_META[sale.status].tone}>{ORDER_STATUS_META[sale.status].label}</Badge>
                    <Badge tone={PAYMENT_STATUS_META[sale.paymentStatus].tone}>{PAYMENT_STATUS_META[sale.paymentStatus].label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-navy-500">
                    {shortDateLabel(sale.date)} · {timeLabel(sale.timestamp)} · {methodLabel(sale.method)} ·{" "}
                    <span className="font-semibold text-navy-900">{formatCurrency(sale.total)}</span>
                  </p>
                  {deliverySummary(sale) && <p className="mt-1 text-xs text-navy-400">{deliverySummary(sale)}</p>}
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <div className="flex gap-2">
                    <select
                      value={sale.status}
                      onChange={(e) => updateSaleStatus(sale.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs font-medium text-navy-900 focus:border-accent-400 focus:outline-none"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sale.paymentStatus}
                      onChange={(e) => updatePaymentStatus(sale.id, e.target.value as PaymentStatus)}
                      className="rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs font-medium text-navy-900 focus:border-accent-400 focus:outline-none"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setDeliveryTarget(sale)}
                    className="flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-accent-600"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    {sale.delivery ? "Editar entrega" : "Agregar info de entrega"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deliveryTarget} onClose={() => setDeliveryTarget(null)} title="Información de entrega">
        {deliveryTarget && <DeliveryForm key={deliveryTarget.id} sale={deliveryTarget} onClose={() => setDeliveryTarget(null)} />}
      </Modal>
    </div>
  );
}
