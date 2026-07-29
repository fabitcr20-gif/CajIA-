import { PaymentMethod, Product, Sale, SaleItem } from "@/lib/types";
import { INITIAL_PRODUCTS } from "@/lib/data/products";

// Fixed "today" for the demo so the story stays consistent every time it's shown.
export const DEMO_TODAY = "2026-07-27";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

function buildLabel(items: SaleItem[]): string {
  return items
    .map((i) => (i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name))
    .join(" + ");
}

let saleCounter = 0;
function makeSale(
  date: string,
  hour: number,
  minute: number,
  items: SaleItem[],
  method: PaymentMethod
): Sale {
  saleCounter += 1;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return {
    id: `s-${date}-${saleCounter}`,
    date,
    timestamp: `${date}T${hh}:${mm}:00`,
    items,
    total,
    method,
    label: buildLabel(items),
  };
}

function item(productId: string, quantity: number, products: Product[]): SaleItem {
  const p = products.find((p) => p.id === productId)!;
  return { productId: p.id, name: p.name, emoji: p.emoji, price: p.price, quantity };
}

const WEIGHTED_HOURS = [
  7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12, 13, 14, 15, 16, 17,
];

function randomTime(rng: Rng): { hour: number; minute: number } {
  const hour = pick(WEIGHTED_HOURS, rng());
  const minute = Math.floor(rng() * 60);
  return { hour, minute };
}

function randomMethod(rng: Rng): PaymentMethod {
  const r = rng();
  if (r < 0.4) return "tarjeta";
  if (r < 0.75) return "efectivo";
  return "sinpe";
}

function randomSaleItems(products: Product[], rng: Rng): SaleItem[] {
  const productIds = products.map((p) => p.id);
  const r = rng();
  const productId1 = pick(productIds, rng());
  const qty1 = rng() < 0.7 ? 1 : 2;
  const items = [item(productId1, qty1, products)];
  if (r > 0.6) {
    let productId2 = pick(productIds, rng());
    let guard = 0;
    while (productId2 === productId1 && guard < 5) {
      productId2 = pick(productIds, rng());
      guard++;
    }
    if (productId2 !== productId1) {
      items.push(item(productId2, 1, products));
    }
  }
  return items;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
}

const DAY_FACTOR = [0.72, 0.95, 0.98, 1.0, 1.08, 1.25, 1.32]; // Sun..Sat

function generateDayOfSales(
  date: string,
  dayIndexFromStart: number,
  totalDays: number,
  products: Product[],
  rng: Rng
): Sale[] {
  const dow = dayOfWeek(date);
  const trend = 0.85 + (dayIndexFromStart / totalDays) * 0.35; // slow growth across the window
  const base = 19 * DAY_FACTOR[dow] * trend;
  const jitter = 0.85 + rng() * 0.3;
  const count = Math.max(8, Math.round(base * jitter));

  const times = Array.from({ length: count }, () => randomTime(rng)).sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)
  );

  return times.map(({ hour, minute }) =>
    makeSale(date, hour, minute, randomSaleItems(products, rng), randomMethod(rng))
  );
}

function generateHistoricalSales(daysBack: number, products: Product[], rng: Rng): Sale[] {
  const sales: Sale[] = [];
  for (let i = daysBack; i >= 1; i--) {
    const date = addDays(DEMO_TODAY, -i);
    sales.push(...generateDayOfSales(date, daysBack - i, daysBack, products, rng));
  }
  return sales;
}

// Hand-tuned so "today" matches the numbers used throughout the product spec:
// Efectivo ₡31.500 · Tarjeta ₡35.000 · SINPE ₡20.000 · 27 transacciones · ₡86.500 total
function generateTodaySales(rng: Rng): Sale[] {
  const date = DEMO_TODAY;
  const sales: Sale[] = [];

  const efectivoPlan: { items: SaleItem[] }[] = [
    { items: [item("p1", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
    { items: [item("p3", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p5", 1, INITIAL_PRODUCTS), item("p2", 1, INITIAL_PRODUCTS)] }, // 1500+2500=4000
    { items: [item("p1", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p4", 1, INITIAL_PRODUCTS)] }, // 3000
    { items: [item("p2", 1, INITIAL_PRODUCTS), item("p3", 1, INITIAL_PRODUCTS)] }, // 2500+2000=4500
    { items: [item("p3", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p3", 2, INITIAL_PRODUCTS)] }, // 4000
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
  ];

  const tarjetaPlan: { items: SaleItem[] }[] = [
    { items: [item("p1", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p2", 1, INITIAL_PRODUCTS)] }, // 2500
    { items: [item("p4", 1, INITIAL_PRODUCTS)] }, // 3000
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
    { items: [item("p1", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p2", 1, INITIAL_PRODUCTS), item("p3", 1, INITIAL_PRODUCTS)] }, // 4500
    { items: [item("p3", 1, INITIAL_PRODUCTS), item("p5", 1, INITIAL_PRODUCTS)] }, // 3500
    { items: [item("p4", 1, INITIAL_PRODUCTS)] }, // 3000
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
    { items: [item("p2", 1, INITIAL_PRODUCTS)] }, // 2500
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
  ];

  const sinpePlan: { items: SaleItem[] }[] = [
    { items: [item("p1", 1, INITIAL_PRODUCTS)] }, // 2000
    { items: [item("p4", 1, INITIAL_PRODUCTS)] }, // 3000
    { items: [item("p2", 1, INITIAL_PRODUCTS), item("p3", 1, INITIAL_PRODUCTS)] }, // 4500
    { items: [item("p3", 1, INITIAL_PRODUCTS), item("p5", 1, INITIAL_PRODUCTS)] }, // 3500
    { items: [item("p1", 2, INITIAL_PRODUCTS)] }, // 4000
    { items: [item("p4", 1, INITIAL_PRODUCTS)] }, // 3000
  ];

  const timeline = [
    ...efectivoPlan.map((p) => ({ ...p, method: "efectivo" as PaymentMethod })),
    ...tarjetaPlan.map((p) => ({ ...p, method: "tarjeta" as PaymentMethod })),
    ...sinpePlan.map((p) => ({ ...p, method: "sinpe" as PaymentMethod })),
  ];

  // Spread across the morning rush, mostly 7:45am-11:30am with a light afternoon tail.
  const morningSlots = Array.from({ length: timeline.length }, (_, i) => {
    const minuteOffset = Math.floor((i * 210) / timeline.length); // ~3.5h spread
    const startMinute = 7 * 60 + 45;
    const total = startMinute + minuteOffset + Math.floor(rng() * 6);
    return { hour: Math.floor(total / 60), minute: total % 60 };
  });

  // shuffle deterministically so payment methods interleave naturally through the day
  const order = timeline.map((_, i) => i).sort((a, b) => {
    const ra = mulberry32(a + 7)();
    const rb = mulberry32(b + 7)();
    return ra - rb;
  });

  order.forEach((planIdx, slotIdx) => {
    const plan = timeline[planIdx];
    const { hour, minute } = morningSlots[slotIdx];
    sales.push(makeSale(date, hour, minute, plan.items, plan.method));
  });

  return sales.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function generateDemoSales(): Sale[] {
  const rng = mulberry32(20260727);
  const historical = generateHistoricalSales(44, INITIAL_PRODUCTS, rng); // ~45 days of history ending yesterday
  const today = generateTodaySales(rng);
  return [...historical, ...today];
}

// Generic version used for non-cafetería demo verticals: same historical
// growth-curve model as generateDemoSales, but "today" is just one more
// algorithmically generated day instead of a hand-tuned plan (which only
// makes sense for the café's specific product catalog). Each vertical gets
// its own seed so switching between them always reproduces the same look.
export function generateSalesForProducts(products: Product[], seed: number): Sale[] {
  const rng = mulberry32(seed);
  const historical = generateHistoricalSales(44, products, rng);
  const today = generateDayOfSales(DEMO_TODAY, 44, 44, products, rng);
  return [...historical, ...today];
}
