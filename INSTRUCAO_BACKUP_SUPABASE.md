# Instrução para Claude Code — Backup da base de dados Supabase

> **Objetivo:** gerar um backup completo e **restaurável** (schema + dados) da base de
> dados Supabase remota de um projeto, sem depender de Docker.

Cola esta instrução no Claude Code **dentro do repositório do projeto** que queres
fazer backup. O projeto tem de estar **linkado** ao Supabase (existe pasta `supabase/`
com `.temp/project-ref`). Se não estiver, corre primeiro `supabase link`.

---

## Contexto / porquê esta abordagem

O comando oficial `supabase db dump` **exige Docker** (usa uma imagem com `pg_dump`).
Em máquinas sem Docker isso falha com:
`Cannot connect to the Docker daemon ... Is the docker daemon running?`

A alternativa mais leve é instalar **só o cliente `pg_dump`** (via Homebrew `libpq`) e
fazer o dump **diretamente** pela connection string (pooler) do projeto. Funciona sem
Docker e é rápido.

> ⚠️ **Roles não são incluídos.** O `pg_dump` direto não consegue dumpar roles/globals
> (precisa de superuser, que o utilizador da pooler do Supabase não tem). Se precisares
> mesmo dos roles, só pela via Docker + `supabase db dump --role-only`.

---

## Pré-requisitos (uma vez por máquina)

1. **Homebrew** instalado (`brew --version`).
2. **Cliente pg_dump** — instala o `libpq` (traz `pg_dump`, sem precisar do servidor):
   ```bash
   brew install libpq
   ```
   O binário fica em `/usr/local/opt/libpq/bin/pg_dump` (Intel) ou
   `/opt/homebrew/opt/libpq/bin/pg_dump` (Apple Silicon). A compilação pode demorar
   alguns minutos.

   > A versão do `pg_dump` deve ser **≥** à do servidor. `pg_dump` 18 dumpa servidores
   > 15/16/17 sem problema.

---

## Dados de ligação (descobrir no próprio projeto)

```bash
# project ref (ex.: bwncslvepldzqsbakjsa)
cat supabase/.temp/project-ref

# host/user da pooler (a password vem MASCARADA aqui — só serve para ver o host)
cat supabase/.temp/pooler-url

# versão do Postgres do servidor (confirma que o pg_dump é >= a isto)
cat supabase/.temp/postgres-version
```

A connection string da pooler tem este formato (sem a password):
```
postgresql://postgres.<PROJECT_REF>@aws-0-<REGIAO>.pooler.supabase.com:5432/postgres
```

A **password da base de dados** está no dashboard do Supabase em:
**Project Settings → Database → Database password** (podes fazer reset aí se não a tiveres).

> A porta **5432** é a pooler em *session mode* — suporta `pg_dump`. (Não uses a 6543,
> que é *transaction mode* e não serve para dumps.)

---

## Passos do backup

> Substitui `<PROJECT_REF>`, `<REGIAO>` e `<PASSWORD>` pelos valores reais.

```bash
# 1) Preparar pasta e timestamp
mkdir -p supabase/backups
TS=$(date +%Y%m%d_%H%M%S)

# 2) pg_dump no PATH + password por variável de ambiente (não fica nos argumentos)
export PATH="/usr/local/opt/libpq/bin:/opt/homebrew/opt/libpq/bin:$PATH"
export PGPASSWORD='<PASSWORD>'

CONN="postgresql://postgres.<PROJECT_REF>@aws-0-<REGIAO>.pooler.supabase.com:5432/postgres"

# 3) Dump COMPLETO (schema + dados) — artefacto principal de restauro
pg_dump "$CONN" --no-owner --no-privileges -f "supabase/backups/${TS}_full.sql"

# 4) (opcional) só schema e só dados, em ficheiros separados
pg_dump "$CONN" --schema-only --no-owner --no-privileges -f "supabase/backups/${TS}_schema.sql"
pg_dump "$CONN" --data-only   --no-owner --no-privileges -f "supabase/backups/${TS}_data.sql"
```

---

## Verificação

```bash
TS=<o_timestamp_usado>
ls -lh supabase/backups/${TS}_*.sql                       # ficheiros > 0 bytes
grep -c 'CREATE TABLE' supabase/backups/${TS}_full.sql    # nº de tabelas > 0
grep -c '^COPY '       supabase/backups/${TS}_full.sql    # nº de blocos de dados > 0
head -8  supabase/backups/${TS}_full.sql                  # cabeçalho "PostgreSQL database dump"
tail -3  supabase/backups/${TS}_full.sql                  # termina limpo (\unrestrict ...)
```

---

## Não committar os dumps

Os ficheiros contêm **dados reais**. Adiciona ao `.gitignore`:
```
# Supabase database backups (contêm dados reais — nunca committar)
supabase/backups/
```
Confirma: `git check-ignore -v supabase/backups/<TS>_full.sql`

---

## Restaurar (quando precisares)

Usa sempre o `_full.sql`:
```bash
export PGPASSWORD='<PASSWORD>'
psql "postgresql://postgres.<PROJECT_REF>@aws-0-<REGIAO>.pooler.supabase.com:5432/postgres" \
  -f supabase/backups/<TS>_full.sql
```

> Se algum dia restaurares a partir do `_data.sql` **isolado**, podes precisar de
> `--disable-triggers` por causa de eventuais **foreign keys circulares** entre tabelas.
> O `_full.sql` não tem esse problema (cria estrutura e dados na ordem certa).
