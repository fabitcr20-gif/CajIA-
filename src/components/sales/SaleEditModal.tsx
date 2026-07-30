"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/selectors";
import { PAYMENT_METHODS, PAYMENT_METHOD_META } from "@/lib/payments";
import { PaymentMethod, Product, Sale, SaleItem } from "@/lib/types";

interface SaleEditModalProps {
  sale: Sale;
  products: Product[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onSave: (items: SaleItem[], method: PaymentMethod) => void;
}

function SaleEditForm({ sale, products, paymentMethods, onClose, onSave }: SaleEditModalProps) {
  const [items, setItems] = useState<SaleItem[]>(sale.items);
  const [method, setMethod] = useState<PaymentMethod>(sale.method);
  // Keep the sale's current method selectable even if it was later disabled
  // in Configuración, so editing an old sale never hides its own value.
  const availableMethods = PAYMENT_METHODS.filter((m) => paymentMethods.includes(m) || m === sale.method);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function addProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, emoji: product.emoji, price: product.price, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i)).filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleSave() {
    if (items.length === 0) return;
    onSave(items, method);
  }

  return (
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-0.5">
      <div>
        <p className="mb-2 text-[13px] font-medium text-navy-500">Agregar producto</p>
        <div className="grid grid-cols-2 gap-2">
          {products
            .filter((p) => p.active)
            .map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product.id)}
                className="flex flex-col items-center gap-1 rounded-xl border border-navy-100 bg-white px-2 py-3 text-center transition-colors hover:border-accent-300 hover:bg-accent-50"
              >
                <span className="text-xl">{product.emoji}</span>
                <span className="text-xs font-medium text-navy-900">{product.name}</span>
                <span className="text-xs text-navy-400">{formatCurrency(product.price)}</span>
              </button>
            ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-navy-500">Venta</p>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-navy-400">Agrega al menos un producto.</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-2.5">
                <span className="text-lg">{item.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy-900">{item.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeQuantity(item.productId, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-navy-50 text-navy-600 hover:bg-navy-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-navy-900">{item.quantity}</span>
                  <button
                    onClick={() => changeQuantity(item.productId, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-navy-50 text-navy-600 hover:bg-navy-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-semibold text-navy-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button onClick={() => removeItem(item.productId)} className="text-navy-300 hover:text-red-500" aria-label="Quitar">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-navy-100 pt-4">
        <span className="text-[15px] font-semibold text-navy-900">Total</span>
        <span className="text-lg font-semibold text-navy-900">{formatCurrency(total)}</span>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-navy-500">Método de pago</p>
        <div className="grid grid-cols-3 gap-2">
          {availableMethods.map((m) => {
            const Icon = PAYMENT_METHOD_META[m].icon;
            const isActive = method === m;
            return (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors",
                  isActive ? "border-accent-500 bg-accent-50 text-accent-700" : "border-navy-100 text-navy-600 hover:bg-navy-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {PAYMENT_METHOD_META[m].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={items.length === 0}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}

export function SaleEditModal({
  sale,
  products,
  paymentMethods,
  onClose,
  onSave,
}: {
  sale: Sale | null;
  products: Product[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onSave: (items: SaleItem[], method: PaymentMethod) => void;
}) {
  return (
    <Modal open={!!sale} onClose={onClose} title="Editar venta">
      {sale && <SaleEditForm key={sale.id} sale={sale} products={products} paymentMethods={paymentMethods} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}
