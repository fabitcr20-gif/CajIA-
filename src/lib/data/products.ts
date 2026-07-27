import { Product } from "@/lib/types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Café americano",
    emoji: "☕",
    price: 2000,
    category: "Bebidas calientes",
    active: true,
  },
  {
    id: "p2",
    name: "Cappuccino",
    emoji: "☕",
    price: 2500,
    category: "Bebidas calientes",
    active: true,
  },
  {
    id: "p3",
    name: "Croissant",
    emoji: "🥐",
    price: 2000,
    category: "Repostería",
    active: true,
  },
  {
    id: "p4",
    name: "Rebanada de pastel",
    emoji: "🍰",
    price: 3000,
    category: "Repostería",
    active: true,
  },
  {
    id: "p5",
    name: "Refresco",
    emoji: "🥤",
    price: 1500,
    category: "Bebidas frías",
    active: true,
  },
];
