-- CajIA — esquema de base de datos en Supabase
--
-- Cómo usar: copia todo este archivo y pégalo en Supabase → SQL Editor →
-- "New query" → Run. Es seguro volver a ejecutarlo (usa IF NOT EXISTS /
-- OR REPLACE donde aplica).
--
-- Modelo de acceso: sin cuentas visibles. Cada navegador recibe una sesión
-- anónima real de Supabase Auth (auth.uid()), y Row Level Security asegura
-- que cada dispositivo solo pueda leer/escribir sus propios datos —
-- ninguna fila es accesible entre dispositivos distintos.

-- ============================================================
-- Tabla: businesses (un registro por dispositivo/sesión anónima)
-- ============================================================
create table if not exists public.businesses (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null,
  business_type text not null,
  currency text not null default '₡ CRC',
  legal_id text not null default '',
  phone text not null default '',
  email text not null default '',
  payment_methods jsonb not null default '["efectivo","tarjeta","sinpe"]'::jsonb,
  delivery_enabled boolean not null default false,
  business_preset_id text not null default 'cafeteria',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

drop policy if exists "businesses_select_own" on public.businesses;
create policy "businesses_select_own" on public.businesses
  for select using (id = auth.uid());

drop policy if exists "businesses_insert_own" on public.businesses;
create policy "businesses_insert_own" on public.businesses
  for insert with check (id = auth.uid());

drop policy if exists "businesses_update_own" on public.businesses;
create policy "businesses_update_own" on public.businesses
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================
-- Tabla: products
-- ============================================================
create table if not exists public.products (
  id text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  emoji text not null default '',
  price numeric not null default 0,
  category text not null default '',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists products_business_id_idx on public.products (business_id);

alter table public.products enable row level security;

drop policy if exists "products_all_own" on public.products;
create policy "products_all_own" on public.products
  for all using (business_id = auth.uid()) with check (business_id = auth.uid());

-- ============================================================
-- Tabla: sales
-- ============================================================
create table if not exists public.sales (
  id text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  date text not null,
  timestamp text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  method text not null,
  label text not null default '',
  status text not null default 'entregado',
  payment_status text not null default 'pagado',
  discount numeric,
  delivery jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists sales_business_id_idx on public.sales (business_id);
create index if not exists sales_business_date_idx on public.sales (business_id, date);

alter table public.sales enable row level security;

drop policy if exists "sales_all_own" on public.sales;
create policy "sales_all_own" on public.sales
  for all using (business_id = auth.uid()) with check (business_id = auth.uid());

-- ============================================================
-- Tabla: returns (devoluciones)
-- ============================================================
create table if not exists public.returns (
  id text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  sale_id text not null,
  type text not null,
  reason text not null default '',
  date text not null,
  amount numeric not null default 0,
  product_id text,
  notes text,
  updated_at timestamptz not null default now()
);

create index if not exists returns_business_id_idx on public.returns (business_id);

alter table public.returns enable row level security;

drop policy if exists "returns_all_own" on public.returns;
create policy "returns_all_own" on public.returns
  for all using (business_id = auth.uid()) with check (business_id = auth.uid());

-- ============================================================
-- Tabla: history_events (historial)
-- ============================================================
create table if not exists public.history_events (
  id text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  type text not null,
  timestamp text not null,
  description text not null default '',
  sale_id text,
  updated_at timestamptz not null default now()
);

create index if not exists history_events_business_id_idx on public.history_events (business_id);

alter table public.history_events enable row level security;

drop policy if exists "history_events_all_own" on public.history_events;
create policy "history_events_all_own" on public.history_events
  for all using (business_id = auth.uid()) with check (business_id = auth.uid());

-- ============================================================
-- Tabla: saved_reports (Mis informes)
-- ============================================================
create table if not exists public.saved_reports (
  id text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  type text not null,
  title text not null default '',
  date text not null,
  total numeric not null default 0,
  period_key text not null,
  updated_at timestamptz not null default now()
);

create index if not exists saved_reports_business_id_idx on public.saved_reports (business_id);

alter table public.saved_reports enable row level security;

drop policy if exists "saved_reports_all_own" on public.saved_reports;
create policy "saved_reports_all_own" on public.saved_reports
  for all using (business_id = auth.uid()) with check (business_id = auth.uid());
