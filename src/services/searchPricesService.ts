import type {
  ErrorResponse,
  GetSearchPricesResponse,
  PricesMap,
} from '../api/types'
import {
  getSearchPrices,
  startSearchPrices,
  stopSearchPrices,
} from '../api/mockApi'

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const t = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(t)
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort)
  })

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
  signal?: AbortSignal
  onToken?: (token: string) => void
}

export async function runSearchPrices({
  countryId,
  maxRetries = 2,
  signal,
  onToken,
}: RunSearchArgs): Promise<PricesMap> {
  let attemptsLeft = maxRetries

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const start = await startSearchPrices(countryId)
  const token = start.token
  onToken?.(token)
  let waitUntil = start.waitUntil

  for (;;) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const waitMs = msUntil(waitUntil)
    if (waitMs > 0) await sleep(waitMs, signal)

    try {
      const resp: GetSearchPricesResponse = await getSearchPrices(token)
      return resp.prices
    } catch (e) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

      if (isTooEarlyError(e)) {
        const nextWait = e.data.waitUntil
        waitUntil = typeof nextWait === 'string' ? nextWait : waitUntil
        continue
      }

      if (attemptsLeft > 0) {
        attemptsLeft -= 1
        await sleep(400, signal)
        continue
      }

      throw e
    }
  }
}

export async function cancelSearch(token: string): Promise<void> {
  await stopSearchPrices(token)
}
