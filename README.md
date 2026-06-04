# TagaLinks

Plataforma de bio-links feita para Angola. Cria uma página única com todos os teus links, integrada com pagamentos locais via **AppyPay**.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilo:** TailwindCSS
- **Backend/DB:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Pagamentos:** AppyPay (gateway angolano)
- **Estado:** Zustand
- **Drag & drop:** dnd-kit

## Funcionalidades

- Criar e editar página de bio-links com drag & drop
- Blocos de conteúdo: links, YouTube, texto
- Temas e personalização visual
- Analytics de cliques e fontes de tráfego
- Planos Free e Pro com paywall via AppyPay
- Autenticação com Supabase Auth
- Integração com Tagarela

## Começar

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [AppyPay](https://appypay.co.ao)

### Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
```

Preencher o `.env` com as credenciais:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_APP_URL=http://localhost:5173
VITE_APPYPAY_MERCHANT_ID=<merchant-id>
VITE_APPYPAY_API_URL=https://api.appypay.co.ao
VITE_TAGARELA_URL=https://tagarela.app
VITE_TAGARELA_SIGNUP_URL=https://tagarela.app/cadastro
VITE_SUPPORT_WHATSAPP=<numero>
```

### Base de dados

Executar os scripts SQL no Supabase pela ordem:

```
public/sql/001_schema.sql   — tabelas
public/sql/002_rls.sql      — políticas de segurança (RLS)
public/sql/003_storage.sql  — buckets de storage
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Edge Functions (Supabase)

| Função | Descrição |
|---|---|
| `appypay-webhook` | Recebe callbacks de pagamento do AppyPay |
| `track-event` | Regista eventos de clique para analytics |
| `sync-tagashop` | Sincronização com Tagarela |

## Estrutura do projeto

```
src/
├── components/      # UI, layout, editor, analytics, preview
├── hooks/           # Hooks de dados (auth, page, analytics, subscription)
├── lib/             # Clientes Supabase, AppyPay, utilidades
├── pages/           # Landing, Auth, Dashboard, Página pública
├── store/           # Estado global (Zustand)
└── types/           # Tipos TypeScript

supabase/
└── functions/       # Edge Functions

public/sql/          # Migrations SQL
```

## Licença

Privado — todos os direitos reservados.
