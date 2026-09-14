-- Agentic e-commerce schema. Apply with: supabase db reset  (local)  |  psql < supabase/schema.sql (hosted)
-- Mirrors src/types/ecom.ts — keep them in sync (or run `supabase gen types`).

create extension if not exists "pgcrypto";

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ── Catalog ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  parent_id  uuid references public.categories(id) on delete set null
);

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text not null default '',
  sku               text not null unique,
  brand             text,
  price             numeric(12,2) not null check (price >= 0),
  compare_at_price  numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  currency          char(3) not null default 'USD',
  stock             integer not null default 0 check (stock >= 0),
  rating            numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  review_count      integer not null default 0 check (review_count >= 0),
  images            text[] not null default '{}',
  attributes        jsonb not null default '{}'::jsonb,
  faqs              jsonb not null default '[]'::jsonb,
  category_id       uuid references public.categories(id) on delete set null,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- full-text search column used by listProducts({ q })
  search            tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored
);
create index if not exists products_search_idx on public.products using gin (search);
create index if not exists products_active_created_idx on public.products (is_active, created_at desc);
create index if not exists products_category_idx on public.products (category_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ── Inquiries (contact / product questions) ─────────────────────────────
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  product_id  uuid references public.products(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.inquiries  enable row level security;

-- profiles: owner reads own row; admins read all
drop policy if exists profiles_self_read  on public.profiles;
create policy profiles_self_read  on public.profiles for select using (id = auth.uid() or public.is_admin());

-- categories / products: public read (active only for anon), admin full write
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (is_active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all using (public.is_admin()) with check (public.is_admin());

-- inquiries: anyone may create; only admins may read
drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert on public.inquiries for insert with check (true);
drop policy if exists inquiries_admin_read on public.inquiries;
create policy inquiries_admin_read on public.inquiries for select using (public.is_admin());

-- PostgREST needs explicit grants in addition to RLS
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.categories, public.products, public.inquiries to authenticated;
