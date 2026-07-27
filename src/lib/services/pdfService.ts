import jsPDF from "jspdf";
import { BusinessSettings, DailyClosure, MonthlyClosure } from "@/lib/types";
import { dateLabel, formatCurrency } from "@/lib/selectors";
import { DEJAVU_SANS_BOLD_BASE64, DEJAVU_SANS_REGULAR_BASE64 } from "@/lib/services/fonts";
import { CAJIA_LOGO_ASPECT_RATIO, CAJIA_LOGO_PNG_BASE64 } from "@/lib/services/logoAsset";

const NAVY: [number, number, number] = [30, 42, 71];
const NAVY_SOFT: [number, number, number] = [90, 108, 145];
const ACCENT: [number, number, number] = [13, 148, 136];
const GRAY: [number, number, number] = [110, 118, 132];
const PAGE_WIDTH = 210;
const MARGIN = 16;
const FONT = "DejaVuSans";

// jsPDF's built-in fonts only support WinAnsi encoding, which drops the ₡
// colón sign and any emoji. We embed a small Latin-1 + ₡ subset of DejaVu
// Sans so real currency symbols render correctly in the PDF; emoji are
// stripped from PDF text since no standard PDF font can render them.
function registerFont(doc: jsPDF) {
  doc.addFileToVFS("DejaVuSans.ttf", DEJAVU_SANS_REGULAR_BASE64);
  doc.addFont("DejaVuSans.ttf", FONT, "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", DEJAVU_SANS_BOLD_BASE64);
  doc.addFont("DejaVuSans-Bold.ttf", FONT, "bold");
}

function stripEmoji(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "").trim();
}

function drawLogo(doc: jsPDF, x: number, y: number) {
  const height = 11;
  const width = height * CAJIA_LOGO_ASPECT_RATIO;
  doc.addImage(CAJIA_LOGO_PNG_BASE64, "PNG", x, y, width, height);
}

function drawHeader(doc: jsPDF, settings: BusinessSettings, title: string) {
  drawLogo(doc, MARGIN, 14);

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const lines = [
    settings.businessName,
    `Cédula jurídica: ${settings.legalId}`,
    `Tel: ${settings.phone}`,
    settings.email,
  ];
  lines.forEach((line, i) => {
    doc.text(line, PAGE_WIDTH - MARGIN, 12 + i * 4.2, { align: "right" });
  });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, 32, PAGE_WIDTH - MARGIN, 32);

  doc.setFont(FONT, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text(title, MARGIN, 42);
}

function drawFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...NAVY_SOFT);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, pageHeight - 18, PAGE_WIDTH - MARGIN, pageHeight - 18);
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Generado con CajIA", MARGIN, pageHeight - 12);
  doc.text(
    `Fecha y hora de generación: ${new Date().toLocaleString("es-CR")}`,
    PAGE_WIDTH - MARGIN,
    pageHeight - 12,
    { align: "right" }
  );
}

function drawSectionTitle(doc: jsPDF, text: string, y: number, accent = false): number {
  if (accent) {
    doc.setFillColor(...ACCENT);
    doc.circle(MARGIN + 1, y - 1.3, 1.1, "F");
  }
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(text, accent ? MARGIN + 5 : MARGIN, y);
  return y + 6;
}

function drawKeyValueRow(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFont(FONT, "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...GRAY);
  doc.text(label, MARGIN, y);
  doc.setFont(FONT, "bold");
  doc.setTextColor(...NAVY);
  doc.text(value, PAGE_WIDTH - MARGIN, y, { align: "right" });
  return y + 6.5;
}

function drawParagraph(doc: jsPDF, text: string, y: number): number {
  doc.setFont(FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 56, 68);
  const paragraphs = text.split("\n\n");
  let cursor = y;
  for (const p of paragraphs) {
    const lines = doc.splitTextToSize(p, PAGE_WIDTH - MARGIN * 2);
    doc.text(lines, MARGIN, cursor);
    cursor += lines.length * 5 + 3;
  }
  return cursor;
}

function buildDailyClosureDoc(closure: DailyClosure, settings: BusinessSettings): jsPDF {
  const doc = new jsPDF();
  registerFont(doc);
  drawHeader(doc, settings, "Informe de cierre de caja");

  let y = 52;
  y = drawKeyValueRow(doc, "Negocio:", settings.businessName, y);
  y = drawKeyValueRow(doc, "Fecha:", dateLabel(closure.date), y);
  y += 4;

  y = drawSectionTitle(doc, "Resumen del día", y);
  y = drawKeyValueRow(doc, "Total de ventas", formatCurrency(closure.totalSales), y);
  y = drawKeyValueRow(doc, "Número de transacciones", String(closure.transactions), y);
  y = drawKeyValueRow(doc, "Ticket promedio", formatCurrency(closure.averageTicket), y);
  y += 4;

  y = drawSectionTitle(doc, "Desglose por método de pago", y);
  y = drawKeyValueRow(doc, "Efectivo", formatCurrency(closure.breakdown.efectivo), y);
  y = drawKeyValueRow(doc, "Tarjeta", formatCurrency(closure.breakdown.tarjeta), y);
  y = drawKeyValueRow(doc, "SINPE", formatCurrency(closure.breakdown.sinpe), y);
  y += 4;

  if (closure.topProducts.length) {
    y = drawSectionTitle(doc, "Productos destacados", y);
    for (const p of closure.topProducts.slice(0, 5)) {
      y = drawKeyValueRow(doc, `${stripEmoji(p.name)} (x${p.quantity})`, formatCurrency(p.total), y);
    }
    y += 4;
  }

  y = drawSectionTitle(doc, "Análisis inteligente", y, true);
  y = drawParagraph(doc, stripEmoji(closure.aiAnalysis), y);

  drawFooter(doc);
  return doc;
}

export function dailyClosurePdfFileName(closure: DailyClosure): string {
  return `CajIA-cierre-diario-${closure.date}.pdf`;
}

// Used by the "Descargar PDF" button — triggers a browser download.
export function generateDailyClosurePDF(closure: DailyClosure, settings: BusinessSettings) {
  const doc = buildDailyClosureDoc(closure, settings);
  doc.save(dailyClosurePdfFileName(closure));
}

// Used by the Google Drive export flow — same document, returned as bytes
// instead of triggering a download, so the two paths always produce an
// identical PDF.
export function dailyClosurePdfBlob(closure: DailyClosure, settings: BusinessSettings): Blob {
  const doc = buildDailyClosureDoc(closure, settings);
  return doc.output("blob");
}

function buildMonthlyClosureDoc(closure: MonthlyClosure, settings: BusinessSettings): jsPDF {
  const doc = new jsPDF();
  registerFont(doc);
  drawHeader(doc, settings, "Informe de cierre mensual");

  let y = 52;
  y = drawKeyValueRow(doc, "Negocio:", settings.businessName, y);
  y = drawKeyValueRow(doc, "Mes:", closure.monthLabel, y);
  y += 4;

  y = drawSectionTitle(doc, "Resumen del mes", y);
  y = drawKeyValueRow(doc, "Ventas totales", formatCurrency(closure.totalSales), y);
  y = drawKeyValueRow(doc, "Transacciones", String(closure.transactions), y);
  y = drawKeyValueRow(doc, "Ticket promedio", formatCurrency(closure.averageTicket), y);
  y += 4;

  y = drawSectionTitle(doc, "Desglose por método de pago", y);
  y = drawKeyValueRow(doc, "Efectivo", formatCurrency(closure.breakdown.efectivo), y);
  y = drawKeyValueRow(doc, "Tarjeta", formatCurrency(closure.breakdown.tarjeta), y);
  y = drawKeyValueRow(doc, "SINPE", formatCurrency(closure.breakdown.sinpe), y);
  y += 4;

  y = drawSectionTitle(doc, "Ventas por semana", y);
  for (const w of closure.weeklyTotals) {
    y = drawKeyValueRow(doc, w.label, formatCurrency(w.total), y);
  }
  y += 4;

  y = drawSectionTitle(doc, "Análisis inteligente del mes", y, true);
  y = drawParagraph(doc, stripEmoji(closure.aiAnalysis), y);

  drawFooter(doc);
  return doc;
}

export function monthlyClosurePdfFileName(closure: MonthlyClosure): string {
  return `CajIA-cierre-mensual-${closure.month}.pdf`;
}

// Used by the "Generar informe PDF" button — triggers a browser download.
export function generateMonthlyClosurePDF(closure: MonthlyClosure, settings: BusinessSettings) {
  const doc = buildMonthlyClosureDoc(closure, settings);
  doc.save(monthlyClosurePdfFileName(closure));
}

// Used by the Google Drive export flow — same document, returned as bytes.
export function monthlyClosurePdfBlob(closure: MonthlyClosure, settings: BusinessSettings): Blob {
  const doc = buildMonthlyClosureDoc(closure, settings);
  return doc.output("blob");
}
