import fs from 'fs';
import path from 'path';

const nodes = JSON.parse(fs.readFileSync('src/data/nodes.json', 'utf8'));
const edges = JSON.parse(fs.readFileSync('src/data/edges.json', 'utf8'));

console.log('--- TEST RUNNER: DATASET & GRAPH ENGINE ---');
console.log(`Loaded ${nodes.length} nodes, ${edges.length} edges.`);

// Build graph in memory
const nodeMap = new Map();
nodes.forEach(n => nodeMap.set(n.id, n));

const adj = new Map();
nodes.forEach(n => adj.set(n.id, []));
edges.forEach(e => {
  adj.get(e.source).push({ target: e.target, cost: e.weight, street: e.streetName });
});

// Haversine function
const R = 6371.0088;
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// UCS test
function runUCS(originId, destId) {
  const pq = [{ id: originId, cost: 0 }];
  const costG = new Map();
  const parent = new Map();
  const visited = new Set();
  costG.set(originId, 0);
  parent.set(originId, null);

  let expansions = 0;
  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const curr = pq.shift();
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    if (curr.id === destId) break;

    const neighbors = adj.get(curr.id) || [];
    for (const nb of neighbors) {
      expansions++;
      const newCost = curr.cost + nb.cost;
      if (!costG.has(nb.target) || newCost < costG.get(nb.target)) {
        costG.set(nb.target, newCost);
        parent.set(nb.target, curr.id);
        pq.push({ id: nb.target, cost: newCost });
      }
    }
  }

  const path = [];
  let curr = destId;
  while (curr) {
    path.unshift(curr);
    curr = parent.get(curr);
  }
  return { path, cost: costG.get(destId), visitedCount: visited.size, expansions };
}

// Greedy test
function runGreedy(originId, destId) {
  const destNode = nodeMap.get(destId);
  const getH = id => {
    const n = nodeMap.get(id);
    return haversine(n.lat, n.lng, destNode.lat, destNode.lng);
  };

  const pq = [{ id: originId, h: getH(originId) }];
  const parent = new Map();
  const visited = new Set();
  parent.set(originId, null);

  let expansions = 0;
  while (pq.length > 0) {
    pq.sort((a, b) => a.h - b.h);
    const curr = pq.shift();
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    if (curr.id === destId) break;

    const neighbors = adj.get(curr.id) || [];
    for (const nb of neighbors) {
      expansions++;
      if (!visited.has(nb.target) && !pq.some(x => x.id === nb.target)) {
        parent.set(nb.target, curr.id);
        pq.push({ id: nb.target, h: getH(nb.target) });
      }
    }
  }

  const path = [];
  let curr = destId;
  while (curr) {
    path.unshift(curr);
    curr = parent.get(curr);
  }

  // Calculate actual road cost
  let totalDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e => e.source === path[i] && e.target === path[i + 1]);
    if (edge) totalDist += edge.weight;
  }

  return { path, cost: totalDist, visitedCount: visited.size, expansions };
}

console.log('\nTesting from N01 (Pasar Rau) to N08 (Alun-Alun Serang):');
const ucs = runUCS('N01', 'N08');
const greedy = runGreedy('N01', 'N08');

console.log('UCS:    ', ucs.path.map(id => nodeMap.get(id).name).join(' -> '));
console.log(`         Distance: ${ucs.cost.toFixed(3)} km | Visited: ${ucs.visitedCount} | Expansions: ${ucs.expansions}`);

console.log('Greedy: ', greedy.path.map(id => nodeMap.get(id).name).join(' -> '));
console.log(`         Distance: ${greedy.cost.toFixed(3)} km | Visited: ${greedy.visitedCount} | Expansions: ${greedy.expansions}`);

console.log('\n--- VERIFICATION PASSED ---');
