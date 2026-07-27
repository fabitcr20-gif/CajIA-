"use client";

import { useEffect, useRef, useState } from "react";
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
  ExternalLink,
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
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import {
  breakdownByMethod,
  dateLabel,
  formatCurrency,
  getSalesForDate,
  sumTotal,
  todayKey,
} from "@/lib/selectors";
import { buildDailyClosure } from "@/lib/services/closureService";
import { dailyClosurePdfBlob, dailyClosurePdfFileName, generateDailyClosurePDF } from "@/lib/services/pdfService";
import { describeGoogleOAuthError, exportPdfToDrive, getDriveStatus, getGoogleConnectUrl } from "@/lib/services/driveService";
import { DailyClosure, SavedReport } from "@/lib/types";

export default function CierresPage() {
  const sales = useCajiaStore((s) => s.sales);
  const settings = useCajiaStore((s) => s.settings);
  const saveReport = useCajiaStore((s) => s.saveReport);

  const today = todayKey();
  const todaySales = getSalesForDate(sales, today);
  const totalToday = sumTotal(todaySales);
  const breakdown = breakdownByMethod(todaySales);

  const [closure, setClosure] = useState<DailyClosure | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const generateRef = useRef(false);
  const pdfRef = useRef(false);
  const saveRef = useRef(false);
  const driveRef = useRef(false);

  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [driveStatus, setDriveStatus] = useState<"idle" | "loading" | "done">("idle");
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveResult, setDriveResult] = useState<{ webViewLink: string } | null>(null);

  useEffect(() => {
    getDriveStatus().then((s) => setDriveConnected(s.connected));

    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("drive_error");
    const connectedFlag = params.get("drive_connected");
    if (errorCode || connectedFlag) {
      // One-time sync from the OAuth redirect URL (external browser API), not from React state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (connectedFlag) setDriveConnected(true);
      if (errorCode) setDriveError(describeGoogleOAuthError(errorCode));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleGenerate() {
    if (generateRef.current) return;
    generateRef.current = true;
    setGenerating(true);
    setGenerateError(false);
    try {
      const result = await buildDailyClosure(sales, today);
      setClosure(result);
    } catch {
      setGenerateError(true);
    } finally {
      setGenerating(false);
      generateRef.current = false;
    }
  }

  function handleDownloadPdf() {
    if (!closure || pdfRef.current) return;
    pdfRef.current = true;
    setPdfError(false);
    try {
      generateDailyClosurePDF(closure, settings);
    } catch {
      setPdfError(true);
    } finally {
      pdfRef.current = false;
    }
  }

  function handleSaveReport() {
    if (!closure || saveRef.current || saved) return;
    saveRef.current = true;
    const report: SavedReport = {
      id: `report-diario-${closure.date}-${Date.now()}`,
      type: "diario",
      title: `Cierre diario — ${dateLabel(closure.date)}`,
      date: closure.date,
      total: closure.totalSales,
      periodKey: closure.date,
    };
    saveReport(report);
    setSaved(true);
    saveRef.current = false;
  }

  async function handleExportDrive() {
    if (driveRef.current || !closure) return;

    if (!driveConnected) {
      window.location.href = getGoogleConnectUrl("/cierres");
      return;
    }

    driveRef.current = true;
    setDriveStatus("loading");
    setDriveError(null);
    try {
      const blob = dailyClosurePdfBlob(closure, settings);
      const fileName = dailyClosurePdfFileName(closure);
      const result = await exportPdfToDrive(blob, fileName);
      if (result.success) {
        setDriveResult({ webViewLink: result.webViewLink });
        setDriveStatus("done");
      } else {
        if (result.error === "not_connected" || result.error === "reauth_required") {
          setDriveConnected(false);
        }
        setDriveError(result.message);
        setDriveStatus("idle");
      }
    } catch {
      setDriveError("No pudimos subir el informe a Google Drive. Intenta nuevamente.");
      setDriveStatus("idle");
    } finally {
      driveRef.current = false;
    }
  }

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Cierre de caja" subtitle={`Fecha: ${dateLabel(today)}`} />

      <div className="mb-5 flex gap-2">
        <span className="rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white">Diario</span>
        <Link
          href="/cierres/mensual"
          className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-50"
        >
          Mensual
        </Link>
      </div>

      {driveError && <ErrorNotice message={driveError} className="mb-5" />}

      <Card>
        <CardHeader>
          <CardTitle>Ventas registradas: {formatCurrency(totalToday)}</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Efectivo" value={formatCurrency(breakdown.efectivo)} icon={<Banknote className="h-4 w-4" />} accent="sky" />
            <StatCard label="Tarjeta" value={formatCurrency(breakdown.tarjeta)} icon={<CreditCard className="h-4 w-4" />} accent="amber" />
            <StatCard label="SINPE" value={formatCurrency(breakdown.sinpe)} icon={<Smartphone className="h-4 w-4" />} accent="accent" />
            <StatCard label="Total" value={formatCurrency(totalToday)} icon={<Wallet className="h-4 w-4" />} accent="navy" />
          </div>
          <p className="mt-4 text-sm text-navy-500">
            Transacciones: <span className="font-semibold text-navy-900">{todaySales.length}</span>
          </p>

          {!closure && (
            <>
              <Button size="lg" fullWidth className="mt-5" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Spinner className="h-4 w-4" /> Generando cierre...
                  </>
                ) : (
                  "Generar cierre de caja"
                )}
              </Button>
              {generateError && <ErrorNotice />}
            </>
          )}
        </CardBody>
      </Card>

      {closure && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cierre de caja — {dateLabel(closure.date)}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total vendido" value={formatCurrency(closure.totalSales)} icon={<Wallet className="h-4 w-4" />} accent="accent" />
                <StatCard label="Número de ventas" value={String(closure.transactions)} icon={<Receipt className="h-4 w-4" />} accent="navy" />
                <StatCard label="Ticket promedio" value={formatCurrency(closure.averageTicket)} icon={<Calculator className="h-4 w-4" />} accent="sky" />
                <StatCard label="Efectivo" value={formatCurrency(closure.breakdown.efectivo)} icon={<Banknote className="h-4 w-4" />} accent="sky" />
                <StatCard label="Tarjeta" value={formatCurrency(closure.breakdown.tarjeta)} icon={<CreditCard className="h-4 w-4" />} accent="amber" />
                <StatCard label="SINPE" value={formatCurrency(closure.breakdown.sinpe)} icon={<Smartphone className="h-4 w-4" />} accent="accent" />
              </div>
            </CardBody>
          </Card>

          <Card className="border-accent-200 bg-gradient-to-br from-accent-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-accent-600" />
                Análisis inteligente
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
                  <Download className="h-4 w-4" /> Descargar PDF
                </Button>
                <Button variant="outline" onClick={handleSaveReport} disabled={saved} className="gap-2">
                  <Save className="h-4 w-4" /> {saved ? "Guardado ✓" : "Guardar en CajIA"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportDrive}
                  disabled={driveStatus === "loading" || driveConnected === null}
                  className="gap-2"
                >
                  {driveStatus === "loading" ? <Spinner className="h-4 w-4" /> : <CloudUpload className="h-4 w-4" />}
                  {driveConnected === false ? "Conectar con Google" : "Exportar a Google Drive"}
                </Button>
              </div>

              {pdfError && <ErrorNotice message="No pudimos generar el PDF. Intenta nuevamente." />}

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

              {driveStatus === "done" && driveResult && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Informe subido a Google Drive ✓</p>
                    <a
                      href={driveResult.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 font-medium text-accent-700 underline underline-offset-2"
                    >
                      Ver archivo en Drive <ExternalLink className="h-3.5 w-3.5" />
                    </a>
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
