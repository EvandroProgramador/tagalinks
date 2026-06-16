-- TagaLinks — Migração 008: Eliminação de conta pelo admin
-- Executar no SQL Editor do Supabase APÓS as migrações anteriores.
--
-- Permite que um admin elimine por completo qualquer conta. Apaga o registo
-- em auth.users; como profiles.id referencia auth.users ON DELETE CASCADE
-- (e link_pages/link_items/page_views/link_clicks/subscriptions referenciam
-- profiles em cascata), toda a informação do utilizador é removida de uma vez,
-- incluindo o próprio acesso (login).
--
-- É uma função SECURITY DEFINER (corre com privilégios do owner) porque o
-- cliente não tem permissões sobre o schema auth. A autorização é verificada
-- com is_admin().

create or replace function public.admin_delete_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  -- Um admin não pode eliminar a própria conta por esta via.
  if target_id = auth.uid() then
    raise exception 'CANNOT_DELETE_SELF' using errcode = '42501';
  end if;

  delete from auth.users where id = target_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
