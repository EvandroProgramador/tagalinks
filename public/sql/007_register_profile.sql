-- TagaLinks — Migração 007: Cadastro explícito no servidor
-- Executar no SQL Editor do Supabase APÓS as migrações anteriores.
--
-- Objectivo: garantir que uma sessão autenticada (incluindo login via Google)
-- NÃO cria conta automaticamente. A criação de perfil deixa de ser um INSERT
-- directo do cliente e passa a ser uma operação explícita de cadastro, feita
-- por uma única função SECURITY DEFINER. O login nunca cria perfil; apenas
-- o cadastro chama esta função.

-- 1) Remover a policy que permitia ao cliente inserir o próprio perfil.
--    Sem ela, nenhum cliente consegue inserir em profiles directamente —
--    a única via passa a ser a função register_profile abaixo.
drop policy if exists "own_insert_profile" on profiles;

-- 2) Função de cadastro. Valida a sessão, impede contas duplicadas,
--    garante username único e cria o perfil + página inicial.
create or replace function public.register_profile(
  p_name       text,
  p_username   text,
  p_phone      text default null,
  p_avatar_url text default null
)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text := auth.jwt() ->> 'email';
  v_profile profiles;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  -- Já existe conta para este utilizador autenticado?
  if exists (select 1 from profiles where id = v_uid) then
    raise exception 'PROFILE_EXISTS' using errcode = '23505';
  end if;

  -- Username já ocupado por outra conta?
  if exists (select 1 from profiles where username = p_username) then
    raise exception 'USERNAME_TAKEN' using errcode = '23505';
  end if;

  insert into profiles (id, name, email, phone, username, avatar_url, plan, role)
  values (v_uid, p_name, v_email, nullif(p_phone, ''), p_username, p_avatar_url, 'free', 'user')
  returning * into v_profile;

  insert into link_pages (profile_id, slug, title, published)
  values (v_uid, p_username, p_name, false);

  return v_profile;
end;
$$;

-- 3) Só utilizadores autenticados podem chamar o cadastro.
revoke all on function public.register_profile(text, text, text, text) from public;
grant execute on function public.register_profile(text, text, text, text) to authenticated;
