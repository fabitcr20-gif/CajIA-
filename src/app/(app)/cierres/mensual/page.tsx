"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Sparkles,
  Download,
  Save,
  CloudUpload,
  CheckCircle2,
  Wallet,
  Receipt,
  Calculator,
} from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { WeeklySalesChart } from "@/components/charts/WeeklySalesChart";
import { formatCurrency, todayKey } from "@/lib/selectors";
import { buildMonthlyClosure } from "@/lib/services/closureService";
import { generateMonthlyClosurePDF } from "@/lib/services/pdfService";
import { simulateExportToDrive } from "@/lib/services/driveService";
import { MonthlyClosure, SavedReport } from "@/lib/types";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function monthOptionLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const name = MONTH_NAMES[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

export default function CierreMensualPage() {
  const sales = useCajiaStore((s) => s.sales);
  const settings = useCajiaStore((s) => s.settings);
  const saveReport = useCajiaStore((s) => s.saveReport);
  const today = todayKey();

  const availableMonths = Array.from(new Set(sales.map((s) => s.date.slice(0, 7))))
    .sort()
    .reverse();

  const [monthKey, setMonthKey] = useState(today.slice(0, 7));
  const [closure, setClosure] = useState<MonthlyClosure | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [driveStatus, setDriveStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleGenerate() {
    setGenerating(true);
    const result = await buildMonthlyClosure(sales, monthKey);
    setClosure(result);
    setGenerating(false);
    setSaved(false);
    setDriveStatus("idle");
  }

  function handleDownloadPdf() {
    if (!closure) return;
    generateMonthlyClosurePDF(closure, settings);
  }

  function handleSaveReport() {
    if (!closure) return;
    const report: SavedReport = {
      id: `report-mensual-${closure.month}-${Date.now()}`,
      type: "mensual",
      title: `Cierre mensual — ${closure.monthLabel}`,
      date: today,
      total: closure.totalSales,
      periodKey: closure.month,
    };
    saveReport(report);
    setSaved(true);
  }

  async function handleExportDrive() {
    setDriveStatus("loading");
    await simulateExportToDrive(`Cierre mensual — ${closure?.monthLabel}`);
    setDriveStatus("done");
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Cierre mensual" />

      <div className="mb-5 flex gap-2">
        <Link
          href="/cierres"
          className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-50"
        >
          Diario
        </Link>
        <span className="rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white">Mensual</span>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Seleccionar mes</CardTitle>
        </CardHeader>
        <CardBody>
          <select
            value={monthKey}
            onChange={(e) => {
              setMonthKey(e.target.value);
              setClosure(null);
            }}
            className="w-full max-w-xs rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-[15px] font-medium text-navy-900 sm:w-auto"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {monthOptionLabel(m)}
              </option>
            ))}
          </select>

          {!closure && (
            <Button size="lg" fullWidth className="mt-5 sm:w-auto" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Spinner className="h-4 w-4" /> Generando informe...
                </>
              ) : (
                "Generar informe PDF"
              )}
            </Button>
          )}
        </CardBody>
      </Card>

      {closure && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cierre mensual — {closure.monthLabel}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Ventas totales" value={formatCurrency(closure.totalSales)} icon={<Wallet className="h-4 w-4" />} accent="accent" />
                <StatCard label="Transacciones" value={String(closure.transactions)} icon={<Receipt className="h-4 w-4" />} accent="navy" />
                <StatCard label="Ticket promedio" value={formatCurrency(closure.averageTicket)} icon={<Calculator className="h-4 w-4" />} accent="sky" />
                <StatCard label="Efectivo" value={formatCurrency(closure.breakdown.efectivo)} icon={<Banknote className="h-4 w-4" />} accent="sky" />
                <StatCard label="Tarjeta" value={formatCurrency(closure.breakdown.tarjeta)} icon={<CreditCard className="h-4 w-4" />} accent="amber" />
                <StatCard label="SINPE" value={formatCurrency(closure.breakdown.sinpe)} icon={<Smartphone className="h-4 w-4" />} accent="accent" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventas por semana</CardTitle>
            </CardHeader>
            <CardBody>
              <WeeklySalesChart data={closure.weeklyTotals} />
            </CardBody>
          </Card>

          <Card className="border-accent-200 bg-gradient-to-br from-accent-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-accent-600" />
                Análisis IA del mes
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-navy-700">{closure.aiAnalysis}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informe del cierre</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
                  <Download className="h-4 w-4" /> Generar informe PDF
                </Button>
                <Button variant="outline" onClick={handleSaveReport} className="gap-2">
                  <Save className="h-4 w-4" /> Guardar en CajIA
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportDrive}
                  disabled={driveStatus === "loading"}
                  className="gap-2"
                >
                  {driveStatus === "loading" ? <Spinner className="h-4 w-4" /> : <CloudUpload className="h-4 w-4" />}
                  Exportar a Google Drive
                </Button>
              </div>

              {saved && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Informe guardado en{" "}
                    <Link href="/informes" className="font-semibold underline underline-offset-2">
                      Mis informes
                    </Link>
                    .
                  </p>
                </div>
              )}

              {driveStatus === "done" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Informe preparado para Google Drive ✓</p>
                    <p className="mt-0.5 text-accent-700">
                      En la versión completa, este informe se guardará directamente en tu carpeta de Google Drive.
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
