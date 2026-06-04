-- TagaLinks — Migração 001: Schema principal
-- Executar no SQL Editor do Supabase

create extension if not exists "uuid-ossp";

create type subscription_plan as enum ('free', 'creator', 'business');

create type link_item_type as enum (
  'link', 'product', 'tagashop', 'whatsapp', 'social', 'divider',
  'header', 'youtube', 'email', 'phone'
);

create type social_network as enum (
  'instagram', 'tiktok', 'youtube', 'facebook',
  'twitter', 'linkedin', 'snapchat', 'telegram', 'spotify'
);

create type subscription_status as enum ('active', 'cancelled', 'expired', 'trial');

-- Tabela profiles
create table profiles (
  id             uuid references auth.users on delete cascade primary key,
  name           text not null,
  email          text unique not null,
  phone          text,
  username       text unique,
  avatar_url     text,
  plan           subscription_plan not null default 'free',
  sub_status     subscription_status default 'active',
  sub_expires_at timestamptz,
  tagashop_slug    text,
  role           text not null default 'user',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table profiles add constraint username_format
  check (username ~ '^[a-zA-Z0-9_-]{3,30}$');

-- Tabela link_pages
create table link_pages (
  id             uuid default uuid_generate_v4() primary key,
  profile_id     uuid references profiles(id) on delete cascade not null,
  slug           text unique not null,
  title          text not null default '',
  bio            text default '',
  avatar_url     text,
  youtube_url    text,
  youtube_title  text,
  theme_preset   text default 'tagatech',
  custom_bg_color      text,
  custom_primary_color text,
  custom_accent_color  text,
  custom_text_color    text,
  custom_font          text default 'Inter',
  custom_bg_type       text default 'solid',
  custom_bg_gradient   text,
  custom_bg_image_url  text,
  published      boolean default false,
  seo_title      text,
  seo_description text,
  whatsapp_number  text,
  whatsapp_message text,
  custom_btn_style  text default 'solid',
  custom_btn_shape  text default 'rounded',
  custom_btn_shadow boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index idx_link_pages_slug    on link_pages(slug);
create index idx_link_pages_profile on link_pages(profile_id);

-- Tabela link_items
create table link_items (
  id               uuid default uuid_generate_v4() primary key,
  page_id          uuid references link_pages(id) on delete cascade not null,
  type             link_item_type not null default 'link',
  label            text not null default '',
  url              text,
  position         integer not null default 0,
  visible          boolean default true,
  icon             text,
  social_network   social_network,
  tagashop_product_id text,
  product_price    numeric,
  product_image_url text,
  youtube_url      text,
  youtube_title    text,
  custom_bg_color  text,
  custom_text_color text,
  custom_border_color text,
  custom_style     text default 'solid',
  thumbnail_url    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index idx_link_items_page     on link_items(page_id);
create index idx_link_items_position on link_items(page_id, position);

-- Tabela page_views
create table page_views (
  id          uuid default uuid_generate_v4() primary key,
  page_id     uuid references link_pages(id) on delete cascade not null,
  referrer    text,
  country     text,
  device      text,
  session_id  text,
  created_at  timestamptz default now()
);

create index idx_page_views_page on page_views(page_id);
create index idx_page_views_date on page_views(page_id, created_at);

-- Tabela link_clicks
create table link_clicks (
  id           uuid default uuid_generate_v4() primary key,
  link_item_id uuid references link_items(id) on delete cascade not null,
  page_id      uuid references link_pages(id) on delete cascade not null,
  session_id   text,
  created_at   timestamptz default now()
);

create index idx_link_clicks_item on link_clicks(link_item_id);
create index idx_link_clicks_page on link_clicks(page_id);
create index idx_link_clicks_date on link_clicks(page_id, created_at);

-- Tabela subscriptions
create table subscriptions (
  id               uuid default uuid_generate_v4() primary key,
  profile_id       uuid references profiles(id) on delete cascade not null,
  plan             subscription_plan not null,
  status           subscription_status not null default 'active',
  appypay_ref      text unique,
  appypay_order_id text,
  amount           numeric not null,
  period_start     timestamptz not null default now(),
  period_end       timestamptz not null,
  created_at       timestamptz default now()
);

create index idx_subscriptions_profile on subscriptions(profile_id);

