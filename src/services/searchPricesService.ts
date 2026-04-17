import type {
  ErrorResponse,
  GetSearchPricesResponse,
  PricesMap,
} from '../api/types'
import { getSearchPrices, startSearchPrices } from '../api/mockApi'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function msUntil(iso: string): number {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 0
  return Math.max(0, t - Date.now())
}

function isTooEarlyError(
  e: unknown,
): e is { status: 425; data: ErrorResponse } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    (e as { status?: unknown }).status === 425 &&
    'data' in e
  )
}

type RunSearchArgs = {
  countryId: string
  maxRetries?: number
}

export async function runSearchPrices({
  countryId,
  maxRetries = 2,
}: RunSearchArgs): Promise<PricesMap> {
  let attemptsLeft = maxRetries

  const start = await startSearchPrices(countryId)
  const token = start.token
  let waitUntil = start.waitUntil

  for (;;) {
    const waitMs = msUntil(waitUntil)
    if (waitMs > 0) await sleep(waitMs)

    try {
      const resp: GetSearchPricesResponse = await getSearchPrices(token)
      return resp.prices
    } catch (e) {
      if (isTooEarlyError(e)) {
        const nextWait = e.data.waitUntil
        waitUntil = typeof nextWait === 'string' ? nextWait : waitUntil
        continue
      }

      if (attemptsLeft > 0) {
        attemptsLeft -= 1
        await sleep(400)
        continue
      }

      throw e
    }
  }
}
