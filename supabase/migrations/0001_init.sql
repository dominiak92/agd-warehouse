-- =====================================================================
-- AMILO AGD — schemat bazy (magazyn używanego sprzętu AGD)
-- Wklej całość w Supabase -> SQL Editor -> New query -> Run.
-- Idempotentne na tyle, na ile się da (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =====================================================================

-- ---------- ROZSZERZENIA ----------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------- ENUMY ----------
do $$ begin
  create type product_category as enum
    ('pralka','zmywarka','lodowka','piekarnik','suszarka','okap','mikrofalowka','plyta','ekspres','inne');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum
    ('w_magazynie','wystawione','zarezerwowane','sprzedane');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency_code as enum ('EUR','PLN');
exception when duplicate_object then null; end $$;

-- ---------- FUNKCJA: updated_at ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- TABELA: trips (wyjazdy / zakupy) ----------
create table if not exists trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date        date not null default current_date,
  location    text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists trips_user_id_idx on trips(user_id);

drop trigger if exists trips_set_updated_at on trips;
create trigger trips_set_updated_at
  before update on trips
  for each row execute function set_updated_at();

-- ---------- SEKWENCJA + FUNKCJA: SKU (AMILO-0001) ----------
-- Aplikacja jest jednoosobowa, więc globalna sekwencja jest wystarczająca.
create sequence if not exists product_sku_seq start 1;

create or replace function set_product_sku()
returns trigger as $$
begin
  if new.sku is null or new.sku = '' then
    new.sku := 'AMILO-' || lpad(nextval('product_sku_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- ---------- TABELA: products ----------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sku               text unique,
  name              text not null,
  category          product_category not null default 'inne',
  brand             text,
  model             text,
  purchase_price    numeric(12,2),
  purchase_currency currency_code not null default 'EUR',
  exchange_rate     numeric(10,4),
  listing_price     numeric(12,2),
  sale_price        numeric(12,2),
  sale_date         date,
  status            product_status not null default 'w_magazynie',
  olx_url           text,
  purchase_date     date,
  purchase_location text,
  trip_id           uuid references trips(id) on delete set null,
  condition_notes   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_user_id_idx  on products(user_id);
create index if not exists products_status_idx    on products(status);
create index if not exists products_trip_id_idx   on products(trip_id);
create index if not exists products_created_at_idx on products(created_at);

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists products_set_sku on products;
create trigger products_set_sku
  before insert on products
  for each row execute function set_product_sku();

-- ---------- TABELA: user_settings (globalny kurs EUR->PLN) ----------
create table if not exists user_settings (
  user_id               uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  default_exchange_rate numeric(10,4) not null default 4.30,
  default_currency      currency_code not null default 'EUR',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on user_settings;
create trigger user_settings_set_updated_at
  before update on user_settings
  for each row execute function set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY — dostęp wyłącznie do własnych wierszy
-- =====================================================================
alter table trips         enable row level security;
alter table products      enable row level security;
alter table user_settings enable row level security;

-- trips
drop policy if exists "trips_select" on trips;
create policy "trips_select" on trips for select using (auth.uid() = user_id);
drop policy if exists "trips_insert" on trips;
create policy "trips_insert" on trips for insert with check (auth.uid() = user_id);
drop policy if exists "trips_update" on trips;
create policy "trips_update" on trips for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "trips_delete" on trips;
create policy "trips_delete" on trips for delete using (auth.uid() = user_id);

-- products
drop policy if exists "products_select" on products;
create policy "products_select" on products for select using (auth.uid() = user_id);
drop policy if exists "products_insert" on products;
create policy "products_insert" on products for insert with check (auth.uid() = user_id);
drop policy if exists "products_update" on products;
create policy "products_update" on products for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "products_delete" on products;
create policy "products_delete" on products for delete using (auth.uid() = user_id);

-- user_settings
drop policy if exists "settings_select" on user_settings;
create policy "settings_select" on user_settings for select using (auth.uid() = user_id);
drop policy if exists "settings_insert" on user_settings;
create policy "settings_insert" on user_settings for insert with check (auth.uid() = user_id);
drop policy if exists "settings_update" on user_settings;
create policy "settings_update" on user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
