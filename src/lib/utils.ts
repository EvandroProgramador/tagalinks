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
    .replace(/[̀-ͯ]/g, '')
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
