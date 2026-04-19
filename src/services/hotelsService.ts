import type { HotelsMap } from '../api/types'
import { getHotels } from '../api/mockApi'

type CacheEntry = { at: number; hotels: HotelsMap }

const TTL_MS = 10 * 60 * 1000
const MAX_ENTRIES = 5
const cache = new Map<string, CacheEntry>()

function purge(now: number) {
  for (const [k, v] of cache) {
    if (now - v.at > TTL_MS) cache.delete(k)
  }
  while (cache.size > MAX_ENTRIES) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
    if (!oldest) break
    cache.delete(oldest[0])
  }
}

export async function getHotelsCached(countryId: string): Promise<HotelsMap> {
  const now = Date.now()
  purge(now)

  const cached = cache.get(countryId)
  if (cached) return cached.hotels

  const hotels = await getHotels(countryId)
  cache.set(countryId, { at: now, hotels })
  purge(now)
  return hotels
}
