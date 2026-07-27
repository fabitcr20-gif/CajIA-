"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { CheckCircle2, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentMethod } from "@/lib/types";
import clsx from "clsx";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "sinpe", label: "SINPE", icon: Smartphone },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-navy-100 px-3.5 py-2.5 text-[15px] text-navy-900 focus:border-accent-400 focus:outline-none";

export default function ConfiguracionPage() {
  const settings = useCajiaStore((s) => s.settings);
  const updateSettings = useCajiaStore((s) => s.updateSettings);

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  function togglePaymentMethod(method: PaymentMethod) {
    setForm((prev) => {
      const has = prev.paymentMethods.includes(method);
      const next = has ? prev.paymentMethods.filter((m) => m !== method) : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: next };
    });
  }

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Configuración" subtitle="Datos generales de tu negocio" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Negocio</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Nombre del negocio">
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Tipo de negocio">
              <input
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Moneda">
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              >
                <option value="₡ CRC">₡ CRC — Colón costarricense</option>
                <option value="$ USD">$ USD — Dólar estadounidense</option>
              </select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.paymentMethods.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePaymentMethod(opt.value)}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-4 text-xs font-medium transition-colors",
                      active
                        ? "border-accent-500 bg-accent-50 text-accent-700"
                        : "border-navy-100 text-navy-400 hover:bg-navy-50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-navy-400">
              Selecciona los métodos de pago disponibles en tu punto de venta.
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos del negocio</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Cédula jurídica">
              <input
                value={form.legalId}
                onChange={(e) => setForm({ ...form, legalId: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button size="lg" onClick={handleSave}>
          Guardar cambios
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Cambios guardados
          </span>
        )}
      </div>
    </div>
  );
}
