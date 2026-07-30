import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BusinessSettings,
  DeliveryInfo,
  HistoryEvent,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  Return,
  Sale,
  SaleItem,
  SavedReport,
} from "@/lib/types";
import { INITIAL_PRODUCTS } from "@/lib/data/products";
import { generateDemoSales, generateSalesForProducts, DEMO_TODAY } from "@/lib/data/demoSales";
import { buildSeedReports } from "@/lib/data/seedReports";
import { BUSINESS_PRESETS, BusinessPresetId, PRESET_SEEDS } from "@/lib/data/businessPresets";
import { formatCurrency } from "@/lib/selectors";

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Café El Alumbre",
  businessType: "Cafetería / Emprendimiento",
  currency: "₡ CRC",
  legalId: "3-102-789456",
  phone: "+506 8888-1234",
  email: "contacto@cafeelalumbre.com",
  paymentMethods: ["efectivo", "tarjeta", "sinpe"],
  deliveryEnabled: false,
};

interface AddSaleOptions {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  delivery?: DeliveryInfo;
  discount?: number;
}

interface CajiaState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  products: Product[];
  sales: Sale[];
  returns: Return[];
  historyEvents: HistoryEvent[];
  savedReports: SavedReport[];
  settings: BusinessSettings;
  businessPresetId: BusinessPresetId;
  onboardingComplete: boolean;
  login: () => void;
  logout: () => void;
  addSale: (items: SaleItem[], method: PaymentMethod, options?: AddSaleOptions) => Sale;
  updateSale: (id: string, items: SaleItem[], method: PaymentMethod) => void;
  deleteSale: (id: string) => void;
  updateSaleStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus) => void;
  updateSaleDelivery: (id: string, delivery: DeliveryInfo) => void;
  addReturn: (data: Omit<Return, "id">) => void;
  addProduct: (product: Omit<Product, "id" | "active">) => void;
  updateProduct: (id: string, partial: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (partial: Partial<BusinessSettings>) => void;
  applyBusinessPreset: (presetId: BusinessPresetId) => void;
  saveReport: (report: SavedReport) => void;
  setHydrated: () => void;
  normalizeSales: () => void;
}

function buildSaleLabel(items: SaleItem[]): string {
  return items.map((i) => (i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name)).join(" + ");
}

function saleTotal(items: SaleItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

let saleIdCounter = 0;
let returnIdCounter = 0;
let eventIdCounter = 0;
const initialSales = generateDemoSales();

function makeHistoryEvent(type: HistoryEvent["type"], description: string, saleId?: string): HistoryEvent {
  eventIdCounter += 1;
  return {
    id: `event-${Date.now()}-${eventIdCounter}`,
    type,
    timestamp: new Date().toISOString(),
    description,
    saleId,
  };
}

export const useCajiaStore = create<CajiaState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasHydrated: false,
      products: INITIAL_PRODUCTS,
      sales: initialSales,
      returns: [],
      historyEvents: [],
      savedReports: buildSeedReports(initialSales),
      settings: DEFAULT_SETTINGS,
      businessPresetId: "cafeteria",
      onboardingComplete: false,

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      addSale: (items, method, options) => {
        const now = new Date();
        saleIdCounter += 1;
        const sale: Sale = {
          id: `manual-${Date.now()}-${saleIdCounter}`,
          date: DEMO_TODAY,
          timestamp: `${DEMO_TODAY}T${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
          items,
          total: saleTotal(items),
          method,
          label: buildSaleLabel(items),
          status: options?.status ?? "entregado",
          paymentStatus: options?.paymentStatus ?? "pagado",
          discount: options?.discount,
          delivery: options?.delivery,
        };
        const event = makeHistoryEvent("venta", `Venta registrada: ${sale.label} — ${formatCurrency(sale.total)}`, sale.id);
        set({ sales: [...get().sales, sale], historyEvents: [event, ...get().historyEvents] });
        return sale;
      },

      updateSale: (id, items, method) => {
        set({
          sales: get().sales.map((s) =>
            s.id === id ? { ...s, items, method, total: saleTotal(items), label: buildSaleLabel(items) } : s
          ),
        });
      },

      deleteSale: (id) => {
        set({ sales: get().sales.filter((s) => s.id !== id) });
      },

      updateSaleStatus: (id, status) => {
        const sale = get().sales.find((s) => s.id === id);
        if (!sale) return;
        set({ sales: get().sales.map((s) => (s.id === id ? { ...s, status } : s)) });
        const eventType = status === "entregado" ? "pedido_entregado" : status === "cancelado" ? "pedido_cancelado" : "cambio_estado";
        const label = { pendiente: "Pendiente", preparando: "Preparando", en_ruta: "En ruta", entregado: "Entregado", cancelado: "Cancelado", devuelto: "Devuelto" }[status];
        const event = makeHistoryEvent(eventType, `Pedido "${sale.label}" cambió a: ${label}`, id);
        set({ historyEvents: [event, ...get().historyEvents] });
      },

      updatePaymentStatus: (id, paymentStatus) => {
        set({ sales: get().sales.map((s) => (s.id === id ? { ...s, paymentStatus } : s)) });
      },

      updateSaleDelivery: (id, delivery) => {
        set({
          sales: get().sales.map((s) => (s.id === id ? { ...s, delivery: { ...s.delivery, ...delivery } } : s)),
        });
      },

      addReturn: (data) => {
        returnIdCounter += 1;
        const ret: Return = { ...data, id: `return-${Date.now()}-${returnIdCounter}` };
        const sale = get().sales.find((s) => s.id === ret.saleId);
        const saleLabel = sale?.label ?? "venta";
        const eventType = ret.type === "dinero" ? "dinero_reembolsado" : "producto_devuelto";
        const description =
          ret.type === "dinero"
            ? `Dinero reembolsado por ${formatCurrency(ret.amount)} — ${saleLabel}`
            : `Devolución registrada (${ret.type === "cambio" ? "cambio" : "producto"}) — ${saleLabel}`;
        const event = makeHistoryEvent(eventType, description, ret.saleId);
        set({ returns: [ret, ...get().returns], historyEvents: [event, ...get().historyEvents] });
      },

      addProduct: (product) => {
        const id = `p-custom-${Date.now()}`;
        set({ products: [...get().products, { ...product, id, active: true }] });
      },

      updateProduct: (id, partial) => {
        set({ products: get().products.map((p) => (p.id === id ? { ...p, ...partial } : p)) });
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

      applyBusinessPreset: (presetId) => {
        const preset = BUSINESS_PRESETS[presetId];
        const products: Product[] =
          presetId === "cafeteria"
            ? INITIAL_PRODUCTS
            : preset.products.map((p, i) => ({ ...p, id: `${presetId}-p${i + 1}`, active: true }));
        const sales =
          presetId === "cafeteria" ? generateDemoSales() : generateSalesForProducts(products, PRESET_SEEDS[presetId]);
        set({
          businessPresetId: presetId,
          onboardingComplete: true,
          products,
          sales,
          returns: [],
          historyEvents: [],
          savedReports: buildSeedReports(sales),
          settings: {
            ...get().settings,
            businessName: preset.businessName,
            businessType: preset.businessType,
            legalId: preset.legalId,
            phone: preset.phone,
            email: preset.email,
          },
        });
      },

      saveReport: (report) => set({ savedReports: [report, ...get().savedReports] }),

      setHydrated: () => set({ hasHydrated: true }),

      // Backfills status/paymentStatus on sales persisted before these
      // fields existed, so the rest of the app can always rely on them
      // being present. Runs once at rehydration.
      normalizeSales: () => {
        set({
          sales: get().sales.map((s) => {
            const raw = s as Sale & { status?: OrderStatus; paymentStatus?: PaymentStatus };
            return raw.status && raw.paymentStatus ? s : { ...s, status: raw.status ?? "entregado", paymentStatus: raw.paymentStatus ?? "pagado" };
          }),
        });
      },
    }),
    {
      name: "cajia-demo-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        sales: state.sales,
        returns: state.returns,
        historyEvents: state.historyEvents,
        savedReports: state.savedReports,
        settings: state.settings,
        businessPresetId: state.businessPresetId,
        onboardingComplete: state.onboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.normalizeSales();
          state.setHydrated();
        }
      },
    }
  )
);
