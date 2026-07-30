"use client";

import { useRef, useState } from "react";
import { Minus, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/selectors";
import { PAYMENT_METHODS, PAYMENT_METHOD_META } from "@/lib/payments";
import { ORDER_STATUS_META, PAYMENT_STATUSES, PAYMENT_STATUS_META } from "@/lib/orders";
import { DeliveryInfo, OrderStatus, PaymentMethod, PaymentStatus, SaleItem } from "@/lib/types";
import clsx from "clsx";

// A new sale can only start in one of these — you wouldn't create it
// already cancelled or returned.
const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  ["pendiente", "preparando", "en_ruta", "entregado"] as OrderStatus[]
).map((value) => ({ value, label: ORDER_STATUS_META[value].label }));

const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUSES.map((value) => ({ value, label: PAYMENT_STATUS_META[value].label }));

export default function PosPage() {
  const products = useCajiaStore((s) => s.products);
  const settings = useCajiaStore((s) => s.settings);
  const addSale = useCajiaStore((s) => s.addSale);
  const deliveryEnabled = settings.deliveryEnabled;
  const paymentOptions = PAYMENT_METHODS.filter((m) => settings.paymentMethods.includes(m));

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [confirmation, setConfirmation] = useState<{ total: number } | null>(null);
  const submittingRef = useRef(false);

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pendiente");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pendiente");
  const [courierName, setCourierName] = useState("");
  const [courierCompany, setCourierCompany] = useState("");
  const [ownRoute, setOwnRoute] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [discount, setDiscount] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function addProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, emoji: product.emoji, price: product.price, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function resetOrderDetails() {
    setShowOrderDetails(false);
    setOrderStatus("pendiente");
    setPaymentStatus("pendiente");
    setCourierName("");
    setCourierCompany("");
    setOwnRoute(false);
    setTrackingNumber("");
    setDiscount("");
  }

  function registerSale() {
    if (cart.length === 0 || !method || submittingRef.current) return;
    submittingRef.current = true;

    if (!deliveryEnabled) {
      addSale(cart, method);
    } else {
      const delivery: DeliveryInfo | undefined =
        courierName || courierCompany || ownRoute || trackingNumber
          ? {
              courierName: courierName || undefined,
              courierCompany: courierCompany || undefined,
              ownRoute: ownRoute || undefined,
              trackingNumber: trackingNumber || undefined,
            }
          : undefined;
      const parsedDiscount = Number(discount);
      addSale(cart, method, {
        status: orderStatus,
        paymentStatus,
        delivery,
        discount: parsedDiscount > 0 ? parsedDiscount : undefined,
      });
    }

    setConfirmation({ total });
    setCart([]);
    setMethod(null);
    resetOrderDetails();
  }

  function startNewSale() {
    submittingRef.current = false;
    setConfirmation(null);
  }

  if (confirmation) {
    return (
      <div className="flex min-h-[70vh] animate-fade-in flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-100 text-accent-600">
          <CheckCircle2 className="h-11 w-11" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-navy-900">Venta registrada ✓</h1>
        <p className="mt-2 max-w-xs text-[15px] text-navy-500">
          Venta de {formatCurrency(confirmation.total)} registrada correctamente.
        </p>
        <Button size="lg" className="mt-8" onClick={startNewSale}>
          Nueva venta
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <PageHeader title="Nueva venta" subtitle="Selecciona productos para armar la venta" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {products.filter((p) => p.active).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product.id)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-navy-100 bg-white px-3 py-5 text-center transition-colors hover:border-accent-300 hover:bg-accent-50 active:bg-accent-100"
                  >
                    <span className="text-3xl">{product.emoji}</span>
                    <span className="text-[14px] font-medium text-navy-900">{product.name}</span>
                    <span className="text-sm text-navy-500">{formatCurrency(product.price)}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Venta actual</CardTitle>
            </CardHeader>
            <CardBody>
              {cart.length === 0 ? (
                <p className="py-8 text-center text-sm text-navy-400">Agrega productos para comenzar la venta.</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-navy-900">{item.name}</p>
                        <p className="text-xs text-navy-400">{formatCurrency(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => changeQuantity(item.productId, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-medium text-navy-900">{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.productId, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-50 text-navy-600 hover:bg-navy-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="w-16 shrink-0 text-right text-[14px] font-semibold text-navy-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-navy-300 hover:text-red-500"
                        aria-label="Quitar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
                <span className="text-[15px] font-semibold text-navy-900">Total</span>
                <span className="text-xl font-semibold text-navy-900">{formatCurrency(total)}</span>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[13px] font-medium text-navy-500">Método de pago</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map((m) => {
                    const Icon = PAYMENT_METHOD_META[m].icon;
                    const active = method === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={clsx(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
                          active
                            ? "border-accent-500 bg-accent-50 text-accent-700"
                            : "border-navy-100 text-navy-600 hover:bg-navy-50"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {PAYMENT_METHOD_META[m].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {deliveryEnabled && (
                <div className="mt-5 rounded-xl border border-navy-100">
                  <button
                    type="button"
                    onClick={() => setShowOrderDetails((v) => !v)}
                    className="flex w-full items-center justify-between px-3.5 py-3 text-[13px] font-medium text-navy-600"
                  >
                    Detalles del pedido y entrega (opcional)
                    {showOrderDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showOrderDetails && (
                    <div className="space-y-4 border-t border-navy-100 px-3.5 py-4">
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-navy-500">Estado del pedido</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setOrderStatus(opt.value)}
                              className={clsx(
                                "rounded-lg border px-2 py-1.5 text-xs font-medium",
                                orderStatus === opt.value
                                  ? "border-accent-500 bg-accent-50 text-accent-700"
                                  : "border-navy-100 text-navy-600 hover:bg-navy-50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-medium text-navy-500">Estado de pago</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {PAYMENT_STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPaymentStatus(opt.value)}
                              className={clsx(
                                "rounded-lg border px-2 py-1.5 text-xs font-medium",
                                paymentStatus === opt.value
                                  ? "border-accent-500 bg-accent-50 text-accent-700"
                                  : "border-navy-100 text-navy-600 hover:bg-navy-50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          placeholder="Repartidor (opcional)"
                          className="rounded-lg border border-navy-100 px-2.5 py-2 text-xs text-navy-900 focus:border-accent-400 focus:outline-none"
                        />
                        <input
                          value={courierCompany}
                          onChange={(e) => setCourierCompany(e.target.value)}
                          placeholder="Empresa de mensajería (opcional)"
                          className="rounded-lg border border-navy-100 px-2.5 py-2 text-xs text-navy-900 focus:border-accent-400 focus:outline-none"
                        />
                      </div>
                      <input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Número de guía (opcional)"
                        className="w-full rounded-lg border border-navy-100 px-2.5 py-2 text-xs text-navy-900 focus:border-accent-400 focus:outline-none"
                      />
                      <label className="flex items-center gap-2 text-xs text-navy-600">
                        <input
                          type="checkbox"
                          checked={ownRoute}
                          onChange={(e) => setOwnRoute(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
                        />
                        Entrega por ruta propia
                      </label>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-navy-500">Descuento (opcional)</p>
                        <input
                          type="number"
                          min={0}
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-navy-100 px-2.5 py-2 text-xs text-navy-900 focus:border-accent-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                size="lg"
                fullWidth
                className="mt-5"
                disabled={cart.length === 0 || !method}
                onClick={registerSale}
              >
                Registrar venta {cart.length > 0 && `· ${formatCurrency(total)}`}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
