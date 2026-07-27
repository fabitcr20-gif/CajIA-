"use client";

import { useState } from "react";
import { Banknote, CreditCard, Minus, Plus, Smartphone, Trash2, CheckCircle2 } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/selectors";
import { PaymentMethod, SaleItem } from "@/lib/types";
import clsx from "clsx";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "sinpe", label: "SINPE", icon: Smartphone },
];

export default function PosPage() {
  const products = useCajiaStore((s) => s.products);
  const addSale = useCajiaStore((s) => s.addSale);

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [confirmation, setConfirmation] = useState<{ total: number } | null>(null);

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

  function registerSale() {
    if (cart.length === 0 || !method) return;
    addSale(cart, method);
    setConfirmation({ total });
    setCart([]);
    setMethod(null);
  }

  function startNewSale() {
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
                  {PAYMENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = method === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setMethod(opt.value)}
                        className={clsx(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
                          active
                            ? "border-accent-500 bg-accent-50 text-accent-700"
                            : "border-navy-100 text-navy-600 hover:bg-navy-50"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

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
