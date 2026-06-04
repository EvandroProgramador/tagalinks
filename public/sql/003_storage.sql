-- TagaLinks — Migração 003: Storage Buckets
-- Executar no SQL Editor do Supabase APÓS as migrações 001 e 002

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('page-backgrounds', 'page-backgrounds', true);

create policy "public_read_avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "own_upload_avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own_update_avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own_delete_avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public_read_bg"
  on storage.objects for select using (bucket_id = 'page-backgrounds');
create policy "own_upload_bg"
  on storage.objects for insert
  with check (bucket_id = 'page-backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own_delete_bg"
  on storage.objects for delete
  using (bucket_id = 'page-backgrounds' and auth.uid()::text = (storage.foldername(name))[1]);
