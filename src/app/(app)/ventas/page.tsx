"use client";

import { FormEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SaleEditModal } from "@/components/sales/SaleEditModal";
import {
  addDaysToKey,
  formatCurrency,
  getSalesInRange,
  methodLabel,
  shortDateLabel,
  sumTotal,
  timeLabel,
  todayKey,
} from "@/lib/selectors";
import { PAYMENT_STATUS_META } from "@/lib/orders";
import { PaymentMethod, ReturnType, Sale } from "@/lib/types";

type FilterKey = "hoy" | "ayer" | "semana" | "mes" | "personalizado";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "ayer", label: "Ayer" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "personalizado", label: "Personalizado" },
];

const METHOD_TONE: Record<PaymentMethod, "navy" | "accent" | "warning"> = {
  efectivo: "navy",
  tarjeta: "accent",
  sinpe: "warning",
  transferencia: "accent",
  otro: "navy",
};

const RETURN_TYPE_OPTIONS: { value: ReturnType; label: string }[] = [
  { value: "producto", label: "Devolución de producto" },
  { value: "dinero", label: "Devolución de dinero" },
  { value: "cambio", label: "Cambio de producto" },
];

function ReturnForm({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const addReturn = useCajiaStore((s) => s.addReturn);
  const [type, setType] = useState<ReturnType>("producto");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(String(sale.total));
  const [productId, setProductId] = useState("");
  const [notes, setNotes] = useState("");
  const today = todayKey();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!reason.trim() || !(parsedAmount > 0)) return;
    addReturn({
      saleId: sale.id,
      type,
      reason: reason.trim(),
      date: today,
      amount: parsedAmount,
      productId: productId || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Tipo</label>
        <div className="grid grid-cols-1 gap-1.5">
          {RETURN_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={clsx(
                "rounded-lg border px-3 py-2 text-left text-sm font-medium",
                type === opt.value ? "border-accent-500 bg-accent-50 text-accent-700" : "border-navy-100 text-navy-600 hover:bg-navy-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Motivo</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. Producto en mal estado"
          required
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Monto devuelto (₡)</label>
        <input
          type="number"
          min={0}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Producto afectado (opcional)</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        >
          <option value="">Toda la venta</option>
          {sale.items.map((item) => (
            <option key={item.productId} value={item.productId}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-700">Observaciones (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
        />
      </div>

      <Button type="submit" fullWidth size="lg" className="mt-2">
        Registrar devolución
      </Button>
    </form>
  );
}

export default function VentasPage() {
  const sales = useCajiaStore((s) => s.sales);
  const products = useCajiaStore((s) => s.products);
  const settings = useCajiaStore((s) => s.settings);
  const updateSale = useCajiaStore((s) => s.updateSale);
  const deleteSale = useCajiaStore((s) => s.deleteSale);
  const today = todayKey();
  const [filter, setFilter] = useState<FilterKey>("hoy");
  const [customStart, setCustomStart] = useState(addDaysToKey(today, -7));
  const [customEnd, setCustomEnd] = useState(today);
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [returnTarget, setReturnTarget] = useState<Sale | null>(null);

  const { start, end } = useMemo(() => {
    switch (filter) {
      case "hoy":
        return { start: today, end: today };
      case "ayer": {
        const y = addDaysToKey(today, -1);
        return { start: y, end: y };
      }
      case "semana":
        return { start: addDaysToKey(today, -6), end: today };
      case "mes":
        return { start: today.slice(0, 8) + "01", end: today };
      case "personalizado":
        return { start: customStart, end: customEnd };
    }
  }, [filter, today, customStart, customEnd]);

  const rangeSales = useMemo(
    () => getSalesInRange(sales, start, end).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [sales, start, end]
  );

  const showDate = filter !== "hoy" && filter !== "ayer";
  const total = sumTotal(rangeSales);

  function handleSaveEdit(items: Sale["items"], method: PaymentMethod) {
    if (!editTarget) return;
    updateSale(editTarget.id, items, method);
    setEditTarget(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteSale(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Historial de ventas" />

      <div className="mb-4 flex flex-wrap gap-2 overflow-x-auto sm:mb-6">
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

      {filter === "personalizado" && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 sm:mb-6">
          <label className="flex items-center gap-2 text-sm text-navy-600">
            Desde
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-600">
            Hasta
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy-900"
            />
          </label>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:max-w-md">
        <Card className="p-4">
          <p className="text-[13px] font-medium text-navy-500">Ventas del período</p>
          <p className="mt-1.5 text-xl font-semibold text-navy-900">{formatCurrency(total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-medium text-navy-500">Transacciones</p>
          <p className="mt-1.5 text-xl font-semibold text-navy-900">{rangeSales.length}</p>
        </Card>
      </div>

      {/* Mobile: stacked list (avoids squeezing 4-5 columns into a narrow table) */}
      <Card className="divide-y divide-navy-50 overflow-hidden lg:hidden">
        {rangeSales.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-navy-400">No hay ventas registradas en este período.</p>
        ) : (
          rangeSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-navy-900">{sale.label}</p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {showDate ? `${shortDateLabel(sale.date)} · ` : ""}
                  {timeLabel(sale.timestamp)}
                </p>
                {settings.deliveryEnabled && (
                  <Badge tone={PAYMENT_STATUS_META[sale.paymentStatus].tone} className="mt-1">
                    {PAYMENT_STATUS_META[sale.paymentStatus].label}
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[14px] font-semibold text-navy-900">{formatCurrency(sale.total)}</span>
                <Badge tone={METHOD_TONE[sale.method]}>{methodLabel(sale.method)}</Badge>
              </div>
              <div className="flex shrink-0 items-center gap-1 border-l border-navy-50 pl-2">
                <button
                  onClick={() => setEditTarget(sale)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setReturnTarget(sale)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                  aria-label="Registrar devolución"
                  title="Registrar devolución"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(sale)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Tablet/desktop: full table */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                {showDate && <th className="px-4 py-3 font-medium sm:px-6">Fecha</th>}
                <th className="px-4 py-3 font-medium sm:px-6">Hora</th>
                <th className="px-4 py-3 font-medium sm:px-6">Venta</th>
                <th className="px-4 py-3 font-medium sm:px-6">Método</th>
                {settings.deliveryEnabled && <th className="px-4 py-3 font-medium sm:px-6">Pago</th>}
                <th className="px-4 py-3 text-right font-medium sm:px-6">Total</th>
                <th className="px-4 py-3 font-medium sm:px-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rangeSales.length === 0 ? (
                <tr>
                  <td colSpan={showDate ? 7 : 6} className="px-4 py-10 text-center text-navy-400 sm:px-6">
                    No hay ventas registradas en este período.
                  </td>
                </tr>
              ) : (
                rangeSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-navy-50/50">
                    {showDate && (
                      <td className="whitespace-nowrap px-4 py-3 text-navy-500 sm:px-6">{shortDateLabel(sale.date)}</td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-navy-500 sm:px-6">{timeLabel(sale.timestamp)}</td>
                    <td className="px-4 py-3 font-medium text-navy-900 sm:px-6">{sale.label}</td>
                    <td className="px-4 py-3 sm:px-6">
                      <Badge tone={METHOD_TONE[sale.method]}>{methodLabel(sale.method)}</Badge>
                    </td>
                    {settings.deliveryEnabled && (
                      <td className="px-4 py-3 sm:px-6">
                        <Badge tone={PAYMENT_STATUS_META[sale.paymentStatus].tone}>
                          {PAYMENT_STATUS_META[sale.paymentStatus].label}
                        </Badge>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-navy-900 sm:px-6">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(sale)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setReturnTarget(sale)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                          aria-label="Registrar devolución"
                          title="Registrar devolución"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sale)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <SaleEditModal sale={editTarget} products={products} paymentMethods={settings.paymentMethods} onClose={() => setEditTarget(null)} onSave={handleSaveEdit} />

      <Modal open={!!returnTarget} onClose={() => setReturnTarget(null)} title="Registrar devolución">
        {returnTarget && <ReturnForm key={returnTarget.id} sale={returnTarget} onClose={() => setReturnTarget(null)} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar venta"
        description={`¿Eliminar la venta "${deleteTarget?.label}" por ${deleteTarget ? formatCurrency(deleteTarget.total) : ""}? Esta acción actualizará el dashboard, las estadísticas y el cierre de caja.`}
      />
    </div>
  );
}
