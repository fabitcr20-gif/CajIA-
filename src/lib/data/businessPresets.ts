import { Product } from "@/lib/types";

export interface BusinessPreset {
  label: string;
  description: string;
  businessName: string;
  businessType: string;
  legalId: string;
  phone: string;
  email: string;
  productsLabel: string;
  productsLabelSingular: string;
  products: Omit<Product, "id" | "active">[];
}

// The catalog is the single source of truth for every business vertical
// CajIA can adapt to. Adding a new vertical (a new key here, with its own
// product list) is the only change needed anywhere in the app — the
// onboarding screen, the Configuración selector, and the demo data
// generator all read this object and pick it up automatically.
export const BUSINESS_PRESETS = {
  cafeteria: {
    label: "Cafetería / Restaurante",
    description: "Bebidas, repostería y comida para servir en el momento.",
    businessName: "Café El Alumbre",
    businessType: "Cafetería / Emprendimiento",
    legalId: "3-102-789456",
    phone: "+506 8888-1234",
    email: "contacto@cafeelalumbre.com",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Café americano", emoji: "☕", price: 2000, category: "Bebidas calientes" },
      { name: "Cappuccino", emoji: "☕", price: 2500, category: "Bebidas calientes" },
      { name: "Croissant", emoji: "🥐", price: 2000, category: "Repostería" },
      { name: "Rebanada de pastel", emoji: "🍰", price: 3000, category: "Repostería" },
      { name: "Refresco", emoji: "🥤", price: 1500, category: "Bebidas frías" },
    ],
  },
  tenis: {
    label: "Tienda de tenis",
    description: "Calzado deportivo y accesorios, ideal para ventas por redes sociales.",
    businessName: "Kickz CR",
    businessType: "Tienda virtual de calzado deportivo",
    legalId: "3-101-654321",
    phone: "+506 8777-4321",
    email: "ventas@kickzcr.com",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Tenis running", emoji: "👟", price: 45000, category: "Running" },
      { name: "Tenis urbanos", emoji: "👟", price: 38000, category: "Urbano" },
      { name: "Tenis básquetbol", emoji: "👟", price: 65000, category: "Básquetbol" },
      { name: "Medias deportivas", emoji: "🧦", price: 3500, category: "Accesorios" },
      { name: "Cordones de repuesto", emoji: "🪢", price: 1500, category: "Accesorios" },
      { name: "Kit de limpieza para tenis", emoji: "🧴", price: 6000, category: "Accesorios" },
    ],
  },
  ropa: {
    label: "Tienda de ropa",
    description: "Prendas de vestir, ideal para catálogos por Instagram o WhatsApp.",
    businessName: "Closet CR",
    businessType: "Tienda virtual de ropa",
    legalId: "3-101-159753",
    phone: "+506 8333-1597",
    email: "pedidos@closetcr.com",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Camisa casual", emoji: "👔", price: 18000, category: "Camisas" },
      { name: "Blusa estampada", emoji: "👚", price: 15000, category: "Blusas" },
      { name: "Jeans", emoji: "👖", price: 25000, category: "Pantalones" },
      { name: "Vestido de verano", emoji: "👗", price: 22000, category: "Vestidos" },
      { name: "Chaqueta liviana", emoji: "🧥", price: 32000, category: "Abrigos" },
      { name: "Gorra", emoji: "🧢", price: 8000, category: "Accesorios" },
    ],
  },
  cosmeticos: {
    label: "Cosméticos",
    description: "Maquillaje y cuidado personal por catálogo o redes sociales.",
    businessName: "Glow Beauty CR",
    businessType: "Tienda virtual de cosméticos",
    legalId: "3-101-753159",
    phone: "+506 8222-7531",
    email: "ventas@glowbeautycr.com",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Base líquida", emoji: "💄", price: 14000, category: "Rostro" },
      { name: "Labial mate", emoji: "💋", price: 6500, category: "Labios" },
      { name: "Paleta de sombras", emoji: "🎨", price: 16000, category: "Ojos" },
      { name: "Rímel", emoji: "👁️", price: 7000, category: "Ojos" },
      { name: "Crema hidratante", emoji: "🧴", price: 12000, category: "Cuidado facial" },
      { name: "Set de brochas", emoji: "🖌️", price: 18000, category: "Herramientas" },
    ],
  },
  accesorios: {
    label: "Accesorios",
    description: "Bisutería, bolsos y complementos de moda.",
    businessName: "Brillo CR",
    businessType: "Tienda virtual de accesorios",
    legalId: "3-101-951753",
    phone: "+506 8111-9517",
    email: "hola@brillocr.com",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Collar dorado", emoji: "📿", price: 9500, category: "Collares" },
      { name: "Aretes de perla", emoji: "💎", price: 7500, category: "Aretes" },
      { name: "Pulsera ajustable", emoji: "⭐", price: 5500, category: "Pulseras" },
      { name: "Bolso de mano", emoji: "👜", price: 28000, category: "Bolsos" },
      { name: "Reloj minimalista", emoji: "⌚", price: 32000, category: "Relojes" },
      { name: "Lentes de sol", emoji: "🕶️", price: 15000, category: "Lentes" },
    ],
  },
  reposteria: {
    label: "Repostería",
    description: "Postres y pedidos por encargo, ideal para negocios desde casa.",
    businessName: "Dulce Rincón",
    businessType: "Repostería por encargo",
    legalId: "3-101-357951",
    phone: "+506 8999-3579",
    email: "pedidos@dulcerincon.cr",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Torta de chocolate", emoji: "🍫", price: 18000, category: "Tortas" },
      { name: "Cheesecake de fresa", emoji: "🍰", price: 20000, category: "Tortas" },
      { name: "Cupcakes (docena)", emoji: "🧁", price: 12000, category: "Cupcakes" },
      { name: "Galletas decoradas (docena)", emoji: "🍪", price: 9000, category: "Galletas" },
      { name: "Brownies (6 unidades)", emoji: "🍫", price: 7000, category: "Postres" },
      { name: "Pie de limón", emoji: "🥧", price: 14000, category: "Tortas" },
    ],
  },
  servicios: {
    label: "Servicios",
    description: "Citas y servicios por sesión: salón, spa, consultoría, clases.",
    businessName: "Salón Bella Vida",
    businessType: "Salón de belleza y estética",
    legalId: "3-101-321987",
    phone: "+506 8555-6543",
    email: "citas@bellavida.cr",
    productsLabel: "Servicios",
    productsLabelSingular: "servicio",
    products: [
      { name: "Corte de cabello", emoji: "💇", price: 8000, category: "Cabello" },
      { name: "Tinte", emoji: "🎨", price: 25000, category: "Cabello" },
      { name: "Manicure", emoji: "💅", price: 9000, category: "Uñas" },
      { name: "Pedicure", emoji: "🦶", price: 10000, category: "Uñas" },
      { name: "Depilación con cera", emoji: "✨", price: 12000, category: "Bienestar" },
      { name: "Masaje relajante", emoji: "💆", price: 20000, category: "Bienestar" },
    ],
  },
  reparacion: {
    label: "Taller de reparación",
    description: "Diagnóstico, reparación y mantenimiento de equipos.",
    businessName: "TecnoFix CR",
    businessType: "Taller de reparación de equipos electrónicos",
    legalId: "3-101-987654",
    phone: "+506 8666-9876",
    email: "soporte@tecnofixcr.com",
    productsLabel: "Servicios",
    productsLabelSingular: "servicio",
    products: [
      { name: "Diagnóstico general", emoji: "🔍", price: 5000, category: "Diagnóstico" },
      { name: "Cambio de pantalla celular", emoji: "📱", price: 35000, category: "Reparación de celulares" },
      { name: "Cambio de batería", emoji: "🔋", price: 18000, category: "Reparación de celulares" },
      { name: "Reparación de laptop", emoji: "💻", price: 45000, category: "Reparación de laptops" },
      { name: "Limpieza interna de equipo", emoji: "🧹", price: 8000, category: "Mantenimiento" },
      { name: "Instalación de software", emoji: "🛠️", price: 6000, category: "Soporte técnico" },
    ],
  },
  otro: {
    label: "Otro",
    description: "Un negocio genérico para personalizar desde cero.",
    businessName: "Ferretería El Vecino",
    businessType: "Ferretería / Negocio local",
    legalId: "3-101-456789",
    phone: "+506 8444-3210",
    email: "contacto@ferreteriaelvecino.cr",
    productsLabel: "Productos",
    productsLabelSingular: "producto",
    products: [
      { name: "Tornillos surtidos", emoji: "🔩", price: 1500, category: "Ferretería" },
      { name: "Pintura (galón)", emoji: "🎨", price: 12000, category: "Pintura" },
      { name: "Cinta métrica", emoji: "📏", price: 3500, category: "Herramientas" },
      { name: "Foco LED", emoji: "💡", price: 2500, category: "Eléctrico" },
      { name: "Cable eléctrico (metro)", emoji: "🔌", price: 1200, category: "Eléctrico" },
      { name: "Candado", emoji: "🔒", price: 4500, category: "Seguridad" },
    ],
  },
} satisfies Record<string, BusinessPreset>;

export type BusinessPresetId = keyof typeof BUSINESS_PRESETS;

// Deterministic seeds for generateSalesForProducts — one per vertical, so
// switching presets always reproduces the same-looking demo data.
export const PRESET_SEEDS: Record<BusinessPresetId, number> = {
  cafeteria: 20260727,
  tenis: 20260810,
  ropa: 20260814,
  cosmeticos: 20260815,
  accesorios: 20260816,
  reposteria: 20260817,
  servicios: 20260812,
  reparacion: 20260811,
  otro: 20260813,
};
