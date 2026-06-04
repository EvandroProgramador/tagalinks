-- TagaLinks — Migração 002: Row Level Security
-- Executar no SQL Editor do Supabase APÓS a migração 001

-- profiles
alter table profiles enable row level security;
create policy "public_read_profiles" on profiles for select using (true);
create policy "own_insert_profile"   on profiles for insert with check (auth.uid() = id);
create policy "own_update_profile"   on profiles for update using (auth.uid() = id);

-- link_pages
alter table link_pages enable row level security;
create policy "public_read_published" on link_pages for select using (published = true);
create policy "own_read_all"          on link_pages for select using (auth.uid() = profile_id);
create policy "own_insert"            on link_pages for insert with check (auth.uid() = profile_id);
create policy "own_update"            on link_pages for update using (auth.uid() = profile_id);
create policy "own_delete"            on link_pages for delete using (auth.uid() = profile_id);

-- link_items
alter table link_items enable row level security;
create policy "public_read_items" on link_items for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.published = true));
create policy "own_read_items"   on link_items for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));
create policy "own_insert_items" on link_items for insert
  with check (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));
create policy "own_update_items" on link_items for update
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));
create policy "own_delete_items" on link_items for delete
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));

-- page_views
alter table page_views enable row level security;
create policy "service_insert_views" on page_views for insert with check (true);
create policy "own_read_views"       on page_views for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));

-- link_clicks
alter table link_clicks enable row level security;
create policy "service_insert_clicks" on link_clicks for insert with check (true);
create policy "own_read_clicks"       on link_clicks for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));

-- subscriptions
alter table subscriptions enable row level security;
create policy "own_read_subs"  on subscriptions for select using (auth.uid() = profile_id);
create policy "service_insert" on subscriptions for insert with check (true);
create policy "service_update" on subscriptions for update using (true);

