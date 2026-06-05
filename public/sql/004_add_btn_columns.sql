-- Migração 004: Adiciona colunas de personalização de botões se não existirem
-- Executar no SQL Editor do Supabase (seguro correr mesmo que já existam)

alter table link_pages
  add column if not exists custom_btn_style  text    default 'solid',
  add column if not exists custom_btn_shape  text    default 'rounded',
  add column if not exists custom_btn_shadow boolean default false;
