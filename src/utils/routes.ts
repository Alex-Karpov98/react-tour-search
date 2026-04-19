export function tourDetailsUrl(priceId: string, hotelId: string): string {
  return `/tour?priceId=${encodeURIComponent(priceId)}&hotelId=${encodeURIComponent(hotelId)}`
}
