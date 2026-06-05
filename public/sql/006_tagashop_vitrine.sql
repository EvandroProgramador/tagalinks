-- Migração 006: Adiciona suporte completo a TagaShop e bloco Vitrine
-- Executar no SQL Editor do Supabase

-- 1. Adiciona colunas TagaShop ao perfil
alter table profiles
  add column if not exists tagashop_api_key    text,
  add column if not exists tagashop_store_name text;

-- 2. Adiciona 'vitrine' ao enum de tipos de link
alter type link_item_type add value if not exists 'vitrine';

-- 3. Adiciona colunas do bloco Vitrine à tabela link_items
alter table link_items
  add column if not exists vitrine_title         text,
  add column if not exists vitrine_layout        text default 'list',
  add column if not exists vitrine_max_products  integer default 6,
  add column if not exists vitrine_only_featured boolean default false;
