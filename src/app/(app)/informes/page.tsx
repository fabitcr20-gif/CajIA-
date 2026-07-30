"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Download, FileText } from "lucide-react";
import { useCajiaStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { dateLabel, formatCurrency } from "@/lib/selectors";
import { buildDailyClosure, buildMonthlyClosure } from "@/lib/services/closureService";
import { generateDailyClosurePDF, generateMonthlyClosurePDF } from "@/lib/services/pdfService";
import { SavedReport } from "@/lib/types";

export default function InformesPage() {
  const savedReports = useCajiaStore((s) => s.savedReports);
  const sales = useCajiaStore((s) => s.sales);
  const returns = useCajiaStore((s) => s.returns);
  const settings = useCajiaStore((s) => s.settings);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleDownload(report: SavedReport) {
    if (downloadingId) return;
    setDownloadingId(report.id);
    setErrorId(null);
    try {
      if (report.type === "diario") {
        const closure = await buildDailyClosure(sales, returns, report.periodKey);
        generateDailyClosurePDF(closure, settings);
      } else {
        const closure = await buildMonthlyClosure(sales, returns, report.periodKey);
        generateMonthlyClosurePDF(closure, settings);
      }
    } catch {
      setErrorId(report.id);
    } finally {
      setDownloadingId(null);
    }
  }

  const sorted = [...savedReports].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="animate-fade-in pb-6">
      <PageHeader title="Mis informes" subtitle="Historial de cierres guardados durante esta sesión" />

      {sorted.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400">
            <FileText className="h-6 w-6" />
          </span>
          <p className="text-sm text-navy-500">
            Aún no has guardado informes. Genera un cierre y presiona &quot;Guardar en CajIA&quot;.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((report) => (
            <Card key={report.id} className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <FileText className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-navy-900">{report.title}</p>
                      <Badge tone={report.type === "mensual" ? "accent" : "navy"}>
                        {report.type === "mensual" ? "Mensual" : "Diario"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-navy-500">{dateLabel(report.date)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-lg font-semibold text-navy-900">{formatCurrency(report.total)}</span>
                  <div className="flex items-center gap-2">
                    <Link href={report.type === "mensual" ? "/cierres/mensual" : "/cierres"}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleDownload(report)}
                      disabled={downloadingId === report.id}
                    >
                      {downloadingId === report.id ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
              {errorId === report.id && <ErrorNotice message="No pudimos generar el PDF. Intenta nuevamente." />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
