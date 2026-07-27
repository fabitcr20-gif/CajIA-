"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { CheckCircle2, Banknote, CreditCard, Smartphone, CloudUpload, Unplug } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { PaymentMethod } from "@/lib/types";
import {
  describeGoogleOAuthError,
  disconnectGoogleDrive,
  getDriveStatus,
  getGoogleConnectUrl,
} from "@/lib/services/driveService";
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

  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveMessage, setDriveMessage] = useState<string | null>(null);
  const driveActionRef = useRef(false);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    getDriveStatus().then((s) => setDriveConnected(s.connected));

    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("drive_error");
    const connectedFlag = params.get("drive_connected");
    if (errorCode || connectedFlag) {
      // One-time sync from the OAuth redirect URL (external browser API), not from React state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (connectedFlag) setDriveConnected(true);
      if (errorCode) setDriveMessage(describeGoogleOAuthError(errorCode));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleConnectDrive() {
    window.location.href = getGoogleConnectUrl("/configuracion");
  }

  async function handleDisconnectDrive() {
    if (driveActionRef.current) return;
    driveActionRef.current = true;
    setDriveBusy(true);
    setDriveMessage(null);
    try {
      const ok = await disconnectGoogleDrive();
      setDriveConnected(!ok ? driveConnected : false);
      if (!ok) setDriveMessage("No pudimos desconectar Google Drive. Intenta nuevamente.");
    } catch {
      setDriveMessage("No pudimos desconectar Google Drive. Intenta nuevamente.");
    } finally {
      setDriveBusy(false);
      driveActionRef.current = false;
    }
  }

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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Integraciones</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3 rounded-xl border border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <CloudUpload className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-medium text-navy-900">Google Drive</p>
                    {driveConnected === null ? (
                      <Badge tone="neutral">Verificando…</Badge>
                    ) : driveConnected ? (
                      <Badge tone="success">Conectado</Badge>
                    ) : (
                      <Badge tone="neutral">No conectado</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-navy-500">
                    Permite exportar tus cierres de caja directamente a tu Google Drive.
                  </p>
                </div>
              </div>

              {driveConnected ? (
                <Button variant="outline" size="sm" onClick={handleDisconnectDrive} disabled={driveBusy} className="gap-1.5">
                  {driveBusy ? <Spinner className="h-3.5 w-3.5" /> : <Unplug className="h-3.5 w-3.5" />}
                  Desconectar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleConnectDrive} disabled={driveConnected === null} className="gap-1.5">
                  <CloudUpload className="h-3.5 w-3.5" />
                  Conectar con Google
                </Button>
              )}
            </div>
            {driveMessage && <ErrorNotice message={driveMessage} />}
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
