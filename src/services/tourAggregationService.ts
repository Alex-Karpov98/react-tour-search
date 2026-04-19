import type { PricesMap } from '../api/types'
import { getCountries } from '../api/mockApi'
import { getHotelsCached } from './hotelsService'

export type TourCardVm = {
  priceId: string
  hotelId: string
  hotelName: string
  countryName: string
  cityName: string
  startDate: string
  amount: number
  currency: string
  imgUrl: string
  flagUrl?: string
}

type CacheEntry = { at: number; map: Record<string, string> }

const TTL_MS = 10 * 60 * 1000
const MAX_ENTRIES = 5
const countriesCache = new Map<string, CacheEntry>()

async function getCountryFlagsById(): Promise<Record<string, string>> {
  const now = Date.now()
  const key = 'all'
  const cached = countriesCache.get(key)
  if (cached && now - cached.at < TTL_MS) return cached.map

  const countries = await getCountries()
  const map: Record<string, string> = {}
  for (const c of Object.values(countries)) map[c.id] = c.flag

  countriesCache.set(key, { at: now, map })
  while (countriesCache.size > MAX_ENTRIES) countriesCache.clear()
  return map
}

export async function buildTourCardsVm(args: {
  countryId: string
  prices: PricesMap
}): Promise<TourCardVm[]> {
  const [hotelsMap, flagByCountryId] = await Promise.all([
    getHotelsCached(args.countryId),
    getCountryFlagsById(),
  ])

  const cards: TourCardVm[] = []

  for (const price of Object.values(args.prices)) {
    const hotelId = price.hotelID
    if (!hotelId) continue

    const hotel = hotelsMap[String(hotelId)]
    if (!hotel) continue

    cards.push({
      priceId: price.id,
      hotelId: String(hotel.id),
      hotelName: hotel.name,
      countryName: hotel.countryName,
      cityName: hotel.cityName,
      startDate: price.startDate,
      amount: price.amount,
      currency: price.currency,
      imgUrl: hotel.img,
      flagUrl: flagByCountryId[hotel.countryId],
    })
  }

  cards.sort((a, b) => a.amount - b.amount)
  return cards
}
