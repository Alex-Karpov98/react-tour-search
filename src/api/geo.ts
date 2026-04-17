import {
  getCountries as apiGetCountries,
  searchGeo as apiSearchGeo,
} from './mockApi'

export type GeoKind = 'country' | 'city' | 'hotel'

export type GeoItem = {
  id: string
  name: string
  kind: GeoKind
  flagUrl?: string
  countryId?: string
}

export async function getCountries(): Promise<GeoItem[]> {
  const map = await apiGetCountries()
  return Object.values(map).map((c) => ({
    id: c.id,
    name: c.name,
    kind: 'country',
    flagUrl: c.flag,
  }))
}

export async function searchGeo(search: string): Promise<GeoItem[]> {
  const map = await apiSearchGeo(search)
  return Object.values(map).map((x) => ({
    id: String(x.id),
    name: x.name,
    kind: x.type,
    flagUrl: x.type === 'country' ? x.flag : undefined,
    countryId:
      x.type === 'country'
        ? x.id
        : 'countryId' in x && typeof x.countryId === 'string'
          ? x.countryId
          : undefined,
  }))
}
