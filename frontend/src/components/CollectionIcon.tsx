import { Apple, Leaf, Recycle, Trash2 } from 'lucide-react'
import type { CollectionType } from '../types'

const ICONS = { garbage: Trash2, food_scraps: Apple, recycling: Recycle, yard_waste: Leaf }

export function CollectionIcon({ type, size = 22 }: { type: CollectionType; size?: number }) {
  const Icon = ICONS[type]
  return (
    <span className={`cicon c-${type}`} aria-hidden>
      <Icon size={size} strokeWidth={2.2} />
    </span>
  )
}

export function Dot({ type }: { type: CollectionType }) {
  return <span className={`dot c-${type}`} aria-hidden />
}
