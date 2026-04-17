import type { CountriesMap, GeoResponse } from './types'

import {
  getCountries as apiGetCountries,
  searchGeo as apiSearchGeo,
} from './api.js'

async function parseJson<T>(resp: Response): Promise<T> {
  return (await resp.json()) as T
}

async function call<T>(p: Promise<Response>): Promise<T> {
  try {
    const resp = await p
    return await parseJson<T>(resp)
  } catch (e) {
    if (e instanceof Response) {
      const data = await e.json().catch(() => null)
      throw Object.assign(new Error('API error'), { status: e.status, data })
    }
    throw e
  }
}

export async function getCountries(): Promise<CountriesMap> {
  return await call<CountriesMap>(apiGetCountries())
}

export async function searchGeo(query: string): Promise<GeoResponse> {
  return await call<GeoResponse>(apiSearchGeo(query))
}
