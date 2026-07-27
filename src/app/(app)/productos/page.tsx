"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/lib/selectors";
import { Product } from "@/lib/types";

const EMOJI_OPTIONS = ["☕", "🥐", "🍰", "🥤", "🍪", "🥪", "🧃", "🍫"];

export default function ProductosPage() {
  const products = useCajiaStore((s) => s.products);
  const sales = useCajiaStore((s) => s.sales);
  const addProduct = useCajiaStore((s) => s.addProduct);
  const updateProduct = useCajiaStore((s) => s.updateProduct);
  const deleteProduct = useCajiaStore((s) => s.deleteProduct);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [active, setActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const submittingRef = useRef(false);

  const salesByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const sale of sales) {
      for (const item of sale.items) {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity);
      }
    }
    return map;
  }, [sales]);

  function openAddModal() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setEmoji(EMOJI_OPTIONS[0]);
    setActive(true);
    setOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setEmoji(product.emoji);
    setActive(product.active);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    const parsedPrice = Number(price);
    if (!name.trim() || !parsedPrice || parsedPrice <= 0) return;
    submittingRef.current = true;
    if (editingId) {
      updateProduct(editingId, { name: name.trim(), price: parsedPrice, category: category.trim() || "General", emoji, active });
    } else {
      addProduct({ name: name.trim(), price: parsedPrice, category: category.trim() || "General", emoji });
    }
    setOpen(false);
    submittingRef.current = false;
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader
        title="Productos"
        actions={
          <Button onClick={openAddModal} className="gap-2">
            <Plus className="h-4 w-4" /> Agregar producto
          </Button>
        }
      />

      {/* Mobile: stacked list */}
      <Card className="divide-y divide-navy-50 overflow-hidden lg:hidden">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-2xl">{product.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-navy-900">{product.name}</p>
              <p className="text-xs text-navy-400">
                {product.category} · {salesByProduct.get(product.name) ?? 0} unidades vendidas
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[14px] font-semibold text-navy-900">{formatCurrency(product.price)}</span>
              <Badge tone={product.active ? "success" : "neutral"}>{product.active ? "Activo" : "Inactivo"}</Badge>
            </div>
            <div className="flex shrink-0 items-center gap-1 border-l border-navy-50 pl-2">
              <button
                onClick={() => openEditModal(product)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(product)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </Card>

      {/* Tablet/desktop: full table */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                <th className="px-4 py-3 font-medium sm:px-6">Producto</th>
                <th className="px-4 py-3 font-medium sm:px-6">Categoría</th>
                <th className="px-4 py-3 font-medium sm:px-6">Precio</th>
                <th className="px-4 py-3 font-medium sm:px-6">Ventas</th>
                <th className="px-4 py-3 font-medium sm:px-6">Estado</th>
                <th className="px-4 py-3 font-medium sm:px-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{product.emoji}</span>
                      <span className="font-medium text-navy-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy-500 sm:px-6">{product.category}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-navy-900 sm:px-6">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3 text-navy-500 sm:px-6">{salesByProduct.get(product.name) ?? 0} unidades</td>
                  <td className="px-4 py-3 sm:px-6">
                    <Badge tone={product.active ? "success" : "neutral"}>{product.active ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Editar producto" : "Agregar producto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Té chai"
              required
              className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Precio (₡)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2000"
              required
              className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Categoría</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej. Bebidas calientes"
              className="w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg ${
                    emoji === e ? "border-accent-500 bg-accent-50" : "border-navy-100 hover:bg-navy-50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          {editingId && (
            <label className="flex items-center gap-2.5 rounded-xl border border-navy-100 px-3.5 py-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
              />
              <span className="text-sm text-navy-700">Producto activo (visible en Nueva venta)</span>
            </label>
          )}
          <Button type="submit" fullWidth size="lg" className="mt-2">
            {editingId ? "Guardar cambios" : "Guardar producto"}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description={`¿Eliminar "${deleteTarget?.name}"? Las ventas ya registradas con este producto no se verán afectadas.`}
      />
    </div>
  );
}
