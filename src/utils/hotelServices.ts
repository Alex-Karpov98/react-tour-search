export type HotelServiceVisual = { icon: string; label: string }

const MAP: Record<string, HotelServiceVisual> = {
  wifi: { icon: '📶', label: 'Wi‑Fi' },
  aquapark: { icon: '🏊', label: 'Басейн' },
  tennis_court: { icon: '🎾', label: 'Тенісний корт' },
  laundry: { icon: '🧺', label: 'Пралення' },
  parking: { icon: '🅿️', label: 'Паркінг' },
}

export function serviceVisual(key: string): HotelServiceVisual | null {
  return MAP[key] ?? null
}
