import { defaultSharedGraph, calculatePathTotalDistance, extractRouteCoordinates } from '../src/graph/buildGraph.js';
import { validateGraph } from '../src/graph/validateGraph.js';
import { runUniformCostSearch } from '../src/algorithms/ucs.js';
import { runGreedyBestFirstSearch } from '../src/algorithms/greedy.js';
import { compareSearchResults } from '../src/algorithms/compareAlgorithms.js';

console.log('=== TEST SUITE: TRANSIT ROUTE OPTIMIZER ===\n');

// 1. Graph Validation
console.log('[TEST 1] Validating Graph Data Structure...');
const validation = validateGraph(defaultSharedGraph);
console.log(`- Graph Valid: ${validation.isValid}`);
console.log(`- Node count: ${validation.stats.nodeCount}`);
console.log(`- Edge count: ${validation.stats.edgeCount}`);
console.log(`- Has one-way streets: ${validation.stats.hasOneWayStreets}`);
console.log(`- Issues found: ${validation.issues.length}`);
if (validation.issues.length > 0) {
  validation.issues.forEach(i => console.log(`  [${i.severity.toUpperCase()}] ${i.message}`));
}
if (!validation.isValid) {
  console.error('Validation failed!');
  process.exit(1);
}

// 2. Algorithm Run: Pasar Rau (N01) -> Alun-Alun (N08)
console.log('\n[TEST 2] Testing Search: N01 (Pasar Rau) -> N08 (Alun-Alun Serang)...');
const ucsRes = runUniformCostSearch(defaultSharedGraph, 'N01', 'N08');
const greedyRes = runGreedyBestFirstSearch(defaultSharedGraph, 'N01', 'N08');

console.log('\n--- UCS Result ---');
console.log(`Found: ${ucsRes.found}`);
console.log(`Path: ${ucsRes.path.join(' -> ')}`);
console.log(`Distance: ${ucsRes.totalDistance.toFixed(3)} km`);
console.log(`Visited: ${ucsRes.visitedCount}, Expanded: ${ucsRes.expandedCount}`);
console.log(`Steps: ${ucsRes.steps.length}`);
console.log(`Execution Time: ${ucsRes.executionTimeMs} ms`);

console.log('\n--- Greedy Result ---');
console.log(`Found: ${greedyRes.found}`);
console.log(`Path: ${greedyRes.path.join(' -> ')}`);
console.log(`Distance: ${greedyRes.totalDistance.toFixed(3)} km`);
console.log(`Visited: ${greedyRes.visitedCount}, Expanded: ${greedyRes.expandedCount}`);
console.log(`Steps: ${greedyRes.steps.length}`);
console.log(`Execution Time: ${greedyRes.executionTimeMs} ms`);

// Route geometry extraction test
const ucsCoords = extractRouteCoordinates(defaultSharedGraph, ucsRes.path);
const greedyCoords = extractRouteCoordinates(defaultSharedGraph, greedyRes.path);
console.log(`\nRoute geometry coords: UCS=${ucsCoords.length} pts, Greedy=${greedyCoords.length} pts`);

// Comparison
const comp = compareSearchResults(ucsRes, greedyRes);
console.log('\n--- Comparison ---');
console.log(`Shorter Algorithm: ${comp.shorterAlgorithm}`);
console.log(`Distance diff: ${comp.distanceDiffKm} km (${comp.distanceDiffPct}%)`);
console.log(`Summary: ${comp.summaryText}`);

// 3. Test Edge Case: Origin == Destination
console.log('\n[TEST 3] Testing Origin == Destination (N01 -> N01)...');
const sameUcs = runUniformCostSearch(defaultSharedGraph, 'N01', 'N01');
const sameGreedy = runGreedyBestFirstSearch(defaultSharedGraph, 'N01', 'N01');
console.log(`UCS distance for same node: ${sameUcs.totalDistance} km, steps: ${sameUcs.steps.length}`);
console.log(`Greedy distance for same node: ${sameGreedy.totalDistance} km, steps: ${sameGreedy.steps.length}`);

console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
