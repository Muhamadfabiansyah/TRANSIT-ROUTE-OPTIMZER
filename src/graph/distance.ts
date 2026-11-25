/**
 * Geographic Distance Calculations for Serang Transit Route Optimizer
 * Uses standard WGS-84 Earth radius (6,371.0088 km).
 */

const EARTH_RADIUS_KM = 6371.0088;

/**
 * Calculates straight-line great-circle distance between two coordinates using Haversine formula.
 * Used as heuristic h(n) in Greedy Best-First Search and for road segment calculations.
 * 
 * Formula:
 *   Δφ = (lat2 - lat1) in radians
 *   Δλ = (lon2 - lon1) in radians
 *   a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
 *   c = 2 × atan2(√a, √(1-a))
 *   d = R × c
 * 
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers (clamped to prevent NaN on floating point boundary)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);

  const a =
    sinHalfLat * sinHalfLat +
    Math.cos(phi1) * Math.cos(phi2) * sinHalfLon * sinHalfLon;

  // Clamp a to [0, 1] to prevent floating point imprecision causing negative (1 - a) resulting in NaN
  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates total road distance along a polyline coordinates array.
 * 
 * @param coordinates Array of [lat, lng] pairs representing road geometry
 * @returns Cumulative road distance in kilometers rounded to 4 decimal places
 */
export function calculatePolylineDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;

  let totalDist = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];
    totalDist += haversineDistance(lat1, lon1, lat2, lon2);
  }

  return Math.round(totalDist * 10000) / 10000;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
