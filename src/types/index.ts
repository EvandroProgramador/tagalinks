export type SubscriptionPlan   = 'free' | 'creator'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial'
export type LinkItemType       = 'link' | 'product' | 'tagashop' | 'whatsapp' | 'social' | 'divider' | 'header' | 'youtube' | 'email' | 'phone' | 'vitrine'
export type SocialNetwork      = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin' | 'snapchat' | 'telegram' | 'spotify'
export type DeviceType         = 'mobile' | 'desktop' | 'tablet'
export type ReferrerSource     = 'instagram' | 'tiktok' | 'whatsapp' | 'facebook' | 'twitter' | 'youtube' | 'direct' | 'other'

export interface Profile {
  id:                string
  name:              string
  email:             string
  phone?:            string
  username?:         string
  avatar_url?:       string
  plan:              SubscriptionPlan
  sub_status?:       SubscriptionStatus
  sub_expires_at?:   string
  tagashop_slug?:       string
  tagashop_api_key?:    string | null
  tagashop_store_name?: string | null
  role:                 string
  created_at:        string
}

export interface LinkPage {
  id:                      string
  profile_id:              string
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
  custom_btn_style?:       'solid' | 'outline' | 'ghost' | 'gradient'
  custom_btn_shape?:       'rounded' | 'pill' | 'square'
  custom_btn_shadow?:      boolean
  published:               boolean
  seo_title?:              string
  seo_description?:        string
  whatsapp_number?:        string
  whatsapp_message?:       string
  created_at:              string
  updated_at:              string
  items?:                  LinkItem[]
}

export interface LinkItem {
  id:                   string
  page_id:              string
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
  vitrine_title?:         string
  vitrine_layout?:        'list' | 'grid' | 'carousel'
  vitrine_max_products?:  number
  vitrine_only_featured?: boolean
  created_at:           string
}

export interface PageView {
  id:         string
  page_id:    string
  referrer:   ReferrerSource
  country?:   string
  device?:    DeviceType
  session_id?: string
  created_at: string
}

export interface LinkClick {
  id:           string
  link_item_id: string
  page_id:      string
  session_id?:  string
  created_at:   string
}

export interface Subscription {
  id:               string
  profile_id:       string
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
  top_links:     { id: string; label: string; clicks: number; ctr: number }[]
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

export interface TagaShopProduct {
  id:             string
  title:          string
  description:    string | null
  price:          number
  original_price: number | null
  cover_image:    string | null
  product_type:   string
  category:       string | null
  sales:          number
  is_featured:    boolean
  product_url:    string
}

export interface TagaShopCatalog {
  seller: {
    store_name:        string
    store_slug:        string
    store_description: string | null
    store_logo:        string | null
    store_banner:      string | null
    phone:             string
  }
  products:       TagaShopProduct[]
  products_count: number
  generated_at:   string
}
