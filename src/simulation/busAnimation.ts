import { haversineDistance } from '../graph/distance';

export interface RouteGeometrySegments {
  coordinates: [number, number][];
  cumulativeDistances: number[];
  totalDistanceKm: number;
}

export interface BusPosition {
  lat: number;
  lng: number;
  bearing: number; // Heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  segmentIndex: number;
  isDestination: boolean;
}

/**
 * Pre-computes cumulative distances along a polyline to enable smooth constant-speed interpolation.
 */
export function buildGeometrySegments(coordinates: [number, number][]): RouteGeometrySegments {
  if (coordinates.length === 0) {
    return { coordinates: [], cumulativeDistances: [0], totalDistanceKm: 0 };
  }
  if (coordinates.length === 1) {
    return { coordinates, cumulativeDistances: [0], totalDistanceKm: 0 };
  }

  const cumulativeDistances: number[] = [0];
  let accumulated = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[i + 1];
    const segDist = haversineDistance(lat1, lng1, lat2, lng2);
    accumulated += segDist;
    cumulativeDistances.push(accumulated);
  }

  return {
    coordinates,
    cumulativeDistances,
    totalDistanceKm: accumulated,
  };
}

/**
 * Shortest angular interpolation between two degree angles [0, 360).
 */
export function interpolateAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  let result = a + diff * t;
  if (result < 0) result += 360;
  return Math.round(result % 360);
}

/**
 * Interpolates coordinate and bearing angle for a given progress ratio [0, 1].
 * Accurately aligns to road centerline and gently eases bearing when approaching turns.
 */
export function interpolateBusPosition(
  segments: RouteGeometrySegments,
  progress: number
): BusPosition | null {
  const { coordinates, cumulativeDistances, totalDistanceKm } = segments;
  if (coordinates.length === 0) return null;

  if (coordinates.length === 1 || totalDistanceKm === 0) {
    return {
      lat: coordinates[0][0],
      lng: coordinates[0][1],
      bearing: 0,
      segmentIndex: 0,
      isDestination: true,
    };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const targetDist = clampedProgress * totalDistanceKm;

  // Find corresponding segment
  let segIdx = 0;
  for (let i = 0; i < cumulativeDistances.length - 1; i++) {
    if (targetDist >= cumulativeDistances[i] && targetDist <= cumulativeDistances[i + 1]) {
      segIdx = i;
      break;
    }
  }

  // Handle boundary at the exact destination
  if (clampedProgress >= 0.9999) {
    const lastIdx = coordinates.length - 1;
    const prevIdx = Math.max(0, lastIdx - 1);
    const bearing = calculateBearing(
      coordinates[prevIdx][0],
      coordinates[prevIdx][1],
      coordinates[lastIdx][0],
      coordinates[lastIdx][1]
    );

    return {
      lat: coordinates[lastIdx][0],
      lng: coordinates[lastIdx][1],
      bearing,
      segmentIndex: lastIdx - 1,
      isDestination: true,
    };
  }

  const segStartDist = cumulativeDistances[segIdx];
  const segEndDist = cumulativeDistances[segIdx + 1];
  const segLength = segEndDist - segStartDist;

  const alpha = segLength > 0 ? (targetDist - segStartDist) / segLength : 0;

  const p1 = coordinates[segIdx];
  const p2 = coordinates[segIdx + 1];

  const lat = p1[0] + alpha * (p2[0] - p1[0]);
  const lng = p1[1] + alpha * (p2[1] - p1[1]);

  let bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

  // Smooth steering around corners: gently transition bearing as bus nears vertex
  if (alpha > 0.75 && segIdx < coordinates.length - 2) {
    const p3 = coordinates[segIdx + 2];
    const nextBearing = calculateBearing(p2[0], p2[1], p3[0], p3[1]);
    const turnFactor = (alpha - 0.75) / 0.25;
    bearing = interpolateAngle(bearing, nextBearing, turnFactor);
  }

  return {
    lat,
    lng,
    bearing,
    segmentIndex: segIdx,
    isDestination: false,
  };
}

/**
 * Calculates geographic bearing angle from point 1 to point 2 in degrees.
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = lat2 - lat1;
  const avgLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * Math.cos(avgLat);

  let angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (angleDeg < 0) {
    angleDeg += 360;
  }
  return Math.round(angleDeg);
}
