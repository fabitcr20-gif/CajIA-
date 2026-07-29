import { Product } from "@/lib/types";

export type BusinessPresetId = "cafeteria" | "tenis" | "reparacion";

export interface BusinessPreset {
  id: BusinessPresetId;
  label: string;
  businessName: string;
  businessType: string;
  legalId: string;
  phone: string;
  email: string;
  products: Omit<Product, "id" | "active">[];
}

// Deterministic seeds for generateSalesForProducts — one per vertical, distinct
// from the café's, so switching presets always reproduces the same demo data.
export const PRESET_SEEDS: Record<BusinessPresetId, number> = {
  cafeteria: 20260727,
  tenis: 20260810,
  reparacion: 20260811,
};

export const BUSINESS_PRESETS: Record<BusinessPresetId, BusinessPreset> = {
  cafeteria: {
    id: "cafeteria",
    label: "Cafetería / Restaurante",
    businessName: "Café El Alumbre",
    businessType: "Cafetería / Emprendimiento",
    legalId: "3-102-789456",
    phone: "+506 8888-1234",
    email: "contacto@cafeelalumbre.com",
    products: [
      { name: "Café americano", emoji: "☕", price: 2000, category: "Bebidas calientes" },
      { name: "Cappuccino", emoji: "☕", price: 2500, category: "Bebidas calientes" },
      { name: "Croissant", emoji: "🥐", price: 2000, category: "Repostería" },
      { name: "Rebanada de pastel", emoji: "🍰", price: 3000, category: "Repostería" },
      { name: "Refresco", emoji: "🥤", price: 1500, category: "Bebidas frías" },
    ],
  },
  tenis: {
    id: "tenis",
    label: "Tienda virtual de tenis",
    businessName: "Kickz CR",
    businessType: "Tienda virtual de calzado deportivo",
    legalId: "3-101-654321",
    phone: "+506 8777-4321",
    email: "ventas@kickzcr.com",
    products: [
      { name: "Tenis running", emoji: "👟", price: 45000, category: "Running" },
      { name: "Tenis urbanos", emoji: "👟", price: 38000, category: "Urbano" },
      { name: "Tenis básquetbol", emoji: "👟", price: 65000, category: "Básquetbol" },
      { name: "Medias deportivas", emoji: "🧦", price: 3500, category: "Accesorios" },
      { name: "Cordones de repuesto", emoji: "🪢", price: 1500, category: "Accesorios" },
      { name: "Kit de limpieza para tenis", emoji: "🧴", price: 6000, category: "Accesorios" },
    ],
  },
  reparacion: {
    id: "reparacion",
    label: "Reparación de equipos electrónicos",
    businessName: "TecnoFix CR",
    businessType: "Reparación de equipos electrónicos",
    legalId: "3-101-987654",
    phone: "+506 8666-9876",
    email: "soporte@tecnofixcr.com",
    products: [
      { name: "Diagnóstico general", emoji: "🔍", price: 5000, category: "Diagnóstico" },
      { name: "Cambio de pantalla celular", emoji: "📱", price: 35000, category: "Reparación de celulares" },
      { name: "Cambio de batería", emoji: "🔋", price: 18000, category: "Reparación de celulares" },
      { name: "Reparación de laptop", emoji: "💻", price: 45000, category: "Reparación de laptops" },
      { name: "Limpieza interna de equipo", emoji: "🧹", price: 8000, category: "Mantenimiento" },
      { name: "Instalación de software", emoji: "🛠️", price: 6000, category: "Soporte técnico" },
    ],
  },
};
