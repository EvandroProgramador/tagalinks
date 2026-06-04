import type { LinkPage } from '@/types'

export interface ComputedTheme {
  bg:        string
  surface:   string
  primary:   string
  accent:    string
  text:      string
  subtext:   string
  border:    string
  font:      string
  btnStyle:  string
  btnShape:  string
  btnShadow: boolean
}

export interface ThemePresetMeta {
  id:      string
  name:    string
  bg:      string
  primary: string
  accent:  string
  dark:    boolean
}

const SHAPE_RADIUS: Record<string, string> = {
  rounded: '0.75rem',
  pill:    '9999px',
  square:  '0.375rem',
}

const PRESETS: Record<string, ComputedTheme> = {
  tagatech: {
    bg: '#0A0A0F', surface: '#13131A', primary: '#7C3AED', accent: '#06B6D4',
    text: '#F8F8FF', subtext: '#9B9BAA', border: '#2A2A3A', font: 'Inter',
    btnStyle: 'gradient', btnShape: SHAPE_RADIUS.rounded, btnShadow: false,
  },
  light: {
    bg: '#FFFFFF', surface: '#F4F4F8', primary: '#7C3AED', accent: '#06B6D4',
    text: '#13131A', subtext: '#5F5E5A', border: '#E0E0EA', font: 'Inter',
    btnStyle: 'solid', btnShape: SHAPE_RADIUS.rounded, btnShadow: false,
  },
  midnight: {
    bg: '#0D1117', surface: '#161B22', primary: '#2563EB', accent: '#38BDF8',
    text: '#E6EDF3', subtext: '#8B949E', border: '#21262D', font: 'Inter',
    btnStyle: 'solid', btnShape: SHAPE_RADIUS.rounded, btnShadow: false,
  },
  forest: {
    bg: '#0A140B', surface: '#111A12', primary: '#16A34A', accent: '#86EFAC',
    text: '#F0FDF4', subtext: '#86EFAC', border: '#1A2E1B', font: 'Nunito',
    btnStyle: 'solid', btnShape: SHAPE_RADIUS.pill, btnShadow: false,
  },
  sunset: {
    bg: '#120808', surface: '#1C1010', primary: '#DC2626', accent: '#FB923C',
    text: '#FFF5F5', subtext: '#FCA5A5', border: '#3A1515', font: 'Poppins',
    btnStyle: 'gradient', btnShape: SHAPE_RADIUS.rounded, btnShadow: true,
  },
  ocean: {
    bg: '#050F1A', surface: '#0A1628', primary: '#0891B2', accent: '#34D399',
    text: '#F0FDFA', subtext: '#7DD3FC', border: '#0E2A3A', font: 'Raleway',
    btnStyle: 'outline', btnShape: SHAPE_RADIUS.pill, btnShadow: false,
  },
  rose: {
    bg: '#110008', surface: '#1C0012', primary: '#DB2777', accent: '#F472B6',
    text: '#FFF0F6', subtext: '#F9A8D4', border: '#3A0020', font: 'Nunito',
    btnStyle: 'gradient', btnShape: SHAPE_RADIUS.pill, btnShadow: true,
  },
  dark_coral: {
    bg: '#0F0A0A', surface: '#1A1010', primary: '#E05C2E', accent: '#F5A623',
    text: '#FFF8F5', subtext: '#AA8B80', border: '#3A2A20', font: 'Inter',
    btnStyle: 'solid', btnShape: SHAPE_RADIUS.rounded, btnShadow: false,
  },
  minimal: {
    bg: '#F9F9F9', surface: '#FFFFFF', primary: '#18181B', accent: '#71717A',
    text: '#09090B', subtext: '#52525B', border: '#E4E4E7', font: 'Inter',
    btnStyle: 'outline', btnShape: SHAPE_RADIUS.square, btnShadow: false,
  },
}

export function computeTheme(page: LinkPage, plan: string): ComputedTheme {
  const base = PRESETS[page.theme_preset] || PRESETS['tagatech']
  if (plan === 'free') return base
  return {
    ...base,
    bg:        page.custom_bg_color      || base.bg,
    primary:   page.custom_primary_color || base.primary,
    accent:    page.custom_accent_color  || base.accent,
    text:      page.custom_text_color    || base.text,
    font:      page.custom_font          || base.font,
    btnStyle:  page.custom_btn_style     || base.btnStyle,
    btnShape:  SHAPE_RADIUS[page.custom_btn_shape || ''] || base.btnShape,
    btnShadow: page.custom_btn_shadow    ?? base.btnShadow,
  }
}

export { SHAPE_RADIUS }

export const THEME_PRESETS_META: ThemePresetMeta[] = [
  { id: 'tagatech',   name: 'TAGATECH',  bg: '#0A0A0F', primary: '#7C3AED', accent: '#06B6D4', dark: true },
  { id: 'midnight',   name: 'Midnight',  bg: '#0D1117', primary: '#2563EB', accent: '#38BDF8', dark: true },
  { id: 'forest',     name: 'Forest',    bg: '#0A140B', primary: '#16A34A', accent: '#86EFAC', dark: true },
  { id: 'sunset',     name: 'Sunset',    bg: '#120808', primary: '#DC2626', accent: '#FB923C', dark: true },
  { id: 'ocean',      name: 'Ocean',     bg: '#050F1A', primary: '#0891B2', accent: '#34D399', dark: true },
  { id: 'rose',       name: 'Rosas',     bg: '#110008', primary: '#DB2777', accent: '#F472B6', dark: true },
  { id: 'dark_coral', name: 'Coral',     bg: '#0F0A0A', primary: '#E05C2E', accent: '#F5A623', dark: true },
  { id: 'light',      name: 'Claro',     bg: '#FFFFFF', primary: '#7C3AED', accent: '#06B6D4', dark: false },
  { id: 'minimal',    name: 'Minimal',   bg: '#F9F9F9', primary: '#18181B', accent: '#71717A', dark: false },
]

export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #0A0A0F 0%, #1A0A30 100%)',
  'linear-gradient(135deg, #050F1A 0%, #0A1A2A 100%)',
  'linear-gradient(135deg, #0A140B 0%, #0A200A 100%)',
  'linear-gradient(160deg, #120808 0%, #200A00 100%)',
  'linear-gradient(135deg, #110008 0%, #200010 100%)',
  'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
]

export const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Raleway',
  'Nunito', 'Lato', 'Open Sans', 'Playfair Display', 'DM Sans',
]

export const THEME_PRESETS = Object.keys(PRESETS)
