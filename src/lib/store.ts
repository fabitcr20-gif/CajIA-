import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BusinessSettings,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  SavedReport,
} from "@/lib/types";
import { INITIAL_PRODUCTS } from "@/lib/data/products";
import { generateDemoSales, generateSalesForProducts, DEMO_TODAY } from "@/lib/data/demoSales";
import { buildSeedReports } from "@/lib/data/seedReports";
import { BUSINESS_PRESETS, BusinessPresetId, PRESET_SEEDS } from "@/lib/data/businessPresets";

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Café El Alumbre",
  businessType: "Cafetería / Emprendimiento",
  currency: "₡ CRC",
  legalId: "3-102-789456",
  phone: "+506 8888-1234",
  email: "contacto@cafeelalumbre.com",
  paymentMethods: ["efectivo", "tarjeta", "sinpe"],
};

interface CajiaState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  products: Product[];
  sales: Sale[];
  savedReports: SavedReport[];
  settings: BusinessSettings;
  businessPresetId: BusinessPresetId;
  onboardingComplete: boolean;
  login: () => void;
  logout: () => void;
  addSale: (items: SaleItem[], method: PaymentMethod) => Sale;
  updateSale: (id: string, items: SaleItem[], method: PaymentMethod) => void;
  deleteSale: (id: string) => void;
  addProduct: (product: Omit<Product, "id" | "active">) => void;
  updateProduct: (id: string, partial: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (partial: Partial<BusinessSettings>) => void;
  applyBusinessPreset: (presetId: BusinessPresetId) => void;
  saveReport: (report: SavedReport) => void;
  setHydrated: () => void;
}

function buildSaleLabel(items: SaleItem[]): string {
  return items.map((i) => (i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name)).join(" + ");
}

function saleTotal(items: SaleItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

let saleIdCounter = 0;
const initialSales = generateDemoSales();

export const useCajiaStore = create<CajiaState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasHydrated: false,
      products: INITIAL_PRODUCTS,
      sales: initialSales,
      savedReports: buildSeedReports(initialSales),
      settings: DEFAULT_SETTINGS,
      businessPresetId: "cafeteria",
      onboardingComplete: false,

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      addSale: (items, method) => {
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
        };
        set({ sales: [...get().sales, sale] });
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
    }),
    {
      name: "cajia-demo-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        sales: state.sales,
        savedReports: state.savedReports,
        settings: state.settings,
        businessPresetId: state.businessPresetId,
        onboardingComplete: state.onboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
