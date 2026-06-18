# TagaLinks — Instruções Completas para Claude Code
# Plataforma de bio-link angolana integrada no ecossistema TAGATECH

> Executa cada secção na ordem indicada. Não perguntes nada — constrói tudo de forma autónoma.
> Sempre que um passo pedir para "criar o ficheiro X", cria-o mesmo que já exista (usa write/overwrite).
> Não parares a meio de uma secção — completa o passo inteiro antes de passar ao seguinte.

---

## CONTEXTO DO PROJECTO

**TagaLinks** é a plataforma de bio-link do ecossistema TAGATECH para Angola.
O criador cria uma conta, configura a sua página, partilha um único link na bio do Instagram/TikTok/WhatsApp — quem clica vê todos os produtos, redes sociais, vídeo de apresentação e contactos.

### Stack (igual à TagaShop — reutiliza padrões conhecidos)
| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Estilo | Tailwind CSS v3 + design system TAGATECH |
| Backend | Supabase (Auth + PostgreSQL + Storage + RLS + Edge Functions) |
| Estado global | Zustand |
| Roteamento | React Router v6 |
| Formulários | React Hook Form |
| Notificações UI | react-hot-toast |
| SEO / OG | react-helmet-async |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Pagamentos | AppyPay (Kwanza / Multicaixa Express) |

### Design System TAGATECH
- **Cor primária:** `#7C3AED` (roxo TAGATECH)
- **Cor de destaque:** `#06B6D4` (ciano TAGATECH)
- **Gradiente principal:** `from-[#7C3AED] to-[#06B6D4]`
- **Fundo escuro padrão:** `#0A0A0F`
- **Superfície escura:** `#13131A`
- **Superfície elevada:** `#1C1C27`
- **Texto primário:** `#F8F8FF`
- **Texto secundário:** `#9B9BAA`
- **Borda sutil:** `#2A2A3A`
- Tema escuro por defeito, alternável
- Moeda: Kwanza (Kz) — formato `pt-PT`
- Logótipo: `public/logo.svg` via componente `<Logo />`
- Fonte: Inter (Google Fonts)
- Border-radius padrão: `rounded-xl` (12px) para cards, `rounded-2xl` para modais

### Planos do TagaLinks
| Plano | Preço | Links | Analytics | Personalização | YouTube | Tagarela | TagaShop |
|---|---|---|---|---|---|---|---|
| Gratuito | 0 Kz | 5 | Básico (totais) | Não (tema TAGATECH padrão) | Sim | Não | Não |
| Creator | 5 000 Kz/mês | Ilimitados | Completo + origens | Sim (cores + fontes) | Sim | Sim | Sim (embutido) |
| Business | 12 000 Kz/mês | Ilimitadas (multi-página) | A/B + funil completo | Sim + domínio próprio | Sim | Sim (fluxos avançados) | Sim + TagaPay |

---

## PASSO 0 — Inicializar o projecto

```bash
npm create vite@latest tagalinks -- --template react-ts
cd tagalinks
npm install
npm install @supabase/supabase-js @supabase/auth-ui-react zustand react-router-dom react-hook-form react-hot-toast react-helmet-async recharts lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities clsx tailwind-merge date-fns
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

---

## PASSO 1 — Configuração Tailwind + Design System TAGATECH

Cria `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F3EFFD',
          100: '#E0D8FA',
          200: '#C1B1F5',
          300: '#A28AEF',
          400: '#8363E8',
          500: '#7C3AED',
          600: '#6B30CC',
          700: '#5A27AA',
          800: '#491F88',
          900: '#381666',
        },
        accent: {
          50:  '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        surface: {
          bg:      '#0A0A0F',
          card:    '#13131A',
          elevated:'#1C1C27',
          border:  '#2A2A3A',
          hover:   '#22223A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-tagatech': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
        'gradient-tagatech-subtle': 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.15) 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },              '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
```

Cria `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { @apply scroll-smooth; }
  body { @apply bg-surface-bg text-white font-sans antialiased; }
  * { @apply border-surface-border; }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-tagatech text-white font-medium px-5 py-2.5 rounded-xl
           hover:opacity-90 active:scale-[0.98] transition-all duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply bg-surface-elevated text-white font-medium px-5 py-2.5 rounded-xl border border-surface-border
           hover:bg-surface-hover active:scale-[0.98] transition-all duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-ghost {
    @apply text-gray-400 font-medium px-4 py-2 rounded-xl
           hover:bg-surface-elevated hover:text-white transition-all duration-150;
  }
  .card {
    @apply bg-surface-card border border-surface-border rounded-2xl p-5;
  }
  .input {
    @apply w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5
           text-white placeholder-gray-500 focus:outline-none focus:ring-2
           focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-150;
  }
  .label {
    @apply block text-sm font-medium text-gray-300 mb-1.5;
  }
  .badge {
    @apply inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium;
  }
  .gradient-text {
    @apply bg-gradient-tagatech bg-clip-text text-transparent;
  }
}
```

---

## PASSO 2 — Variáveis de ambiente

Cria `.env.example` e `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=http://localhost:5173
VITE_APPYPAY_MERCHANT_ID=
VITE_APPYPAY_API_URL=https://api.appypay.co.ao
VITE_TAGARELA_URL=https://tagarela.app
VITE_TAGARELA_SIGNUP_URL=https://tagarela.app/cadastro
VITE_SUPPORT_WHATSAPP=
```

---

## PASSO 3 — Base de dados Supabase (migrações)

### Migração 001 — Schema principal

Executa no SQL Editor do Supabase:

```sql
-- Extensão UUID
create extension if not exists "uuid-ossp";

-- Enum: plano de subscrição
create type subscription_plan as enum ('free', 'creator', 'business');

-- Enum: tipo de bloco de link
create type link_item_type as enum (
  'link', 'product', 'whatsapp', 'social', 'divider',
  'header', 'youtube', 'email', 'phone'
);

-- Enum: rede social
create type social_network as enum (
  'instagram', 'tiktok', 'youtube', 'facebook',
  'twitter', 'linkedin', 'snapchat', 'telegram', 'spotify'
);

-- Enum: status de subscrição
create type subscription_status as enum ('active', 'cancelled', 'expired', 'trial');

-- Tabela profiles (criadores)
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
  tagarela_enabled boolean default false,
  tagarela_bot_id  text,
  tagashop_slug    text,
  role           text not null default 'user',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Constraint: username só letras, números, underscore, hífen (3-30 chars)
alter table profiles add constraint username_format
  check (username ~ '^[a-zA-Z0-9_-]{3,30}$');

-- Tabela link_pages (página pública do criador)
create table link_pages (
  id             uuid default uuid_generate_v4() primary key,
  profile_id     uuid references profiles(id) on delete cascade not null,
  slug           text unique not null,
  title          text not null default '',
  bio            text default '',
  avatar_url     text,
  -- Vídeo YouTube de apresentação
  youtube_url    text,
  youtube_title  text,
  -- Tema e personalização (planos pagos)
  theme_preset   text default 'tagatech',
  custom_bg_color      text,
  custom_primary_color text,
  custom_accent_color  text,
  custom_text_color    text,
  custom_font          text default 'Inter',
  custom_bg_type       text default 'solid',      -- 'solid' | 'gradient' | 'image'
  custom_bg_gradient   text,
  custom_bg_image_url  text,
  -- Configurações
  published      boolean default false,
  seo_title      text,
  seo_description text,
  whatsapp_number text,
  whatsapp_message text,
  -- Tagarela
  tagarela_flow_id text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Constraint: slug igual ao username
create index idx_link_pages_slug on link_pages(slug);
create index idx_link_pages_profile on link_pages(profile_id);

-- Tabela link_items (blocos da página)
create table link_items (
  id               uuid default uuid_generate_v4() primary key,
  page_id          uuid references link_pages(id) on delete cascade not null,
  type             link_item_type not null default 'link',
  label            text not null default '',
  url              text,
  position         integer not null default 0,
  visible          boolean default true,
  -- Ícone e estilo
  icon             text,
  social_network   social_network,
  -- Para blocos de produto TagaShop
  tagashop_product_id text,
  product_price    numeric,
  product_image_url text,
  -- Para blocos YouTube (mini-player embutido)
  youtube_url      text,
  youtube_title    text,
  -- Estilo personalizado do bloco (planos pagos)
  custom_bg_color  text,
  custom_text_color text,
  custom_border_color text,
  custom_style     text default 'solid',   -- 'solid' | 'outline' | 'ghost' | 'gradient'
  thumbnail_url    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index idx_link_items_page on link_items(page_id);
create index idx_link_items_position on link_items(page_id, position);

-- Tabela page_views (analytics — sem IP)
create table page_views (
  id          uuid default uuid_generate_v4() primary key,
  page_id     uuid references link_pages(id) on delete cascade not null,
  referrer    text,          -- 'instagram' | 'tiktok' | 'whatsapp' | 'direct' | 'other'
  country     text,
  device      text,          -- 'mobile' | 'desktop' | 'tablet'
  session_id  text,
  created_at  timestamptz default now()
);

create index idx_page_views_page on page_views(page_id);
create index idx_page_views_date on page_views(page_id, created_at);

-- Tabela link_clicks (analytics por bloco)
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

-- Tabela subscriptions (pagamentos AppyPay)
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

-- Tabela integrations (TabaShop, Tagarela, TagaPay)
create table integrations (
  id           uuid default uuid_generate_v4() primary key,
  profile_id   uuid references profiles(id) on delete cascade not null,
  type         text not null,   -- 'tagashop' | 'tagarela' | 'tagapay' | 'tagaagenda'
  config       jsonb default '{}',
  active       boolean default true,
  created_at   timestamptz default now(),
  unique(profile_id, type)
);
```

### Migração 002 — RLS (Row Level Security)

```sql
-- profiles
alter table profiles enable row level security;
create policy "public_read_profiles"  on profiles for select using (true);
create policy "own_insert_profile"    on profiles for insert with check (auth.uid() = id);
create policy "own_update_profile"    on profiles for update using (auth.uid() = id);

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

-- page_views — inserção pública (via Edge Function), leitura só do dono
alter table page_views enable row level security;
create policy "service_insert_views" on page_views for insert with check (true);
create policy "own_read_views"       on page_views for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));

-- link_clicks — inserção pública, leitura só do dono
alter table link_clicks enable row level security;
create policy "service_insert_clicks" on link_clicks for insert with check (true);
create policy "own_read_clicks"       on link_clicks for select
  using (exists (select 1 from link_pages p where p.id = page_id and p.profile_id = auth.uid()));

-- subscriptions
alter table subscriptions enable row level security;
create policy "own_read_subs"   on subscriptions for select using (auth.uid() = profile_id);
create policy "service_insert"  on subscriptions for insert with check (true);
create policy "service_update"  on subscriptions for update using (true);

-- integrations
alter table integrations enable row level security;
create policy "own_read_integ"   on integrations for select using (auth.uid() = profile_id);
create policy "own_insert_integ" on integrations for insert with check (auth.uid() = profile_id);
create policy "own_update_integ" on integrations for update using (auth.uid() = profile_id);
create policy "own_delete_integ" on integrations for delete using (auth.uid() = profile_id);
```

### Migração 003 — Storage Buckets

```sql
-- Avatar uploads do criador
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
```

---

## PASSO 4 — Edge Functions Supabase

### 4.1 — `track-event` (regista page_view e link_click)

Cria `supabase/functions/track-event/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  const { type, page_id, link_item_id, referrer, session_id } = body

  // Detectar device a partir do user-agent
  const ua = req.headers.get('user-agent') || ''
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

  // Detectar origem do referrer
  let origin = 'direct'
  const ref = (referrer || req.headers.get('referer') || '').toLowerCase()
  if (ref.includes('instagram'))  origin = 'instagram'
  else if (ref.includes('tiktok'))     origin = 'tiktok'
  else if (ref.includes('whatsapp'))   origin = 'whatsapp'
  else if (ref.includes('facebook'))   origin = 'facebook'
  else if (ref.includes('twitter') || ref.includes('t.co')) origin = 'twitter'
  else if (ref.includes('youtube'))    origin = 'youtube'
  else if (ref.length > 0)            origin = 'other'

  if (type === 'page_view') {
    await supabase.from('page_views').insert({
      page_id, referrer: origin, device, session_id
    })
  } else if (type === 'link_click' && link_item_id) {
    await supabase.from('link_clicks').insert({
      link_item_id, page_id, session_id
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
```

### 4.2 — `appypay-webhook` (confirma pagamento e actualiza plano)

Cria `supabase/functions/appypay-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()

  // AppyPay envia: { status, reference, order_id, amount, metadata }
  // metadata deve conter: { profile_id, plan }
  const { status, reference, order_id, amount, metadata } = body

  if (status !== 'paid') {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { profile_id, plan } = metadata || {}
  if (!profile_id || !plan) {
    return new Response(JSON.stringify({ error: 'missing metadata' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Calcular data de expiração (30 dias)
  const period_start = new Date()
  const period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // Registar subscricão
  await supabase.from('subscriptions').insert({
    profile_id, plan,
    status: 'active',
    appypay_ref: reference,
    appypay_order_id: order_id,
    amount,
    period_start,
    period_end,
  })

  // Actualizar plano no perfil
  await supabase.from('profiles').update({
    plan,
    sub_status: 'active',
    sub_expires_at: period_end.toISOString(),
  }).eq('id', profile_id)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 4.3 — `sync-tagashop` (sincroniza produtos da TagaShop)

Cria `supabase/functions/sync-tagashop/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { page_id, tagashop_slug } = await req.json()

  // Buscar produtos da TagaShop via API pública da loja
  const tagashopUrl = Deno.env.get('TAGASHOP_API_URL') || 'https://tagashop.ao'
  const res = await fetch(`${tagashopUrl}/api/store/${tagashop_slug}/products`)
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'tagashop_unavailable' }), { status: 502 })
  }
  const products = await res.json()

  // Actualizar link_items do tipo 'product' para esta página
  for (const p of products) {
    await supabase.from('link_items')
      .update({
        label: p.name,
        url: `https://tagashop.ao/p/${p.id}`,
        product_price: p.price,
        product_image_url: p.cover_url,
        updated_at: new Date().toISOString(),
      })
      .eq('page_id', page_id)
      .eq('tagashop_product_id', p.id)
  }

  return new Response(JSON.stringify({ ok: true, synced: products.length }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
```

Deploy das functions:
```bash
supabase functions deploy track-event
supabase functions deploy appypay-webhook
supabase functions deploy sync-tagashop
```

---

## PASSO 5 — Estrutura de ficheiros completa

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          ← variantes: primary, secondary, ghost, danger
│   │   ├── Input.tsx           ← input com label, error, icon
│   │   ├── Modal.tsx           ← modal acessível com backdrop
│   │   ├── Badge.tsx           ← badge colorida
│   │   ├── Avatar.tsx          ← avatar com fallback de iniciais
│   │   ├── Logo.tsx            ← logo TAGATECH
│   │   ├── Spinner.tsx         ← loading spinner
│   │   ├── Toggle.tsx          ← toggle switch
│   │   ├── ColorPicker.tsx     ← seletor de cor (planos pagos)
│   │   ├── YouTubeEmbed.tsx    ← player YouTube responsivo
│   │   └── UpgradeGate.tsx     ← wrapper que bloqueia feature em plano grátis
│   ├── layout/
│   │   ├── DashboardLayout.tsx ← sidebar + topbar
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Footer.tsx
│   ├── editor/
│   │   ├── PageEditor.tsx      ← editor principal drag-and-drop
│   │   ├── LinkItemCard.tsx    ← bloco individual arrastável
│   │   ├── AddBlockMenu.tsx    ← menu de adição de blocos
│   │   ├── ThemeEditor.tsx     ← editor de tema (planos pagos)
│   │   └── BlockForms/
│   │       ├── LinkForm.tsx
│   │       ├── YouTubeForm.tsx
│   │       ├── WhatsAppForm.tsx
│   │       ├── SocialForm.tsx
│   │       ├── ProductForm.tsx
│   │       └── HeaderForm.tsx
│   ├── preview/
│   │   ├── PagePreview.tsx     ← preview ao vivo (mobile frame)
│   │   └── PublicPage.tsx      ← página pública real (renderização final)
│   └── analytics/
│       ├── StatsCards.tsx
│       ├── ClicksChart.tsx
│       └── SourcesChart.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePage.ts              ← CRUD da página e items
│   ├── useAnalytics.ts         ← queries de analytics
│   ├── useSubscription.ts      ← plano, expiração, upgrade
│   ├── useAppyPay.ts           ← iniciar pagamento AppyPay
│   └── useTagarela.ts          ← integração Tagarela
├── pages/
│   ├── Landing.tsx             ← landing page pública do TagaLinks
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx       ← visão geral + stats rápidas
│   │   ├── Editor.tsx          ← editor da página (principal)
│   │   ├── Analytics.tsx       ← analytics detalhado
│   │   ├── Appearance.tsx      ← tema + personalização
│   │   ├── Settings.tsx        ← configurações da conta
│   │   └── Upgrade.tsx         ← página de upgrade de plano
│   └── public/
│       └── [username].tsx      ← página pública do criador
├── store/
│   ├── useAuthStore.ts
│   ├── useThemeStore.ts
│   └── useEditorStore.ts       ← estado do editor (items, preview, unsaved)
├── lib/
│   ├── supabase.ts
│   ├── utils.ts                ← cn, formatCurrency, slugify, getYouTubeId
│   ├── youtube.ts              ← getYouTubeId, getEmbedUrl, getThumbnail
│   ├── appypay.ts              ← initPayment, checkStatus
│   └── theme.ts                ← computeTheme (aplica cores personalizadas)
└── types/
    └── index.ts                ← todos os tipos TypeScript
```

---

## PASSO 6 — Tipos TypeScript

Cria `src/types/index.ts`:

```typescript
export type SubscriptionPlan   = 'free' | 'creator' | 'business'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial'
export type LinkItemType       = 'link' | 'product' | 'whatsapp' | 'social' | 'divider' | 'header' | 'youtube' | 'email' | 'phone'
export type SocialNetwork      = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin' | 'snapchat' | 'telegram' | 'spotify'
export type DeviceType         = 'mobile' | 'desktop' | 'tablet'
export type ReferrerSource     = 'instagram' | 'tiktok' | 'whatsapp' | 'facebook' | 'twitter' | 'youtube' | 'direct' | 'other'

export interface Profile {
  id:                uuid
  name:              string
  email:             string
  phone?:            string
  username?:         string
  avatar_url?:       string
  plan:              SubscriptionPlan
  sub_status?:       SubscriptionStatus
  sub_expires_at?:   string
  tagarela_enabled:  boolean
  tagarela_bot_id?:  string
  tagashop_slug?:    string
  role:              string
  created_at:        string
}

export interface LinkPage {
  id:                      uuid
  profile_id:              uuid
  slug:                    string
  title:                   string
  bio:                     string
  avatar_url?:             string
  youtube_url?:            string
  youtube_title?:          string
  theme_preset:            string
  custom_bg_color?:        string
  custom_primary_color?:   string
  custom_accent_color?:    string
  custom_text_color?:      string
  custom_font?:            string
  custom_bg_type?:         'solid' | 'gradient' | 'image'
  custom_bg_gradient?:     string
  custom_bg_image_url?:    string
  published:               boolean
  seo_title?:              string
  seo_description?:        string
  whatsapp_number?:        string
  whatsapp_message?:       string
  tagarela_flow_id?:       string
  created_at:              string
  updated_at:              string
  items?:                  LinkItem[]
}

export interface LinkItem {
  id:                   uuid
  page_id:              uuid
  type:                 LinkItemType
  label:                string
  url?:                 string
  position:             number
  visible:              boolean
  icon?:                string
  social_network?:      SocialNetwork
  tagashop_product_id?: string
  product_price?:       number
  product_image_url?:   string
  youtube_url?:         string
  youtube_title?:       string
  custom_bg_color?:     string
  custom_text_color?:   string
  custom_border_color?: string
  custom_style?:        'solid' | 'outline' | 'ghost' | 'gradient'
  thumbnail_url?:       string
  created_at:           string
}

export interface PageView {
  id:         uuid
  page_id:    uuid
  referrer:   ReferrerSource
  country?:   string
  device?:    DeviceType
  session_id?: string
  created_at: string
}

export interface LinkClick {
  id:           uuid
  link_item_id: uuid
  page_id:      uuid
  session_id?:  string
  created_at:   string
}

export interface Subscription {
  id:               uuid
  profile_id:       uuid
  plan:             SubscriptionPlan
  status:           SubscriptionStatus
  appypay_ref?:     string
  appypay_order_id?: string
  amount:           number
  period_start:     string
  period_end:       string
  created_at:       string
}

export interface AnalyticsSummary {
  total_views:   number
  total_clicks:  number
  total_sales:   number
  click_rate:    number
  top_links:     { id: uuid; label: string; clicks: number; ctr: number }[]
  views_by_day:  { date: string; views: number; clicks: number }[]
  sources:       { source: ReferrerSource; count: number; pct: number }[]
  devices:       { device: DeviceType; count: number }[]
}

export interface AppyPayInitResponse {
  reference:  string
  order_id:   string
  amount:     number
  expires_at: string
  qr_code?:   string
  deeplink?:  string
}

// helper type alias
type uuid = string
```

---

## PASSO 7 — Supabase client e utilitários

Cria `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

Cria `src/lib/youtube.ts`:

```typescript
export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
```

Cria `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' Kz'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function detectReferrer(referrer: string): string {
  const r = (referrer || document.referrer || '').toLowerCase()
  if (r.includes('instagram'))  return 'instagram'
  if (r.includes('tiktok'))     return 'tiktok'
  if (r.includes('whatsapp'))   return 'whatsapp'
  if (r.includes('facebook'))   return 'facebook'
  if (r.includes('twitter') || r.includes('t.co')) return 'twitter'
  if (r.includes('youtube'))    return 'youtube'
  if (r.length > 0)             return 'other'
  return 'direct'
}
```

Cria `src/lib/appypay.ts`:

```typescript
import type { AppyPayInitResponse, SubscriptionPlan } from '@/types'

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free:     0,
  creator:  5000,
  business: 12000,
}

export async function initAppyPayPayment(
  profileId: string,
  plan: SubscriptionPlan,
): Promise<AppyPayInitResponse> {
  const amount = PLAN_PRICES[plan]
  const merchantId = import.meta.env.VITE_APPYPAY_MERCHANT_ID
  const apiUrl     = import.meta.env.VITE_APPYPAY_API_URL

  const res = await fetch(`${apiUrl}/v1/payments/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id:  merchantId,
      amount,
      currency:     'AOA',
      description:  `TagaLinks ${plan} — 1 mês`,
      metadata: {
        profile_id: profileId,
        plan,
        product: 'tagalinks',
      },
      webhook_url:  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appypay-webhook`,
      redirect_url: `${import.meta.env.VITE_APP_URL}/dashboard/upgrade?success=1`,
    }),
  })

  if (!res.ok) throw new Error('AppyPay: erro ao iniciar pagamento')
  return res.json()
}

export async function checkAppyPayStatus(reference: string): Promise<{ status: string }> {
  const apiUrl = import.meta.env.VITE_APPYPAY_API_URL
  const res = await fetch(`${apiUrl}/v1/payments/status/${reference}`)
  if (!res.ok) throw new Error('AppyPay: erro ao verificar estado')
  return res.json()
}
```

Cria `src/lib/theme.ts`:

```typescript
import type { LinkPage } from '@/types'

export interface ComputedTheme {
  bg:       string
  surface:  string
  primary:  string
  accent:   string
  text:     string
  subtext:  string
  border:   string
  font:     string
  btnStyle: string
}

// Temas pré-definidos TAGATECH
const PRESETS: Record<string, ComputedTheme> = {
  tagatech: {
    bg:      '#0A0A0F',
    surface: '#13131A',
    primary: '#7C3AED',
    accent:  '#06B6D4',
    text:    '#F8F8FF',
    subtext: '#9B9BAA',
    border:  '#2A2A3A',
    font:    'Inter',
    btnStyle:'gradient',
  },
  light: {
    bg:      '#FFFFFF',
    surface: '#F8F8FF',
    primary: '#7C3AED',
    accent:  '#06B6D4',
    text:    '#13131A',
    subtext: '#5F5E5A',
    border:  '#E5E5EA',
    font:    'Inter',
    btnStyle:'solid',
  },
  dark_coral: {
    bg:      '#0F0A0A',
    surface: '#1A1010',
    primary: '#E05C2E',
    accent:  '#F5A623',
    text:    '#FFF8F5',
    subtext: '#AA8B80',
    border:  '#3A2A20',
    font:    'Inter',
    btnStyle:'solid',
  },
}

export function computeTheme(page: LinkPage, plan: string): ComputedTheme {
  const base = PRESETS[page.theme_preset] || PRESETS['tagatech']

  // Plano grátis: apenas tema TAGATECH padrão
  if (plan === 'free') return base

  // Planos pagos: aplica personalizações
  return {
    ...base,
    bg:      page.custom_bg_color     || base.bg,
    primary: page.custom_primary_color|| base.primary,
    accent:  page.custom_accent_color || base.accent,
    text:    page.custom_text_color   || base.text,
    font:    page.custom_font         || base.font,
  }
}

export const THEME_PRESETS = Object.keys(PRESETS)
export const GOOGLE_FONTS = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Raleway', 'Nunito', 'Lato']
```

---

## PASSO 8 — Stores Zustand

Cria `src/store/useAuthStore.ts`:

```typescript
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user:        any | null
  profile:     Profile | null
  loading:     boolean
  setUser:     (user: any | null) => void
  setProfile:  (p: Profile | null) => void
  fetchProfile:(id: string) => Promise<void>
  signOut:     () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (id) => {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', id).single()
    if (data) set({ profile: data as Profile })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
```

Cria `src/store/useEditorStore.ts`:

```typescript
import { create } from 'zustand'
import type { LinkPage, LinkItem } from '@/types'

interface EditorState {
  page:        LinkPage | null
  items:       LinkItem[]
  dirty:       boolean
  preview:     boolean
  saving:      boolean
  setPage:     (p: LinkPage) => void
  setItems:    (items: LinkItem[]) => void
  updateItem:  (id: string, data: Partial<LinkItem>) => void
  removeItem:  (id: string) => void
  reorderItems:(items: LinkItem[]) => void
  setDirty:    (d: boolean) => void
  setPreview:  (p: boolean) => void
  setSaving:   (s: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  page:    null,
  items:   [],
  dirty:   false,
  preview: false,
  saving:  false,

  setPage:  (page)  => set({ page }),
  setItems: (items) => set({ items }),

  updateItem: (id, data) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
      dirty: true,
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id), dirty: true })),

  reorderItems: (items) => set({ items, dirty: true }),
  setDirty:     (dirty)   => set({ dirty }),
  setPreview:   (preview) => set({ preview }),
  setSaving:    (saving)  => set({ saving }),
}))
```

---

## PASSO 9 — Hooks principais

Cria `src/hooks/useAuth.ts`:

```typescript
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export function useAuth() {
  const { user, profile, loading, setUser, fetchProfile, signOut } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading, signOut, plan: profile?.plan ?? 'free' }
}
```

Cria `src/hooks/usePage.ts`:

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useEditorStore } from '@/store/useEditorStore'
import type { LinkPage, LinkItem } from '@/types'
import toast from 'react-hot-toast'

export function usePage() {
  const [loading, setLoading] = useState(false)
  const { setPage, setItems, setDirty, setSaving } = useEditorStore()

  const loadPage = useCallback(async (profileId: string) => {
    setLoading(true)
    try {
      // Buscar página
      const { data: page, error } = await supabase
        .from('link_pages').select('*').eq('profile_id', profileId).maybeSingle()
      if (error) throw error

      if (!page) return null

      // Buscar items ordenados
      const { data: items } = await supabase
        .from('link_items').select('*')
        .eq('page_id', page.id).order('position')

      setPage(page as LinkPage)
      setItems((items || []) as LinkItem[])
      return page
    } finally {
      setLoading(false)
    }
  }, [setPage, setItems])

  const createPage = useCallback(async (profileId: string, username: string) => {
    const { data, error } = await supabase
      .from('link_pages')
      .insert({ profile_id: profileId, slug: username, title: '', published: false })
      .select().single()
    if (error) { toast.error('Erro ao criar página'); return null }
    setPage(data as LinkPage)
    setItems([])
    return data
  }, [setPage, setItems])

  const savePage = useCallback(async (pageId: string, updates: Partial<LinkPage>) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('link_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', pageId)
      if (error) { toast.error('Erro ao guardar'); return false }
      toast.success('Guardado!')
      setDirty(false)
      return true
    } finally {
      setSaving(false)
    }
  }, [setDirty, setSaving])

  const saveItems = useCallback(async (pageId: string, items: LinkItem[]) => {
    setSaving(true)
    try {
      // Upsert todos os items com posições actualizadas
      const { error } = await supabase.from('link_items').upsert(
        items.map((item, i) => ({ ...item, page_id: pageId, position: i })),
        { onConflict: 'id' }
      )
      if (error) { toast.error('Erro ao guardar links'); return false }
      setDirty(false)
      return true
    } finally {
      setSaving(false)
    }
  }, [setDirty, setSaving])

  const addItem = useCallback(async (pageId: string, type: string, position: number) => {
    const defaults: Record<string, Partial<LinkItem>> = {
      link:      { label: 'Novo link', url: 'https://' },
      youtube:   { label: 'Vídeo de apresentação', youtube_url: '' },
      whatsapp:  { label: 'Fala comigo no WhatsApp' },
      social:    { label: 'Instagram', social_network: 'instagram', url: '' },
      header:    { label: 'Título da secção' },
      divider:   { label: '' },
      product:   { label: 'Produto TagaShop', url: '' },
      email:     { label: 'Envia-me um e-mail' },
      phone:     { label: 'Liga-me' },
    }
    const { data, error } = await supabase
      .from('link_items')
      .insert({ page_id: pageId, type, position, visible: true, ...(defaults[type] || {}) })
      .select().single()
    if (error) { toast.error('Erro ao adicionar bloco'); return null }
    return data as LinkItem
  }, [])

  const deleteItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('link_items').delete().eq('id', itemId)
    if (error) { toast.error('Erro ao remover bloco'); return false }
    return true
  }, [])

  return { loading, loadPage, createPage, savePage, saveItems, addItem, deleteItem }
}
```

Cria `src/hooks/useAnalytics.ts`:

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AnalyticsSummary } from '@/types'

export function useAnalytics(pageId: string | null) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (days = 30) => {
    if (!pageId) return
    setLoading(true)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const [viewsRes, clicksRes, itemsRes] = await Promise.all([
      supabase.from('page_views').select('*').eq('page_id', pageId).gte('created_at', since),
      supabase.from('link_clicks').select('*').eq('page_id', pageId).gte('created_at', since),
      supabase.from('link_items').select('id, label').eq('page_id', pageId),
    ])

    const views  = viewsRes.data  || []
    const clicks = clicksRes.data || []
    const items  = itemsRes.data  || []

    // Clicks por item
    const clicksByItem: Record<string, number> = {}
    for (const c of clicks) {
      clicksByItem[c.link_item_id] = (clicksByItem[c.link_item_id] || 0) + 1
    }

    const top_links = items
      .map((i) => ({ id: i.id, label: i.label, clicks: clicksByItem[i.id] || 0,
                     ctr: views.length ? Math.round((clicksByItem[i.id] || 0) / views.length * 100) : 0 }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    // Views por dia
    const byDay: Record<string, { views: number; clicks: number }> = {}
    for (const v of views) {
      const d = v.created_at.slice(0, 10)
      if (!byDay[d]) byDay[d] = { views: 0, clicks: 0 }
      byDay[d].views++
    }
    for (const c of clicks) {
      const d = c.created_at.slice(0, 10)
      if (!byDay[d]) byDay[d] = { views: 0, clicks: 0 }
      byDay[d].clicks++
    }
    const views_by_day = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    // Origens
    const srcCount: Record<string, number> = {}
    for (const v of views) srcCount[v.referrer || 'direct'] = (srcCount[v.referrer || 'direct'] || 0) + 1
    const sources = Object.entries(srcCount)
      .map(([source, count]) => ({ source: source as any, count,
                                   pct: Math.round(count / (views.length || 1) * 100) }))
      .sort((a, b) => b.count - a.count)

    // Devices
    const devCount: Record<string, number> = {}
    for (const v of views) devCount[v.device || 'mobile'] = (devCount[v.device || 'mobile'] || 0) + 1
    const devices = Object.entries(devCount)
      .map(([device, count]) => ({ device: device as any, count }))

    setSummary({
      total_views:  views.length,
      total_clicks: clicks.length,
      total_sales:  0,
      click_rate:   views.length ? Math.round(clicks.length / views.length * 100) : 0,
      top_links,
      views_by_day,
      sources,
      devices,
    })
    setLoading(false)
  }, [pageId])

  return { summary, loading, fetch }
}
```

Cria `src/hooks/useSubscription.ts`:

```typescript
import { useState, useCallback } from 'react'
import { initAppyPayPayment } from '@/lib/appypay'
import type { SubscriptionPlan, AppyPayInitResponse } from '@/types'
import toast from 'react-hot-toast'

export function useSubscription() {
  const [loading, setLoading]   = useState(false)
  const [payData, setPayData]   = useState<AppyPayInitResponse | null>(null)

  const startUpgrade = useCallback(async (profileId: string, plan: SubscriptionPlan) => {
    if (plan === 'free') return
    setLoading(true)
    try {
      const data = await initAppyPayPayment(profileId, plan)
      setPayData(data)
      return data
    } catch (e) {
      toast.error('Erro ao iniciar pagamento. Tenta novamente.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const planLabel: Record<SubscriptionPlan, string> = {
    free:     'Gratuito',
    creator:  'Creator — 5 000 Kz/mês',
    business: 'Business — 12 000 Kz/mês',
  }

  const planFeatures: Record<SubscriptionPlan, string[]> = {
    free: [
      'Até 5 links',
      'Vídeo YouTube de apresentação',
      'Analytics básico',
      'Tema TAGATECH padrão',
    ],
    creator: [
      'Links ilimitados',
      'Analytics completo com origens',
      'Personalização de cores e fontes',
      'Vídeo YouTube de apresentação',
      'Produtos TagaShop embutidos',
      'Bot Tagarela integrado',
      'Subdomínio personalizado',
    ],
    business: [
      'Tudo do Creator',
      'Múltiplas páginas',
      'A/B testing de links',
      'TagaPay integrado',
      'Pixel de rastreio',
      'Domínio próprio',
      'API e integrações avançadas',
    ],
  }

  return { loading, payData, startUpgrade, planLabel, planFeatures }
}
```

---

## PASSO 10 — Componentes UI base

### 10.1 — `YouTubeEmbed.tsx`

Cria `src/components/ui/YouTubeEmbed.tsx`:

```tsx
import { getYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  url:      string
  title?:   string
  autoplay?: boolean
  className?: string
}

export function YouTubeEmbed({ url, title, autoplay = false, className = '' }: Props) {
  const [playing, setPlaying] = useState(autoplay)
  const id        = getYouTubeId(url)
  const embedUrl  = getYouTubeEmbedUrl(url)
  const thumbnail = getYouTubeThumbnail(url)

  if (!id || !embedUrl) return null

  if (!playing) {
    return (
      <div
        className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setPlaying(true)}
      >
        {thumbnail && (
          <img src={thumbnail} alt={title || 'Vídeo'} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center
                        group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center
                          shadow-lg group-hover:scale-105 transition-transform">
            <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-0.5" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-3">
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full aspect-video rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={`${embedUrl}&autoplay=1`}
        title={title || 'Vídeo'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
```

### 10.2 — `UpgradeGate.tsx`

Cria `src/components/ui/UpgradeGate.tsx`:

```tsx
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SubscriptionPlan } from '@/types'

interface Props {
  requiredPlan: SubscriptionPlan
  currentPlan:  SubscriptionPlan
  children:     React.ReactNode
  featureName?: string
}

const planOrder: SubscriptionPlan[] = ['free', 'creator', 'business']

export function UpgradeGate({ requiredPlan, currentPlan, children, featureName }: Props) {
  const hasAccess = planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
  if (hasAccess) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center
                      bg-surface-card/80 backdrop-blur-sm rounded-xl">
        <div className="text-center px-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-sm font-medium text-white mb-1">
            {featureName ? `${featureName} requer plano ${requiredPlan}` : `Disponível no plano ${requiredPlan}`}
          </p>
          <Link
            to="/dashboard/upgrade"
            className="text-xs text-brand-400 hover:text-brand-300 underline"
          >
            Fazer upgrade
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### 10.3 — `ColorPicker.tsx`

Cria `src/components/ui/ColorPicker.tsx`:

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  value:    string
  onChange: (color: string) => void
  label?:   string
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#7C3AED','#06B6D4','#EC4899','#F59E0B',
  '#10B981','#EF4444','#3B82F6','#8B5CF6',
  '#FFFFFF','#0A0A0F','#13131A','#1C1C27',
]

export function ColorPicker({ value, onChange, label, presets = DEFAULT_PRESETS }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-xl border-2 border-surface-border
                     hover:border-brand-500 transition-colors flex-shrink-0"
          style={{ background: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#7C3AED"
          className="input flex-1 font-mono text-sm"
        />
      </div>

      {open && (
        <div className="mt-2 p-3 bg-surface-elevated rounded-xl border border-surface-border">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {presets.map((c) => (
              <button
                key={c} type="button"
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                  value === c ? 'border-white scale-110' : 'border-surface-border',
                )}
                style={{ background: c }}
                onClick={() => { onChange(c); setOpen(false) }}
              />
            ))}
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
        </div>
      )}
    </div>
  )
}
```

---

## PASSO 11 — Página pública (renderização pública)

Cria `src/components/preview/PublicPage.tsx`:

```tsx
import { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { computeTheme } from '@/lib/theme'
import { generateSessionId, detectReferrer } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { LinkPage, LinkItem } from '@/types'

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', youtube: '▶️', facebook: '👤',
  twitter: '🐦', linkedin: '💼', spotify: '🎧', telegram: '✈️',
}

interface Props {
  page:  LinkPage
  items: LinkItem[]
  plan:  string
}

export function PublicPage({ page, items, plan }: Props) {
  const theme      = computeTheme(page, plan)
  const sessionRef = useRef(generateSessionId())

  // Track page view
  useEffect(() => {
    const referrer = detectReferrer(document.referrer)
    supabase.functions.invoke('track-event', {
      body: { type: 'page_view', page_id: page.id,
              referrer, session_id: sessionRef.current },
    })
  }, [page.id])

  function trackClick(item: LinkItem) {
    supabase.functions.invoke('track-event', {
      body: { type: 'link_click', page_id: page.id,
              link_item_id: item.id, session_id: sessionRef.current },
    })
  }

  const bgStyle: React.CSSProperties =
    page.custom_bg_type === 'gradient' && plan !== 'free' && page.custom_bg_gradient
      ? { background: page.custom_bg_gradient }
      : page.custom_bg_type === 'image' && plan !== 'free' && page.custom_bg_image_url
      ? { backgroundImage: `url(${page.custom_bg_image_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: theme.bg }

  return (
    <>
      <Helmet>
        <title>{page.seo_title || page.title || 'TagaLinks'}</title>
        <meta name="description" content={page.seo_description || page.bio || ''} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={`https://fonts.googleapis.com/css2?family=${theme.font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`}
              rel="stylesheet" />
        <style>{`body { font-family: '${theme.font}', sans-serif; }`}</style>
      </Helmet>

      <div className="min-h-screen py-10 px-4" style={bgStyle}>
        <div className="max-w-md mx-auto">

          {/* Avatar + nome + bio */}
          <div className="text-center mb-6">
            {page.avatar_url ? (
              <img src={page.avatar_url} alt={page.title}
                   className="w-20 h-20 rounded-full mx-auto mb-3 object-cover ring-2"
                   style={{ ringColor: theme.primary }} />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center
                              text-3xl font-bold"
                   style={{ background: theme.primary, color: '#fff' }}>
                {(page.title || '?')[0].toUpperCase()}
              </div>
            )}
            {page.title && (
              <h1 className="text-xl font-bold" style={{ color: theme.text }}>
                {page.title}
              </h1>
            )}
            {page.bio && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: theme.subtext }}>
                {page.bio}
              </p>
            )}
          </div>

          {/* Vídeo YouTube de apresentação (nível de página) */}
          {page.youtube_url && (
            <div className="mb-4">
              <YouTubeEmbed url={page.youtube_url} title={page.youtube_title} />
            </div>
          )}

          {/* Blocos de links */}
          <div className="space-y-3">
            {items.filter((i) => i.visible).sort((a,b)=>a.position-b.position).map((item) => (
              <LinkBlock key={item.id} item={item} theme={theme} plan={plan}
                         onTrack={() => trackClick(item)} />
            ))}
          </div>

          {/* Rodapé */}
          <p className="text-center text-xs mt-8 opacity-40" style={{ color: theme.subtext }}>
            feito com{' '}
            <a href="https://tagalinks.website" className="underline" style={{ color: theme.primary }}>
              TagaLinks
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

function LinkBlock({ item, theme, plan, onTrack }:
  { item: LinkItem; theme: any; plan: string; onTrack: () => void }) {

  const btnBg    = (plan !== 'free' && item.custom_bg_color)    || theme.primary
  const btnText  = (plan !== 'free' && item.custom_text_color)  || '#FFFFFF'
  const btnBorder= (plan !== 'free' && item.custom_border_color)|| btnBg
  const style    = (plan !== 'free' && item.custom_style)       || 'solid'

  const baseStyle: React.CSSProperties =
    style === 'outline'  ? { background: 'transparent', color: btnBg, border: `1.5px solid ${btnBg}` }
    : style === 'ghost'  ? { background: 'transparent', color: theme.text }
    : style === 'gradient' ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff' }
    : { background: btnBg, color: btnText }

  // Header / Divider
  if (item.type === 'header') {
    return (
      <div className="text-center py-1">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-60"
           style={{ color: theme.text }}>{item.label}</p>
      </div>
    )
  }
  if (item.type === 'divider') {
    return <hr style={{ borderColor: theme.border }} />
  }

  // YouTube block
  if (item.type === 'youtube' && item.youtube_url) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${theme.border}` }}>
        {item.label && (
          <p className="text-sm font-medium px-4 py-2" style={{ color: theme.text, background: theme.surface }}>
            {item.label}
          </p>
        )}
        <YouTubeEmbed url={item.youtube_url} title={item.youtube_title} />
      </div>
    )
  }

  // Produto TagaShop
  if (item.type === 'product') {
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer"
         onClick={onTrack}
         className="flex items-center gap-3 p-3 rounded-xl transition-opacity hover:opacity-90"
         style={{ ...baseStyle, border: `0.5px solid ${theme.border}` }}>
        {item.product_image_url && (
          <img src={item.product_image_url} alt={item.label}
               className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.label}</p>
          {item.product_price && (
            <p className="text-xs opacity-70">
              {new Intl.NumberFormat('pt-PT').format(item.product_price)} Kz
            </p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0" />
      </a>
    )
  }

  // WhatsApp
  if (item.type === 'whatsapp') {
    const waUrl = item.url || '#'
    return (
      <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl
                    font-medium transition-opacity hover:opacity-90 w-full"
         style={{ background: '#25D366', color: '#fff' }}>
        <MessageCircle className="w-5 h-5" />
        <span>{item.label}</span>
      </a>
    )
  }

  // Social
  if (item.type === 'social') {
    const icon = SOCIAL_ICONS[item.social_network || ''] || '🔗'
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl
                    font-medium transition-opacity hover:opacity-90 w-full"
         style={baseStyle}>
        <span>{icon}</span>
        <span>{item.label}</span>
      </a>
    )
  }

  // Link genérico / email / phone
  return (
    <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
       className="flex items-center justify-between py-3.5 px-5 rounded-xl
                  font-medium transition-opacity hover:opacity-90 w-full"
       style={baseStyle}>
      <span>{item.label}</span>
      <ExternalLink className="w-4 h-4 opacity-60" />
    </a>
  )
}
```

---

## PASSO 12 — Rotas e App principal

Cria `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'

// Pages
import Landing          from '@/pages/Landing'
import Login            from '@/pages/auth/Login'
import Register         from '@/pages/auth/Register'
import Dashboard        from '@/pages/dashboard/Dashboard'
import Editor           from '@/pages/dashboard/Editor'
import Analytics        from '@/pages/dashboard/Analytics'
import Appearance       from '@/pages/dashboard/Appearance'
import Settings         from '@/pages/dashboard/Settings'
import Upgrade          from '@/pages/dashboard/Upgrade'
import UserPage         from '@/pages/public/UserPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#13131A', color: '#F8F8FF', border: '1px solid #2A2A3A' },
          }}
        />
        <Routes>
          {/* Público */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard (autenticado) */}
          <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
            <Route index             element={<Dashboard />} />
            <Route path="editor"     element={<Editor />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="settings"   element={<Settings />} />
            <Route path="upgrade"    element={<Upgrade />} />
          </Route>

          {/* Página pública do criador */}
          <Route path="/:username" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
```

Cria `src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## PASSO 13 — Página de registo do criador

Cria `src/pages/auth/Register.tsx`:

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  name:     string
  username: string
  email:    string
  phone:    string
  password: string
}

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>()

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('name', e.target.value)
    const auto = slugify(e.target.value).slice(0, 30)
    setValue('username', auto)
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      // Verificar se username está disponível
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('username', data.username).maybeSingle()
      if (existing) { toast.error('Este nome de utilizador já está ocupado'); return }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email, password: data.password,
        options: { data: { name: data.name } },
      })
      if (error) { toast.error(error.message); return }

      const userId = authData.user?.id
      if (!userId) { toast.error('Erro ao criar conta'); return }

      // Criar perfil
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId, name: data.name, email: data.email,
        phone: data.phone, username: data.username,
        plan: 'free', role: 'user',
      })
      if (profileErr) { toast.error(profileErr.message); return }

      // Criar página vazia
      await supabase.from('link_pages').insert({
        profile_id: userId, slug: data.username,
        title: data.name, published: false,
      })

      toast.success('Conta criada! Bem-vindo ao TagaLinks 🎉')
      navigate('/dashboard/editor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Cria a tua página</h1>
          <p className="text-gray-400 mt-1">Partilha tudo com um único link</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" placeholder="Kizomba Beats AO"
                     {...register('name', { required: true, onChange: onNameChange })} />
            </div>

            <div>
              <label className="label">Nome de utilizador</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  tagalinks.website/
                </span>
                <input className="input pl-28" placeholder="kizomba_beats"
                       {...register('username', {
                         required: true,
                         pattern: { value: /^[a-zA-Z0-9_-]{3,30}$/, message: 'Apenas letras, números, _ e -' },
                       })} />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="tu@email.com"
                     {...register('email', { required: true })} />
            </div>

            <div>
              <label className="label">Telefone (opcional)</label>
              <input type="tel" className="input" placeholder="+244 9XX XXX XXX"
                     {...register('phone')} />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-12"
                       placeholder="Mínimo 8 caracteres"
                       {...register('password', { required: true, minLength: 8 })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'A criar conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tens conta?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## PASSO 14 — Página pública do utilizador

Cria `src/pages/public/UserPage.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PublicPage } from '@/components/preview/PublicPage'
import type { LinkPage, LinkItem } from '@/types'

export default function UserPage() {
  const { username } = useParams<{ username: string }>()
  const [page,    setPage]    = useState<LinkPage | null>(null)
  const [items,   setItems]   = useState<LinkItem[]>([])
  const [plan,    setPlan]    = useState('free')
  const [loading, setLoading] = useState(true)
  const [notFound,setNotFound]= useState(false)

  useEffect(() => {
    async function load() {
      if (!username) return

      // Buscar a página pelo slug
      const { data: pageData } = await supabase
        .from('link_pages').select('*')
        .eq('slug', username).eq('published', true).maybeSingle()

      if (!pageData) { setNotFound(true); setLoading(false); return }

      // Buscar items
      const { data: itemsData } = await supabase
        .from('link_items').select('*')
        .eq('page_id', pageData.id).order('position')

      // Buscar plano do dono
      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('id', pageData.profile_id).maybeSingle()

      setPage(pageData as LinkPage)
      setItems((itemsData || []) as LinkItem[])
      setPlan(profile?.plan || 'free')
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center text-center p-4">
      <div>
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-400 text-sm">O link <strong>tagalinks.website/{username}</strong> não existe.</p>
        <a href="/" className="inline-block mt-6 btn-primary px-6 py-2">
          Criar a minha página
        </a>
      </div>
    </div>
  )

  return <PublicPage page={page!} items={items} plan={plan} />
}
```

---

## PASSO 15 — Dashboard Editor (principal)

Cria `src/pages/dashboard/Editor.tsx` com o editor completo drag-and-drop:

```tsx
import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Eye, EyeOff, Save, Globe, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { LinkItemCard } from '@/components/editor/LinkItemCard'
import { AddBlockMenu } from '@/components/editor/AddBlockMenu'
import { PagePreview } from '@/components/preview/PagePreview'
import toast from 'react-hot-toast'

export default function Editor() {
  const { user, profile }  = useAuth()
  const { loadPage, savePage, saveItems, addItem, createPage } = usePage()
  const { page, items, dirty, preview, saving, setItems, setPage, setPreview } = useEditorStore()
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  async function handleSave() {
    if (!page) return
    await Promise.all([
      savePage(page.id, {
        title:       page.title,
        bio:         page.bio,
        youtube_url: page.youtube_url,
        youtube_title: page.youtube_title,
        published:   page.published,
      }),
      saveItems(page.id, items),
    ])
  }

  async function handleAddBlock(type: string) {
    if (!page) return
    setShowAddMenu(false)
    // Verificar limite do plano gratuito
    if (profile?.plan === 'free' && items.length >= 5) {
      toast.error('Plano gratuito: máximo 5 links. Faz upgrade para Creator!')
      return
    }
    const newItem = await addItem(page.id, type, items.length)
    if (newItem) setItems([...items, newItem])
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems(arrayMove(items, oldIdx, newIdx))
  }

  async function togglePublish() {
    if (!page) return
    const next = !page.published
    const ok = await savePage(page.id, { published: next })
    if (ok) {
      setPage({ ...page, published: next })
      toast.success(next ? 'Página publicada! 🎉' : 'Página despublicada')
    }
  }

  if (!page) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex gap-6 h-full">
      {/* Editor */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white">Editor de página</h1>
            <p className="text-sm text-gray-400">tagalinks.website/{page.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
               className="btn-ghost flex items-center gap-1.5 text-sm">
              <ExternalLink className="w-4 h-4" /> Ver página
            </a>
            <button onClick={() => setPreview(!preview)} className="btn-ghost text-sm">
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={togglePublish}
                    className={`btn-secondary text-sm flex items-center gap-1.5 ${
                      page.published ? 'text-green-400 border-green-500/30' : ''}`}>
              <Globe className="w-4 h-4" />
              {page.published ? 'Publicado' : 'Publicar'}
            </button>
            <button onClick={handleSave} disabled={!dirty || saving}
                    className="btn-primary text-sm flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              {saving ? 'A guardar...' : dirty ? 'Guardar' : 'Guardado'}
            </button>
          </div>
        </div>

        {/* Perfil rápido */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Perfil</h2>
          <input className="input" placeholder="Título da página (ex: Kizomba Beats AO)"
                 value={page.title || ''}
                 onChange={(e) => setPage({ ...page, title: e.target.value })} />
          <textarea className="input resize-none" rows={2} placeholder="Bio — descreve quem és..."
                    value={page.bio || ''}
                    onChange={(e) => setPage({ ...page, bio: e.target.value })} />
        </div>

        {/* Vídeo de apresentação */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Vídeo de apresentação</h2>
            <span className="badge bg-brand-500/20 text-brand-300 text-xs">YouTube</span>
          </div>
          <input className="input" placeholder="https://youtube.com/watch?v=..."
                 value={page.youtube_url || ''}
                 onChange={(e) => setPage({ ...page, youtube_url: e.target.value })} />
          {page.youtube_url && (
            <input className="input text-sm" placeholder="Legenda do vídeo (opcional)"
                   value={page.youtube_title || ''}
                   onChange={(e) => setPage({ ...page, youtube_title: e.target.value })} />
          )}
          <p className="text-xs text-gray-500">
            Este vídeo aparece no topo da tua página, antes dos links. Ideal para apresentação pessoal.
          </p>
        </div>

        {/* Links drag-and-drop */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">
              Links{' '}
              <span className="text-gray-500 font-normal">
                ({items.length}{profile?.plan === 'free' ? '/5' : ''})
              </span>
            </h2>
            <button onClick={() => setShowAddMenu(true)}
                    className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-3xl mb-2">🔗</p>
              <p className="text-sm">Ainda não tens links. Adiciona o primeiro!</p>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <LinkItemCard key={item.id} item={item} plan={profile?.plan || 'free'} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Preview mobile ao lado (desktop) */}
      {preview && (
        <div className="hidden lg:block w-80 flex-shrink-0">
          <PagePreview />
        </div>
      )}

      {/* Menu de adicionar bloco */}
      {showAddMenu && (
        <AddBlockMenu
          onSelect={handleAddBlock}
          onClose={() => setShowAddMenu(false)}
          plan={profile?.plan || 'free'}
          itemCount={items.length}
        />
      )}
    </div>
  )
}
```

---

## PASSO 16 — Página de Upgrade com AppyPay

Cria `src/pages/dashboard/Upgrade.tsx`:

```tsx
import { useState } from 'react'
import { Check, Zap, Building2, QrCode, Copy, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import type { SubscriptionPlan } from '@/types'
import toast from 'react-hot-toast'

export default function Upgrade() {
  const { profile }  = useAuth()
  const { loading, payData, startUpgrade, planLabel, planFeatures } = useSubscription()
  const [copied, setCopied]   = useState(false)
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null)

  const currentPlan = profile?.plan || 'free'

  async function handleUpgrade(plan: SubscriptionPlan) {
    if (!profile?.id) return
    setSelected(plan)
    const data = await startUpgrade(profile.id, plan)
    if (!data) setSelected(null)
  }

  function copyRef() {
    if (!payData?.reference) return
    navigator.clipboard.writeText(payData.reference)
    setCopied(true)
    toast.success('Referência copiada!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Modal de pagamento AppyPay
  if (payData && selected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-tagatech mx-auto flex items-center justify-center">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Pagamento via AppyPay</h2>
            <p className="text-gray-400 text-sm mt-1">Plano {planLabel[selected]}</p>
          </div>

          {/* Referência Multicaixa */}
          <div className="bg-surface-elevated rounded-xl p-4 space-y-3 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Referência de pagamento</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-white tracking-widest flex-1">
                {payData.reference}
              </code>
              <button onClick={copyRef}
                      className="p-2 rounded-lg bg-surface-card hover:bg-surface-hover transition-colors">
                {copied
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Valor:</span>
              <span className="text-white font-medium">
                {new Intl.NumberFormat('pt-PT').format(payData.amount)} Kz
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Válido até:</span>
              <span className="text-white">
                {new Date(payData.expires_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
          </div>

          {payData.qr_code && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Ou paga via Multicaixa Express</p>
              <img src={payData.qr_code} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl" />
            </div>
          )}

          <div className="text-xs text-gray-500 bg-surface-elevated rounded-xl p-3">
            Após o pagamento, o teu plano é actualizado automaticamente em segundos.
            Podes pagar no ATM, Homebanking ou app do teu banco com a referência acima.
          </div>

          <button onClick={() => setSelected(null)} className="btn-ghost text-sm w-full">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Escolhe o teu plano</h1>
        <p className="text-gray-400 mt-2">Paga em Kwanza via Multicaixa ou AppyPay</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['free', 'creator', 'business'] as SubscriptionPlan[]).map((plan) => {
          const isCurrent  = currentPlan === plan
          const isCreator  = plan === 'creator'
          return (
            <div key={plan}
                 className={`card relative flex flex-col ${
                   isCreator ? 'border-brand-500/50 ring-1 ring-brand-500/30' : ''
                 }`}>
              {isCreator && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-gradient-tagatech text-white text-xs px-3 py-1">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                {plan === 'free'     && <span className="text-gray-400 font-medium">Gratuito</span>}
                {plan === 'creator'  && (
                  <><Zap className="w-4 h-4 text-brand-400" />
                    <span className="text-white font-semibold">Creator</span></>
                )}
                {plan === 'business' && (
                  <><Building2 className="w-4 h-4 text-accent-400" />
                    <span className="text-white font-semibold">Business</span></>
                )}
              </div>

              <div className="mb-4">
                {plan === 'free'     && <p className="text-3xl font-bold text-white">0 Kz</p>}
                {plan === 'creator'  && <p className="text-3xl font-bold text-white">5 000 <span className="text-base font-normal text-gray-400">Kz/mês</span></p>}
                {plan === 'business' && <p className="text-3xl font-bold text-white">12 000 <span className="text-base font-normal text-gray-400">Kz/mês</span></p>}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {planFeatures[plan].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="btn-secondary text-center text-sm py-2.5 cursor-default opacity-60">
                  Plano actual
                </div>
              ) : plan === 'free' ? (
                <div className="btn-ghost text-center text-sm py-2.5 cursor-default">
                  Sempre grátis
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading && selected === plan}
                  className="btn-primary w-full text-sm py-2.5">
                  {loading && selected === plan ? 'A processar...' : `Fazer upgrade`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        Pagamentos seguros via AppyPay · Multicaixa Express · Referência ATM
      </p>
    </div>
  )
}
```

---

## PASSO 17 — Notas técnicas e bugs conhecidos

### RLS — regras críticas (mesmos padrões da TagaShop)
- Criar sempre policies separadas por operação (INSERT, UPDATE, SELECT, DELETE)
- `FOR ALL USING (...)` **não cobre INSERT** — usar `WITH CHECK` separado
- `link_items` sem policy de INSERT causa `42501` — verificar antes de testar

### Enums PostgreSQL
- `ADD VALUE` deve ser executado em transação separada antes de usar o novo valor
- Para adicionar novo `link_item_type`: executar o `ADD VALUE` e só depois usar em código

### Drag-and-drop (@dnd-kit)
- `arrayMove` do `@dnd-kit/sortable` para reordenar
- Guardar posições apenas no `handleSave` — não fazer upsert a cada drag (performance)
- `PointerSensor` em vez de `MouseSensor` para funcionar em mobile (touch)

### AppyPay — integração
- A webhook URL deve ser a Edge Function `appypay-webhook` do Supabase
- O campo `metadata` do payload deve conter `{ profile_id, plan, product: 'tagalinks' }`
- Testar sempre em sandbox antes de produção — contactar AppyPay para credenciais sandbox
- Em caso de falha de webhook: verificar logs em Supabase → Edge Functions → Logs

### YouTube embed
- Verificar sempre com `getYouTubeId()` antes de mostrar o player
- Suportar: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`
- Thumbnail: `https://img.youtube.com/vi/{id}/hqdefault.jpg`
- Para preview estático (sem iframe): usar thumbnail + botão play, só fazer embed no click

### Personalização de cores (planos pagos)
- Verificar `plan !== 'free'` antes de aplicar qualquer cor personalizada
- No plano gratuito: ignorar completamente as colunas `custom_*` da base de dados
- `computeTheme()` em `src/lib/theme.ts` centraliza esta lógica

### Performance da página pública
- Usar `React.lazy` + `Suspense` para o bloco YouTube (só carrega se houver vídeo)
- `page_views` e `link_clicks` inseridos via Edge Function (não directo do cliente) para evitar abuso
- Gerar `sessionId` uma vez por visita (useRef) — não a cada render

### Storage
- Avatares: bucket `avatars`, path `{userId}/{timestamp}.jpg`
- Fundos: bucket `page-backgrounds`, path `{userId}/{timestamp}.jpg`
- Máximo recomendado: avatares 2MB, fundos 5MB — validar no frontend antes do upload

---

## PASSO 18 — Variáveis de ambiente para produção

```env
# Supabase
VITE_SUPABASE_URL=https://XXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
VITE_APP_URL=https://tagalinks.website

# AppyPay (Angola)
VITE_APPYPAY_MERCHANT_ID=TAGATECH_PROD
VITE_APPYPAY_API_URL=https://api.appypay.co.ao

# Tagarela
VITE_TAGARELA_URL=https://tagarela.app
VITE_TAGARELA_SIGNUP_URL=https://tagarela.app/cadastro

# Suporte
VITE_SUPPORT_WHATSAPP=+244900000000

# TagaShop (para sincronização de produtos)
VITE_TAGASHOP_API_URL=https://tagashop.ao
```

Variáveis de ambiente para as Edge Functions (Supabase Secrets):
```
SUPABASE_URL=https://XXXXXXXXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TAGASHOP_API_URL=https://tagashop.ao
APPYPAY_WEBHOOK_SECRET=...
```

---

## RESUMO DE ROTAS

```
/                            Landing page TagaLinks
/login                       Login
/register                    Registo + criação de conta
/dashboard                   Painel — visão geral e stats
/dashboard/editor            Editor da página (principal)
/dashboard/analytics         Analytics detalhado
/dashboard/appearance        Tema e personalização visual
/dashboard/settings          Configurações da conta + integrações
/dashboard/upgrade           Upgrade de plano + pagamento AppyPay
/:username                   Página pública do criador
```

---

## CHECKLIST FINAL

Antes de considerar o MVP completo, verificar:

- [ ] Registo cria perfil + página em simultâneo
- [ ] Username único validado em tempo real
- [ ] Plano gratuito bloqueia mais de 5 links (com mensagem clara)
- [ ] Plano gratuito ignora todas as cores personalizadas
- [ ] YouTube embed funciona com todos os formatos de URL suportados
- [ ] Preview ao vivo reflecte edições sem guardar
- [ ] Drag-and-drop funciona em mobile (touch)
- [ ] AppyPay inicia pagamento e mostra referência + QR
- [ ] Webhook AppyPay actualiza plano e `sub_expires_at`
- [ ] Página pública carrega sem autenticação
- [ ] Analytics regista page_view na visita e link_click em cada clique
- [ ] Página não publicada mostra 404 público
- [ ] RLS impede criador A de ver/editar dados de criador B
- [ ] Storage buckets com policies correctas (upload só do dono)
- [ ] Todos os textos em português de Angola
- [ ] Testado em Android (Chrome mobile) com conexão 3G
