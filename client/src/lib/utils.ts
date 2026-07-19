import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateOrderId(): string {
  return `HD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
}

export function getImageUrl(url: string, width = 800): string {
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=80&auto=format&fit=crop`
  }
  return url
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }) as T
}

export const SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
}

export const COLORS_MAP: Record<string, string> = {
  Black: '#0A0A0A',
  White: '#FFFFFF',
  Navy: '#1B2A4A',
  Grey: '#9CA3AF',
  Khaki: '#C3B091',
  Burgundy: '#800020',
  Olive: '#556B2F',
  Camel: '#C19A6B',
  Brown: '#6F4E37',
  Cream: '#FFFDD0',
  Blue: '#1D4ED8',
  Green: '#166534',
  'Forest Green': '#228B22',
  'Stone': '#B5A492',
  Charcoal: '#36454F',
  Tan: '#D2B48C',
  Slate: '#708090',
  Ash: '#B2BEB5',
  Indigo: '#3730A3',
  'Cognac': '#9D3B1C',
  'Terracotta': '#C96B4B',
}
