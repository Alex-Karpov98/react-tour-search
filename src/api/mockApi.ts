import type {
  CountriesMap,
  GeoResponse,
  GetSearchPricesResponse,
  Hotel,
  HotelsMap,
  PriceOffer,
  StartSearchResponse,
} from './types'

import {
  getCountries as apiGetCountries,
  getHotel as apiGetHotel,
  getHotels as apiGetHotels,
  getPrice as apiGetPrice,
  getSearchPrices as apiGetSearchPrices,
  searchGeo as apiSearchGeo,
  startSearchPrices as apiStartSearchPrices,
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

export async function startSearchPrices(
  countryID: string,
): Promise<StartSearchResponse> {
  return await call<StartSearchResponse>(apiStartSearchPrices(countryID))
}

export async function getSearchPrices(
  token: string,
): Promise<GetSearchPricesResponse> {
  return await call<GetSearchPricesResponse>(apiGetSearchPrices(token))
}

export async function getHotels(countryID: string): Promise<HotelsMap> {
  return await call<HotelsMap>(apiGetHotels(countryID))
}

export async function getHotel(hotelId: number | string): Promise<Hotel> {
  const normalized =
    typeof hotelId === 'string' && /^\d+$/.test(hotelId)
      ? Number(hotelId)
      : hotelId
  return await call<Hotel>(apiGetHotel(normalized))
}

export async function getPrice(priceId: string): Promise<PriceOffer> {
  return await call<PriceOffer>(apiGetPrice(priceId))
}
