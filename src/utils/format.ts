export function formatDateUk(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const dd = String(d).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${dd}.${mm}.${y}`
}

export function formatAmountUk(amount: number): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(
    amount,
  )
}

export function formatMoneyUk(amount: number, currency: string): string {
  return `${formatAmountUk(amount)} ${currency.toUpperCase()}`
}

export function nightsBetweenInclusive(
  startIso: string,
  endIso: string,
): number {
  const [sy, sm, sd] = startIso.split('-').map(Number)
  const [ey, em, ed] = endIso.split('-').map(Number)
  if (!sy || !sm || !sd || !ey || !em || !ed) return 0

  const start = Date.UTC(sy, sm - 1, sd)
  const end = Date.UTC(ey, em - 1, ed)
  const msPerDay = 86400000
  const raw = Math.round((end - start) / msPerDay)
  return raw > 0 ? raw : 0
}
