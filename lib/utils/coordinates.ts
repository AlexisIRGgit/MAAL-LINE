/** A map pin as stored on addresses. */
export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Validates a latitude/longitude pair from untrusted input.
 * Returns null when either value is missing, non-numeric or out of range.
 */
export function parseCoordinates(latitude: unknown, longitude: unknown): Coordinates | null {
  const lat = typeof latitude === 'string' ? Number(latitude) : latitude
  const lng = typeof longitude === 'string' ? Number(longitude) : longitude
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { latitude: lat, longitude: lng }
}
