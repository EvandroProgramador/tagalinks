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

  if (plan === 'free') return base

  return {
    ...base,
    bg:      page.custom_bg_color      || base.bg,
    primary: page.custom_primary_color || base.primary,
    accent:  page.custom_accent_color  || base.accent,
    text:    page.custom_text_color    || base.text,
    font:    page.custom_font          || base.font,
  }
}

export const THEME_PRESETS = Object.keys(PRESETS)
export const GOOGLE_FONTS = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Raleway', 'Nunito', 'Lato']
