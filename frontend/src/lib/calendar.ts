import type { CollectionType, Pickup } from '../types'

export interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
}

export const pad = (n: number) => String(n).padStart(2, '0')
export const toIso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

export function todayIso(now = new Date()): string {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** A Sunday-first grid of 5 or 6 full weeks covering the month (month is 1-12). */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const daysInMonth = new Date(year, month, 0).getDate()
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7)

  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return {
      iso: toIso(d.getFullYear(), d.getMonth() + 1, d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month - 1,
    }
  })
}

export function groupByDate(pickups: Pickup[]): Map<string, Pickup[]> {
  const map = new Map<string, Pickup[]>()
  for (const p of pickups) {
    const list = map.get(p.date) ?? []
    list.push(p)
    map.set(p.date, list)
  }
  return map
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const zeroBased = year * 12 + (month - 1) + delta
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 }
}

export const COLLECTION_ORDER: CollectionType[] = ['garbage', 'food_scraps', 'recycling', 'yard_waste']

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
