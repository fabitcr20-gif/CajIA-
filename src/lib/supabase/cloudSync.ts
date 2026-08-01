import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCajiaStore } from "@/lib/store";
import { BusinessSettings, HistoryEvent, Product, Return, Sale, SavedReport } from "@/lib/types";
import { BusinessPresetId } from "@/lib/data/businessPresets";

// ---------------------------------------------------------------------------
// Cloud sync: keeps this device's data backed up in Supabase without any
// visible login. Each browser gets a real (but invisible) anonymous Supabase
// Auth session, and Row Level Security scopes every row to that session's
// id — so backup happens automatically and safely, with no signup screen.
//
// If Supabase isn't configured (no env vars), every function here becomes a
// no-op and CajIA keeps working exactly as it did before: local-only,
// backed by the existing Zustand `persist` (localStorage) layer.
// ---------------------------------------------------------------------------

function warn(context: string, err: unknown) {
  // Sync failures must never break the app or interrupt the user — they're
  // surfaced as console warnings only. The optimistic local state (and the
  // localStorage cache) remains the source of truth for the current session.
  console.warn(`[CajIA cloud sync] ${context}:`, err instanceof Error ? err.message : err);
}

async function ensureAnonymousSession(client: SupabaseClient): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    if (session?.user?.id) return session.user.id;

    const { data, error } = await client.auth.signInAnonymously();
    if (error || !data.session) {
      warn("anonymous sign-in failed", error);
      return null;
    }
    return data.session.user.id;
  } catch (err) {
    warn("anonymous sign-in threw", err);
    return null;
  }
}

// --- Row <-> app-type conversions (snake_case columns <-> camelCase types) ---

function productToRow(businessId: string, p: Product) {
  return { id: p.id, business_id: businessId, name: p.name, emoji: p.emoji, price: p.price, category: p.category, active: p.active };
}
function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string,
    name: r.name as string,
    emoji: r.emoji as string,
    price: Number(r.price),
    category: r.category as string,
    active: Boolean(r.active),
  };
}

function saleToRow(businessId: string, s: Sale) {
  return {
    id: s.id,
    business_id: businessId,
    date: s.date,
    timestamp: s.timestamp,
    items: s.items,
    total: s.total,
    method: s.method,
    label: s.label,
    status: s.status,
    payment_status: s.paymentStatus,
    discount: s.discount ?? null,
    delivery: s.delivery ?? null,
  };
}
function rowToSale(r: Record<string, unknown>): Sale {
  return {
    id: r.id as string,
    date: r.date as string,
    timestamp: r.timestamp as string,
    items: r.items as Sale["items"],
    total: Number(r.total),
    method: r.method as Sale["method"],
    label: r.label as string,
    status: r.status as Sale["status"],
    paymentStatus: r.payment_status as Sale["paymentStatus"],
    discount: r.discount != null ? Number(r.discount) : undefined,
    delivery: (r.delivery as Sale["delivery"]) ?? undefined,
  };
}

function returnToRow(businessId: string, ret: Return) {
  return {
    id: ret.id,
    business_id: businessId,
    sale_id: ret.saleId,
    type: ret.type,
    reason: ret.reason,
    date: ret.date,
    amount: ret.amount,
    product_id: ret.productId ?? null,
    notes: ret.notes ?? null,
  };
}
function rowToReturn(r: Record<string, unknown>): Return {
  return {
    id: r.id as string,
    saleId: r.sale_id as string,
    type: r.type as Return["type"],
    reason: r.reason as string,
    date: r.date as string,
    amount: Number(r.amount),
    productId: (r.product_id as string) ?? undefined,
    notes: (r.notes as string) ?? undefined,
  };
}

function eventToRow(businessId: string, e: HistoryEvent) {
  return { id: e.id, business_id: businessId, type: e.type, timestamp: e.timestamp, description: e.description, sale_id: e.saleId ?? null };
}
function rowToEvent(r: Record<string, unknown>): HistoryEvent {
  return {
    id: r.id as string,
    type: r.type as HistoryEvent["type"],
    timestamp: r.timestamp as string,
    description: r.description as string,
    saleId: (r.sale_id as string) ?? undefined,
  };
}

function reportToRow(businessId: string, rep: SavedReport) {
  return { id: rep.id, business_id: businessId, type: rep.type, title: rep.title, date: rep.date, total: rep.total, period_key: rep.periodKey };
}
function rowToReport(r: Record<string, unknown>): SavedReport {
  return {
    id: r.id as string,
    type: r.type as SavedReport["type"],
    title: r.title as string,
    date: r.date as string,
    total: Number(r.total),
    periodKey: r.period_key as string,
  };
}

function businessToRow(businessId: string, settings: BusinessSettings, presetId: BusinessPresetId, onboardingComplete: boolean) {
  return {
    id: businessId,
    business_name: settings.businessName,
    business_type: settings.businessType,
    currency: settings.currency,
    legal_id: settings.legalId,
    phone: settings.phone,
    email: settings.email,
    payment_methods: settings.paymentMethods,
    delivery_enabled: settings.deliveryEnabled,
    business_preset_id: presetId,
    onboarding_complete: onboardingComplete,
    updated_at: new Date().toISOString(),
  };
}
function rowToSettings(r: Record<string, unknown>): BusinessSettings {
  return {
    businessName: r.business_name as string,
    businessType: r.business_type as string,
    currency: r.currency as string,
    legalId: r.legal_id as string,
    phone: r.phone as string,
    email: r.email as string,
    paymentMethods: r.payment_methods as BusinessSettings["paymentMethods"],
    deliveryEnabled: Boolean(r.delivery_enabled),
  };
}

interface CloudBusinessData {
  settings: BusinessSettings;
  businessPresetId: BusinessPresetId;
  onboardingComplete: boolean;
  products: Product[];
  sales: Sale[];
  returns: Return[];
  historyEvents: HistoryEvent[];
  savedReports: SavedReport[];
}

async function fetchBusinessData(client: SupabaseClient, businessId: string): Promise<CloudBusinessData | null> {
  const { data: business, error: businessError } = await client.from("businesses").select("*").eq("id", businessId).maybeSingle();
  if (businessError) {
    warn("fetching business row failed", businessError);
    return null;
  }
  if (!business) return null;

  const [products, sales, returns, events, reports] = await Promise.all([
    client.from("products").select("*").eq("business_id", businessId),
    client.from("sales").select("*").eq("business_id", businessId),
    client.from("returns").select("*").eq("business_id", businessId),
    client.from("history_events").select("*").eq("business_id", businessId),
    client.from("saved_reports").select("*").eq("business_id", businessId),
  ]);

  return {
    settings: rowToSettings(business),
    businessPresetId: business.business_preset_id as BusinessPresetId,
    onboardingComplete: Boolean(business.onboarding_complete),
    products: (products.data ?? []).map(rowToProduct),
    sales: (sales.data ?? []).map(rowToSale),
    returns: (returns.data ?? []).map(rowToReturn),
    historyEvents: (events.data ?? []).map(rowToEvent),
    savedReports: (reports.data ?? []).map(rowToReport),
  };
}

async function pushFullState(client: SupabaseClient, businessId: string) {
  const state = useCajiaStore.getState();
  try {
    const { error: businessErr } = await client
      .from("businesses")
      .upsert(businessToRow(businessId, state.settings, state.businessPresetId, state.onboardingComplete));
    if (businessErr) warn("initial business upsert failed", businessErr);

    const jobs: PromiseLike<unknown>[] = [];
    if (state.products.length) jobs.push(client.from("products").upsert(state.products.map((p) => productToRow(businessId, p))));
    if (state.sales.length) jobs.push(client.from("sales").upsert(state.sales.map((s) => saleToRow(businessId, s))));
    if (state.returns.length) jobs.push(client.from("returns").upsert(state.returns.map((r) => returnToRow(businessId, r))));
    if (state.historyEvents.length) jobs.push(client.from("history_events").upsert(state.historyEvents.map((e) => eventToRow(businessId, e))));
    if (state.savedReports.length) jobs.push(client.from("saved_reports").upsert(state.savedReports.map((r) => reportToRow(businessId, r))));
    await Promise.all(jobs);
  } catch (err) {
    warn("initial full-state push failed", err);
  }
}

// Diffs an array slice by stable `id` and upserts/deletes only what changed.
// Relies on the store's immutable-update convention (a changed item is
// always a new object reference) to tell "unchanged" from "needs syncing"
// without deep-comparing every field.
async function syncArraySlice<T extends { id: string }>(
  client: SupabaseClient,
  table: string,
  prevItems: T[],
  nextItems: T[],
  toRow: (item: T) => Record<string, unknown>
) {
  const prevById = new Map(prevItems.map((i) => [i.id, i]));
  const nextIds = new Set(nextItems.map((i) => i.id));
  const toUpsert = nextItems.filter((item) => prevById.get(item.id) !== item);
  const toDeleteIds = prevItems.filter((p) => !nextIds.has(p.id)).map((p) => p.id);

  try {
    if (toUpsert.length > 0) {
      const { error } = await client.from(table).upsert(toUpsert.map(toRow));
      if (error) warn(`${table} upsert failed`, error);
    }
    if (toDeleteIds.length > 0) {
      const { error } = await client.from(table).delete().in("id", toDeleteIds);
      if (error) warn(`${table} delete failed`, error);
    }
  } catch (err) {
    warn(`${table} sync failed`, err);
  }
}

function subscribeToChanges(client: SupabaseClient, businessId: string) {
  let prev = useCajiaStore.getState();
  useCajiaStore.subscribe((state) => {
    if (state.products !== prev.products) {
      void syncArraySlice(client, "products", prev.products, state.products, (p) => productToRow(businessId, p));
    }
    if (state.sales !== prev.sales) {
      void syncArraySlice(client, "sales", prev.sales, state.sales, (s) => saleToRow(businessId, s));
    }
    if (state.returns !== prev.returns) {
      void syncArraySlice(client, "returns", prev.returns, state.returns, (r) => returnToRow(businessId, r));
    }
    if (state.historyEvents !== prev.historyEvents) {
      void syncArraySlice(client, "history_events", prev.historyEvents, state.historyEvents, (e) => eventToRow(businessId, e));
    }
    if (state.savedReports !== prev.savedReports) {
      void syncArraySlice(client, "saved_reports", prev.savedReports, state.savedReports, (r) => reportToRow(businessId, r));
    }
    if (
      state.settings !== prev.settings ||
      state.businessPresetId !== prev.businessPresetId ||
      state.onboardingComplete !== prev.onboardingComplete
    ) {
      client
        .from("businesses")
        .upsert(businessToRow(businessId, state.settings, state.businessPresetId, state.onboardingComplete))
        .then(({ error }) => {
          if (error) warn("business upsert failed", error);
        });
    }
    prev = state;
  });
}

let started = false;

// Called once, client-side, after the local (localStorage) store has
// hydrated. Safe to call multiple times — only runs once per page load.
export async function initCloudSync(): Promise<void> {
  if (started) return;
  started = true;

  const client = getSupabaseClient();
  if (!client) return; // Not configured — stays local-only, no error.

  const businessId = await ensureAnonymousSession(client);
  if (!businessId) return;

  const cloudData = await fetchBusinessData(client, businessId);

  if (cloudData) {
    // This device has synced before — the cloud is now the source of truth.
    useCajiaStore.setState({
      settings: cloudData.settings,
      businessPresetId: cloudData.businessPresetId,
      onboardingComplete: cloudData.onboardingComplete,
      products: cloudData.products,
      sales: cloudData.sales,
      returns: cloudData.returns,
      historyEvents: cloudData.historyEvents,
      savedReports: cloudData.savedReports,
    });
  } else if (useCajiaStore.getState().onboardingComplete) {
    // First time this device reaches Supabase, but it already has real
    // local data (e.g. an existing user from before cloud sync existed) —
    // seed the cloud from what's already here instead of discarding it.
    await pushFullState(client, businessId);
  }
  // Otherwise: brand new device with nothing onboarded yet. Nothing to sync
  // until onboarding creates real data — the subscription below picks it up.

  subscribeToChanges(client, businessId);
}
