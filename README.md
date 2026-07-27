# CajIA

Tu caja. Tus ventas. Tu negocio.

CajIA is an MVP demo of a point-of-sale and cash-closing web app for small
businesses (built around a "Café El Alumbre" demo cafetería). It's a
responsive Next.js app with realistic demo data, a simulated AI closure
analysis, and real PDF report generation.

## Screens

- **Login / bienvenida** — demo entry point
- **Dashboard** — today's summary, weekly sales chart, payment methods, recent activity
- **Nueva venta (POS)** — product grid, cart, payment method, sale confirmation
- **Ventas** — sales history with date filters
- **Cierres** — daily and monthly cash closing with an AI-generated analysis
- **Estadísticas** — KPIs and charts across date ranges
- **Productos** — product catalog
- **Informes** — saved closure reports (PDF download, simulated Google Drive export)
- **Configuración** — business settings

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `src/lib/types.ts` — shared domain types
- `src/lib/data/` — demo product catalog and a seeded 45-day sales generator
- `src/lib/store.ts` — Zustand store (persisted to localStorage) for sales, products, settings, saved reports
- `src/lib/selectors.ts` — pure data aggregation helpers (totals, breakdowns, date ranges)
- `src/lib/services/aiService.ts` — closure analysis; runs on a local template today, structured so a real Gemini API call is a single-function swap
- `src/lib/services/pdfService.ts` — real PDF generation via jsPDF with an embedded Unicode font (so ₡ and Spanish accents render correctly)
- `src/lib/services/driveService.ts` — simulated Google Drive export, ready to be replaced with real OAuth + Drive API calls
- `src/components/ui/` — shared UI primitives (Card, Button, Modal, StatCard, Badge)
- `src/components/layout/` — responsive shell: sidebar on tablet/desktop, bottom nav + POS shortcut on mobile
- `src/components/charts/` — Recharts-based chart components
- `src/app/(app)/*` — one route per screen, wrapped by the authenticated app shell
