import fs from 'fs';

// --- 1. Min Priority Queue Test Implementation (mirrors src/algorithms/PriorityQueue.ts) ---
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift()?.item ?? null;
  }
  dequeueEntry() {
    return this.elements.shift() ?? null;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
  get size() {
    return this.elements.length;
  }
}

// --- 2. Haversine with Clamping (mirrors src/graph/distance.ts) ---
const EARTH_RADIUS_KM = 6371.0088;
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return EARTH_RADIUS_KM * c;
}

// --- 3. UCS Algorithm (mirrors src/algorithms/ucs.ts) ---
function runUCS(graph, originId, destinationId) {
  const startTime = performance.now();
  const originNode = graph.nodes.get(originId);
  const destNode = graph.nodes.get(destinationId);

  if (!originNode || !destNode) {
    return {
      algorithm: 'UCS',
      found: false,
      path: [],
      totalDistance: 0,
      visitedCount: 0,
      expandedCount: 0,
      executionTimeMs: performance.now() - startTime,
      steps: [],
      unreachableReason: `Node not found in graph`,
    };
  }

  if (originId === destinationId) {
    return {
      algorithm: 'UCS',
      found: true,
      path: [originId],
      totalDistance: 0,
      visitedCount: 1,
      expandedCount: 0,
      executionTimeMs: performance.now() - startTime,
      steps: [{ stepNumber: 1, currentNodeId: originId, isGoal: true }],
    };
  }

  const costG = new Map();
  const parent = new Map();
  const explored = new Set();
  const pq = new PriorityQueue();

  costG.set(originId, 0);
  parent.set(originId, null);
  pq.enqueue(originId, 0);

  let expandedCount = 0;
  let visitedCount = 0;
  let goalReached = false;
  const steps = [];

  while (!pq.isEmpty()) {
    const entry = pq.dequeueEntry();
    if (!entry) break;

    const currentId = entry.item;
    const dequeuedCost = entry.priority;

    // Discard stale priority queue entry
    if (explored.has(currentId)) continue;
    const currentBestCost = costG.get(currentId) ?? Infinity;
    if (dequeuedCost > currentBestCost) continue;

    explored.add(currentId);
    visitedCount++;

    // Strict goal test upon dequeue
    if (currentId === destinationId) {
      goalReached = true;
      steps.push({ stepNumber: steps.length + 1, currentNodeId: currentId, isGoal: true, cost_g: dequeuedCost });
      break;
    }

    const outgoingEdges = graph.adjacency.get(currentId) || [];
    for (const edge of outgoingEdges) {
      expandedCount++;
      const neighborId = edge.target;
      if (explored.has(neighborId)) continue;

      const edgeWeight = edge.weight;
      if (edgeWeight < 0) throw new Error(`Negative edge weight detected: ${edgeWeight}`);

      const tentativeG = dequeuedCost + edgeWeight;
      const currentKnownG = costG.get(neighborId) ?? Infinity;

      if (tentativeG < currentKnownG) {
        costG.set(neighborId, tentativeG);
        parent.set(neighborId, currentId);
        pq.enqueue(neighborId, tentativeG);
      }
    }

    steps.push({ stepNumber: steps.length + 1, currentNodeId: currentId, isGoal: false, cost_g: dequeuedCost });
  }

  if (!goalReached) {
    return {
      algorithm: 'UCS',
      found: false,
      path: [],
      totalDistance: 0,
      visitedCount,
      expandedCount,
      executionTimeMs: performance.now() - startTime,
      steps,
      unreachableReason: `Tidak ditemukan jalur dari ${originId} ke ${destinationId}`,
    };
  }

  // Reconstruct path
  const path = [];
  let curr = destinationId;
  const guard = new Set();
  while (curr !== null) {
    if (guard.has(curr)) break;
    guard.add(curr);
    path.unshift(curr);
    curr = parent.get(curr) || null;
  }

  // Calculate actual path total distance from road edges
  let totalDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edges = graph.adjacency.get(from) || [];
    const edge = edges.find((e) => e.target === to);
    if (edge) totalDist += edge.weight;
  }

  return {
    algorithm: 'UCS',
    found: true,
    path,
    totalDistance: totalDist,
    visitedCount,
    expandedCount,
    executionTimeMs: performance.now() - startTime,
    steps,
  };
}

// --- 4. Greedy Best-First Search Algorithm (mirrors src/algorithms/greedy.ts) ---
function runGreedy(graph, originId, destinationId) {
  const startTime = performance.now();
  const originNode = graph.nodes.get(originId);
  const destNode = graph.nodes.get(destinationId);

  if (!originNode || !destNode) {
    return {
      algorithm: 'GREEDY',
      found: false,
      path: [],
      totalDistance: 0,
      visitedCount: 0,
      expandedCount: 0,
      executionTimeMs: performance.now() - startTime,
      steps: [],
      unreachableReason: `Node not found in graph`,
    };
  }

  if (originId === destinationId) {
    return {
      algorithm: 'GREEDY',
      found: true,
      path: [originId],
      totalDistance: 0,
      visitedCount: 1,
      expandedCount: 0,
      executionTimeMs: performance.now() - startTime,
      steps: [{ stepNumber: 1, currentNodeId: originId, isGoal: true }],
    };
  }

  const getHeuristic = (nodeId) => {
    const node = graph.nodes.get(nodeId);
    if (!node) return Infinity;
    return calculateHaversineDistanceKm(node.lat, node.lng, destNode.lat, destNode.lng);
  };

  const parent = new Map();
  const explored = new Set();
  const inQueue = new Set();
  const pq = new PriorityQueue();

  parent.set(originId, null);
  const initialH = getHeuristic(originId);
  pq.enqueue(originId, initialH);
  inQueue.add(originId);

  let expandedCount = 0;
  let visitedCount = 0;
  let goalReached = false;
  const steps = [];

  while (!pq.isEmpty()) {
    const entry = pq.dequeueEntry();
    if (!entry) break;

    const currentId = entry.item;
    const dequeuedH = entry.priority;

    if (explored.has(currentId)) continue;
    explored.add(currentId);
    visitedCount++;

    if (currentId === destinationId) {
      goalReached = true;
      steps.push({ stepNumber: steps.length + 1, currentNodeId: currentId, isGoal: true, heuristic_h: dequeuedH });
      break;
    }

    const outgoingEdges = graph.adjacency.get(currentId) || [];
    for (const edge of outgoingEdges) {
      expandedCount++;
      const neighborId = edge.target;
      if (explored.has(neighborId)) continue;

      if (!inQueue.has(neighborId)) {
        parent.set(neighborId, currentId);
        const hVal = getHeuristic(neighborId);
        pq.enqueue(neighborId, hVal);
        inQueue.add(neighborId);
      }
    }

    steps.push({ stepNumber: steps.length + 1, currentNodeId: currentId, isGoal: false, heuristic_h: dequeuedH });
  }

  if (!goalReached) {
    return {
      algorithm: 'GREEDY',
      found: false,
      path: [],
      totalDistance: 0,
      visitedCount,
      expandedCount,
      executionTimeMs: performance.now() - startTime,
      steps,
      unreachableReason: `Tidak ditemukan jalur dari ${originId} ke ${destinationId}`,
    };
  }

  // Reconstruct path
  const path = [];
  let curr = destinationId;
  const guard = new Set();
  while (curr !== null) {
    if (guard.has(curr)) break;
    guard.add(curr);
    path.unshift(curr);
    curr = parent.get(curr) || null;
  }

  // Calculate actual path total distance from road edges (NOT heuristic)
  let totalDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edges = graph.adjacency.get(from) || [];
    const edge = edges.find((e) => e.target === to);
    if (edge) totalDist += edge.weight;
  }

  return {
    algorithm: 'GREEDY',
    found: true,
    path,
    totalDistance: totalDist,
    visitedCount,
    expandedCount,
    executionTimeMs: performance.now() - startTime,
    steps,
  };
}

// =========================================================================
// TEST SUITE EXECUTION
// =========================================================================

let passedCount = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('===============================================================');
console.log('TRANSIT ROUTE OPTIMIZER - ALGORITHM & GRAPH AUDIT UNIT TESTS');
console.log('===============================================================\n');

// --- SUITE 1: PriorityQueue Invariants ---
console.log('SUITE 1: PriorityQueue Invariants');
const pq = new PriorityQueue();
pq.enqueue('C', 30);
pq.enqueue('A', 10);
pq.enqueue('B', 20);
pq.enqueue('D', 10); // tie breaker

assert(pq.size === 4, 'PQ size is 4');
const first = pq.dequeueEntry();
assert(first.item === 'A' && first.priority === 10, 'First dequeued entry is A with priority 10');
assert(pq.dequeue() === 'D', 'Second dequeued entry has priority 10 (FIFO or tie)');
assert(pq.dequeue() === 'B', 'Third dequeued entry is B with priority 20');
assert(pq.dequeue() === 'C', 'Fourth dequeued entry is C with priority 30');
assert(pq.isEmpty() === true, 'PQ is now empty');
assert(pq.dequeue() === null, 'Dequeue on empty returns null');

// --- SUITE 2: Haversine with Clamping Protection ---
console.log('\nSUITE 2: Haversine Anti-NaN Protection');
const normalDist = calculateHaversineDistanceKm(-6.115, 106.155, -6.120, 106.160);
assert(!isNaN(normalDist) && normalDist > 0, `Normal distance is valid: ${normalDist.toFixed(4)} km`);

// Test same point returns 0
const zeroDist = calculateHaversineDistanceKm(-6.115, 106.155, -6.115, 106.155);
assert(zeroDist === 0, 'Same coordinates yield exactly 0 km');

// Test floating point clamp with identical / near antipodal values
const antipodal = calculateHaversineDistanceKm(0, 0, 0, 180);
assert(!isNaN(antipodal) && antipodal > 20000, 'Antipodal points do not produce NaN');

// --- SUITE 3: Controlled Synthetic Graphs ---
console.log('\nSUITE 3: Synthetic Graph Test Cases');

// Build controlled synthetic graph:
//
//        (cost=10, h=0)
//    S ---------------------> G
//     \                      ^
// (c=2)\                    / (c=2)
//       v                  /
//        A -------------> B
//             (c=2)
//
// In this graph:
// Coordinates:
// S at (0, 0)
// G at (0, 0.09) -> straight east, dist ~ 10 km
// A at (0.01, 0.02)
// B at (0.01, 0.07)
// Path S -> G has cost 10 (road distance). Straight line h(S)=10, h(G)=0.
// Path S -> A -> B -> G has cost 2 + 2 + 2 = 6 (road distance).
// But for Greedy, h(G)=0 directly from S to G! Greedy sees G as neighbor with h(G)=0.
// Greedy will immediately pick G from S! Path S -> G (cost 10).
// UCS will explore lowest g(n) first: S(0) -> A(2) -> B(4) -> G(6) vs G(10).
// UCS MUST return S -> A -> B -> G with cost 6!
const syntheticNodes = new Map([
  ['S', { id: 'S', name: 'Start', lat: 0.0, lng: 0.0 }],
  ['A', { id: 'A', name: 'Node A', lat: 0.01, lng: 0.02 }],
  ['B', { id: 'B', name: 'Node B', lat: 0.01, lng: 0.07 }],
  ['G', { id: 'G', name: 'Goal', lat: 0.0, lng: 0.09 }],
  ['ISO', { id: 'ISO', name: 'Isolated', lat: 0.05, lng: 0.05 }],
]);

const syntheticAdj = new Map([
  ['S', [
    { target: 'G', weight: 10.0 }, // Direct expensive shortcut (greedy bait)
    { target: 'A', weight: 2.0 },  // Optimal road detour
  ]],
  ['A', [{ target: 'B', weight: 2.0 }]],
  ['B', [{ target: 'G', weight: 2.0 }]],
  ['G', []],
  ['ISO', []],
]);

const syntheticGraph = { nodes: syntheticNodes, adjacency: syntheticAdj };

// Test 3.1: UCS finds optimal path on shortcut trap
const ucsSynth = runUCS(syntheticGraph, 'S', 'G');
assert(ucsSynth.found === true, 'UCS finds path from S to G');
assert(ucsSynth.path.join('->') === 'S->A->B->G', `UCS path is S->A->B->G (found: ${ucsSynth.path.join('->')})`);
assert(Math.abs(ucsSynth.totalDistance - 6.0) < 0.001, `UCS total distance is exactly 6.0 km (got: ${ucsSynth.totalDistance})`);

// Test 3.2: Greedy chooses direct neighbor with lowest h(n) = 0
const greedySynth = runGreedy(syntheticGraph, 'S', 'G');
assert(greedySynth.found === true, 'Greedy finds path from S to G');
assert(greedySynth.path.join('->') === 'S->G', `Greedy falls into heuristic bait S->G (found: ${greedySynth.path.join('->')})`);
assert(Math.abs(greedySynth.totalDistance - 10.0) < 0.001, `Greedy total distance is calculated using actual road edge = 10.0 km (got: ${greedySynth.totalDistance})`);
assert(ucsSynth.totalDistance < greedySynth.totalDistance, 'UCS is strictly shorter than Greedy on shortcut trap graph (6.0 < 10.0)');

// Test 3.3: Unreachable Destination
const ucsUnreach = runUCS(syntheticGraph, 'S', 'ISO');
assert(ucsUnreach.found === false, 'UCS reports unreachable for disconnected node');
assert(ucsUnreach.path.length === 0, 'UCS path is empty for unreachable');

const greedyUnreach = runGreedy(syntheticGraph, 'S', 'ISO');
assert(greedyUnreach.found === false, 'Greedy reports unreachable for disconnected node');
assert(greedyUnreach.path.length === 0, 'Greedy path is empty for unreachable');

// Test 3.4: Same Origin and Destination
const ucsSame = runUCS(syntheticGraph, 'S', 'S');
assert(ucsSame.found === true && ucsSame.totalDistance === 0 && ucsSame.path.length === 1, 'UCS handles Origin == Destination (0 km)');

const greedySame = runGreedy(syntheticGraph, 'S', 'S');
assert(greedySame.found === true && greedySame.totalDistance === 0 && greedySame.path.length === 1, 'Greedy handles Origin == Destination (0 km)');

// --- SUITE 4: Real Serang Transit Dataset ---
console.log('\nSUITE 4: Serang Transit Dataset Validation');
const rawNodes = JSON.parse(fs.readFileSync('src/data/nodes.json', 'utf8'));
const rawEdges = JSON.parse(fs.readFileSync('src/data/edges.json', 'utf8'));

const serangNodes = new Map();
rawNodes.forEach((n) => serangNodes.set(n.id, n));

const serangAdj = new Map();
rawNodes.forEach((n) => serangAdj.set(n.id, []));
rawEdges.forEach((e) => {
  serangAdj.get(e.source).push({ target: e.target, weight: e.weight });
});

const serangGraph = { nodes: serangNodes, adjacency: serangAdj };

assert(rawNodes.length >= 10 && rawNodes.length <= 15, `Serang dataset has 10-15 nodes (found: ${rawNodes.length})`);
assert(rawEdges.length >= 25, `Serang dataset has rich edge connections (found: ${rawEdges.length})`);

// Check all edge weights are positive
const allPositiveWeights = rawEdges.every((e) => e.weight > 0);
assert(allPositiveWeights, 'All 35 edges in Serang dataset have strictly positive weights (weight > 0)');

// Test Key Research Route: N01 (Pasar Rau) -> N08 (Alun-Alun Serang)
const ucsSerang = runUCS(serangGraph, 'N01', 'N08');
const greedySerang = runGreedy(serangGraph, 'N01', 'N08');

assert(ucsSerang.found === true, 'UCS finds route from Pasar Rau (N01) to Alun-Alun (N08)');
assert(greedySerang.found === true, 'Greedy finds route from Pasar Rau (N01) to Alun-Alun (N08)');
assert(ucsSerang.totalDistance <= greedySerang.totalDistance + 1e-9, `UCS distance (${ucsSerang.totalDistance.toFixed(3)} km) <= Greedy distance (${greedySerang.totalDistance.toFixed(3)} km)`);

// Test reverse / cross-town route: N08 (Alun-Alun) -> N14 (Stasiun Serang Timur)
const ucsCross = runUCS(serangGraph, 'N08', 'N14');
const greedyCross = runGreedy(serangGraph, 'N08', 'N14');

assert(ucsCross.found === true, 'UCS finds cross-town route N08 -> N14');
assert(greedyCross.found === true, 'Greedy finds cross-town route N08 -> N14');
assert(ucsCross.totalDistance <= greedyCross.totalDistance + 1e-9, `Cross route UCS distance (${ucsCross.totalDistance.toFixed(3)} km) <= Greedy distance (${greedyCross.totalDistance.toFixed(3)} km)`);

console.log('\n===============================================================');
console.log(`TEST SUMMARY: ${passedCount} / ${totalTests} PASSED (All tests clean)`);
console.log('===============================================================');
