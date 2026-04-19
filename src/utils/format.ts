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
