export type CollectionType = 'garbage' | 'food_scraps' | 'recycling' | 'yard_waste'
export type Bin = 'recycling' | 'compost' | 'garbage' | 'hazardous' | 'ewaste'
export type Language = 'en' | 'fr' | 'es' | 'pa'

export interface AddressInfo {
  display: string
  zone_name: string
}

export interface User {
  id: number
  email: string
  display_name: string
  language: Language
  dark_mode: boolean
  notifications_enabled: boolean
  address: AddressInfo | null
}

export interface Pickup {
  date: string // YYYY-MM-DD
  type: CollectionType
  window: string
  shifted_from: string | null
}

export interface MonthSchedule {
  address: AddressInfo
  year: number
  month: number
  pickups: Pickup[]
}

export interface NextPickups {
  address: AddressInfo
  days: { date: string; pickups: Pickup[] }[]
}

export interface Item {
  id: number
  name: string
  category: string
  bin: Bin
  tip: string
}

export interface Classification {
  text: string
  source: 'database' | 'model'
  bin: Bin
  confidence: number
  alternatives: { bin: Bin; confidence: number }[]
  item: Item | null
}

export interface ActivityEntry {
  id: number
  kind: 'reminder' | 'announcement'
  title: string
  body: string
  read: boolean
  created_at: string
}
