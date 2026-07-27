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
import { generateDemoSales, DEMO_TODAY } from "@/lib/data/demoSales";
import { buildSeedReports } from "@/lib/data/seedReports";

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
  login: () => void;
  logout: () => void;
  addSale: (items: SaleItem[], method: PaymentMethod) => Sale;
  addProduct: (product: Omit<Product, "id" | "active">) => void;
  updateSettings: (partial: Partial<BusinessSettings>) => void;
  saveReport: (report: SavedReport) => void;
  setHydrated: () => void;
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

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      addSale: (items, method) => {
        const now = new Date();
        saleIdCounter += 1;
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const label = items
          .map((i) => (i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name))
          .join(" + ");
        const sale: Sale = {
          id: `manual-${Date.now()}-${saleIdCounter}`,
          date: DEMO_TODAY,
          timestamp: `${DEMO_TODAY}T${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
          items,
          total,
          method,
          label,
        };
        set({ sales: [...get().sales, sale] });
        return sale;
      },

      addProduct: (product) => {
        const id = `p-custom-${Date.now()}`;
        set({ products: [...get().products, { ...product, id, active: true }] });
      },

      updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

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
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
