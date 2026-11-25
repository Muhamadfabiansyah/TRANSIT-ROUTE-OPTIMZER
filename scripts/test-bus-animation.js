import fs from 'fs';

const nodes = JSON.parse(fs.readFileSync('src/data/nodes.json', 'utf8'));
const edges = JSON.parse(fs.readFileSync('src/data/edges.json', 'utf8'));

console.log('=== TEST: BUS ANIMATION & GEOMETRY INTERPOLATION ===');

// Extract geometry coordinates from N01 to N08 along optimal path
const path = ['N01', 'N02', 'N03', 'N04', 'N07', 'N08'];
const coords = [];

for (let i = 0; i < path.length - 1; i++) {
  const u = path[i];
  const v = path[i + 1];
  const edge = edges.find(e => e.source === u && e.target === v);
  if (edge) {
    const startIdx = coords.length > 0 ? 1 : 0;
    for (let c = startIdx; c < edge.geometry.length; c++) {
      coords.push(edge.geometry[c]);
    }
  }
}

console.log(`Path: ${path.join(' -> ')}`);
console.log(`Extracted ${coords.length} road coordinates.`);

// Haversine
const R = 6371.0088;
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLat = lat2 - lat1;
  const avgLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * Math.cos(avgLat);
  let angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;
  return Math.round(angleDeg);
}

// Compute cumulative distances
const cumulative = [0];
let total = 0;
for (let i = 0; i < coords.length - 1; i++) {
  const d = haversine(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
  total += d;
  cumulative.push(total);
}
console.log(`Total road distance: ${total.toFixed(3)} km`);

function interpolate(progress) {
  const targetDist = progress * total;
  let segIdx = 0;
  for (let i = 0; i < cumulative.length - 1; i++) {
    if (targetDist >= cumulative[i] && targetDist <= cumulative[i + 1]) {
      segIdx = i;
      break;
    }
  }
  if (progress >= 0.9999) {
    const last = coords.length - 1;
    return {
      lat: coords[last][0],
      lng: coords[last][1],
      bearing: calculateBearing(coords[last - 1][0], coords[last - 1][1], coords[last][0], coords[last][1]),
      isDest: true
    };
  }
  const segStart = cumulative[segIdx];
  const segEnd = cumulative[segIdx + 1];
  const alpha = (targetDist - segStart) / (segEnd - segStart || 1);
  const lat = coords[segIdx][0] + alpha * (coords[segIdx + 1][0] - coords[segIdx][0]);
  const lng = coords[segIdx][1] + alpha * (coords[segIdx + 1][1] - coords[segIdx][1]);
  const bearing = calculateBearing(coords[segIdx][0], coords[segIdx][1], coords[segIdx + 1][0], coords[segIdx + 1][1]);
  return { lat, lng, bearing, isDest: false };
}

[0.0, 0.25, 0.5, 0.75, 1.0].forEach(p => {
  const pt = interpolate(p);
  console.log(`Progress ${(p * 100).toFixed(0)}%: Lat=${pt.lat.toFixed(5)}, Lng=${pt.lng.toFixed(5)}, Bearing=${pt.bearing}°`);
});

const startNode = nodes.find(n => n.id === 'N01');
const endNode = nodes.find(n => n.id === 'N08');
const p0 = interpolate(0);
const p1 = interpolate(1);

const startMatch = Math.abs(p0.lat - startNode.lat) < 0.0001 && Math.abs(p0.lng - startNode.lng) < 0.0001;
const endMatch = Math.abs(p1.lat - endNode.lat) < 0.0001 && Math.abs(p1.lng - endNode.lng) < 0.0001;

console.log(`Origin matches N01: ${startMatch}`);
console.log(`Destination matches N08: ${endMatch}`);

if (startMatch && endMatch) {
  console.log('\n✓ BUS INTERPOLATION TEST PASSED FULLY!');
}
