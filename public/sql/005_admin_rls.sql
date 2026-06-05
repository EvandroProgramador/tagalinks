-- Migração 005: Políticas RLS para role admin
-- Executar no SQL Editor do Supabase

-- Função helper segura para verificar se o utilizador actual é admin
create or replace function is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles: admin lê e actualiza todos os perfis
create policy "admin_read_profiles"   on profiles for select using (is_admin());
create policy "admin_update_profiles" on profiles for update using (is_admin());

-- Link pages: admin lê todas as páginas
create policy "admin_read_pages" on link_pages for select using (is_admin());

-- Link items: admin lê todos os blocos
create policy "admin_read_items" on link_items for select using (is_admin());

-- Page views: admin lê toda a analytics
create policy "admin_read_views" on page_views for select using (is_admin());

-- Link clicks: admin lê todos os cliques
create policy "admin_read_clicks" on link_clicks for select using (is_admin());

-- Subscriptions: admin lê e actualiza todas as subscrições
create policy "admin_read_subs"   on subscriptions for select using (is_admin());
create policy "admin_update_subs" on subscriptions for update using (is_admin());
