import { PaymentBreakdown, PaymentMethod } from "@/lib/types";
import { TopProduct } from "@/lib/selectors";
import { formatCurrency, methodLabel } from "@/lib/selectors";

/**
 * AI analysis service.
 *
 * Today this runs entirely on demo data with a local template engine so the
 * MVP has zero external dependencies. `AI_PROVIDER` is the single switch to
 * flip once a real Gemini API key is available — `callGeminiAnalysis` is the
 * only function that needs a real implementation, everything else (prompt
 * shape, inputs, fallback) is already wired up.
 */
const AI_PROVIDER: "simulated" | "gemini" = "simulated";

async function callGeminiAnalysis(_prompt: string): Promise<string> {
  // Placeholder for the future Gemini API integration.
  // When ready: call the Gemini API here with `_prompt` and return the text response.
  throw new Error("Gemini API no está configurada todavía.");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface DailyAnalysisInput {
  totalSales: number;
  transactions: number;
  breakdown: PaymentBreakdown;
  mostUsedMethod: PaymentMethod;
  percentVsYesterday: number;
  peakHours: string;
  topProducts: TopProduct[];
}

function buildDailyPrompt(input: DailyAnalysisInput): string {
  return `Analiza el cierre de caja de hoy: ${input.transactions} ventas por ${formatCurrency(
    input.totalSales
  )}, método más usado ${methodLabel(input.mostUsedMethod)}, cambio vs ayer ${input.percentVsYesterday}%.`;
}

function buildDailyAnalysisText(input: DailyAnalysisInput): string {
  const methodShare = Math.round(
    (input.breakdown[input.mostUsedMethod] / Math.max(input.totalSales, 1)) * 100
  );
  const trendWord = input.percentVsYesterday >= 0 ? "positivo" : "a la baja";
  const changeAbs = Math.abs(Math.round(input.percentVsYesterday));
  const top = input.topProducts.slice(0, 2).map((p) => p.name.toLowerCase());
  const topText =
    top.length === 2
      ? `${top[0]} y ${top[1]}`
      : top[0] ?? "tus productos principales";

  return `Durante la jornada se registraron ${input.transactions} ventas por un total de ${formatCurrency(
    input.totalSales
  )}. El método de pago más utilizado fue ${methodLabel(
    input.mostUsedMethod
  ).toLowerCase()}, representando aproximadamente el ${methodShare}% de las ventas.\n\nEl comportamiento de ventas fue ${trendWord} respecto al día anterior, con un cambio aproximado del ${changeAbs}%. El mayor movimiento se concentró entre las ${input.peakHours.replace(/\.$/, "")}.\n\nRecomendación: considera mantener mayor disponibilidad de ${topText} durante la mañana, ya que concentran una parte importante de las ventas.`;
}

export async function generateDailyAIAnalysis(input: DailyAnalysisInput): Promise<string> {
  await delay(900);
  if (AI_PROVIDER === "gemini") {
    try {
      return await callGeminiAnalysis(buildDailyPrompt(input));
    } catch {
      // Fall back to the local template if Gemini isn't reachable yet.
    }
  }
  return buildDailyAnalysisText(input);
}

export interface MonthlyAnalysisInput {
  monthLabel: string;
  totalSales: number;
  transactions: number;
  breakdown: PaymentBreakdown;
  mostUsedMethod: PaymentMethod;
  weeklyTotals: { label: string; total: number }[];
}

function buildMonthlyAnalysisText(input: MonthlyAnalysisInput): string {
  const bestWeek = [...input.weeklyTotals].sort((a, b) => b.total - a.total)[0];
  return `Durante ${input.monthLabel} se registró un crecimiento sostenido de las ventas. La ${bestWeek.label.toLowerCase()} fue la de mayor facturación, con ${formatCurrency(
    bestWeek.total
  )}.\n\nEl método de pago más utilizado fue ${methodLabel(
    input.mostUsedMethod
  ).toLowerCase()}. Los períodos de mayor movimiento se concentraron durante las mañanas y los fines de semana.\n\nRecomendación: refuerza el inventario de los productos con mayor rotación durante los días de mayor actividad para evitar quiebres de stock.`;
}

export async function generateMonthlyAIAnalysis(input: MonthlyAnalysisInput): Promise<string> {
  await delay(900);
  if (AI_PROVIDER === "gemini") {
    try {
      return await callGeminiAnalysis(
        `Analiza el mes ${input.monthLabel}: ${input.transactions} ventas por ${formatCurrency(input.totalSales)}.`
      );
    } catch {
      // Fall back to the local template.
    }
  }
  return buildMonthlyAnalysisText(input);
}
