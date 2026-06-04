/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_APPYPAY_MERCHANT_ID: string
  readonly VITE_APPYPAY_API_URL: string
  readonly VITE_TAGARELA_URL: string
  readonly VITE_TAGARELA_SIGNUP_URL: string
  readonly VITE_SUPPORT_WHATSAPP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
