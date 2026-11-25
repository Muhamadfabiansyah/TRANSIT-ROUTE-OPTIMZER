import { SharedGraph } from '../graph/graphTypes';
import { ExecutionStep, SearchResult, CandidateItem } from './algorithmTypes';
import { PriorityQueue } from './PriorityQueue';
import { calculatePathTotalDistance } from '../graph/buildGraph';

/**
 * Custom Uniform Cost Search (UCS) Implementation
 * Finds mathematically optimal shortest path in directed graph with non-negative road distance weights.
 * 
 * Evaluation function: g(n) = g(parent) + c(parent, n)
 * Priority: Priority(n) = g(n)
 * 
 * Invariants & Correctness Guarantees:
 * 1. g(start) = 0
 * 2. Edge weights c(u, v) >= 0 (strictly non-negative)
 * 3. Min-Priority Queue orders nodes by cumulative cost g(n)
 * 4. Stale entries in the priority queue are identified and discarded
 * 5. Goal test is performed on DEQUEUING from Priority Queue (not upon neighbor generation)
 * 6. Cost relaxation updates best-known cost and predecessor
 * 7. Path is reconstructed sequentially from origin to destination
 */
export function runUniformCostSearch(
  graph: SharedGraph,
  originId: string,
  destinationId: string
): SearchResult {
  const startTime = performance.now();
  const steps: ExecutionStep[] = [];

  const originNode = graph.nodes.get(originId);
  const destNode = graph.nodes.get(destinationId);

  if (!originNode || !destNode) {
    const elapsed = performance.now() - startTime;
    return {
      algorithm: 'UCS',
      found: false,
      originId,
      destinationId,
      path: [],
      totalDistance: 0,
      visitedCount: 0,
      expandedCount: 0,
      executionTimeMs: Math.round(elapsed * 1000) / 1000,
      steps: [],
      unreachableReason: `Node ${originId} atau ${destinationId} tidak ditemukan dalam graph.`,
    };
  }

  // Edge case: Origin is the Destination
  if (originId === destinationId) {
    const elapsed = performance.now() - startTime;
    const initialStep: ExecutionStep = {
      stepNumber: 1,
      algorithm: 'UCS',
      currentNodeId: originId,
      currentNodeName: originNode.name,
      status: 'SAME_ORIGIN_DEST',
      description: `Origin dan Destination sama (${originNode.name}). Pencarian selesai seketika dengan cumulative cost 0 km.`,
      cost_g: 0,
      heuristic_h: 0,
      priority: 0,
      parent: null,
      candidates: [],
      exploredNodeIds: [originId],
      partialPath: [originId],
      isGoal: true,
    };

    return {
      algorithm: 'UCS',
      found: true,
      originId,
      destinationId,
      path: [originId],
      totalDistance: 0,
      visitedCount: 1,
      expandedCount: 0,
      executionTimeMs: Math.round(elapsed * 1000) / 1000,
      steps: [initialStep],
    };
  }

  // Best-known cumulative cost from start to each node: g(n)
  const costG = new Map<string, number>();
  // Predecessor map for path reconstruction
  const parent = new Map<string, string | null>();
  // Closed set: nodes already extracted with optimal cost
  const explored = new Set<string>();
  // Min-Priority Queue storing node ID with priority = g(n)
  const pq = new PriorityQueue<string>();

  costG.set(originId, 0);
  parent.set(originId, null);
  pq.enqueue(originId, 0);

  let stepCounter = 1;
  let expandedCount = 0;
  let visitedCount = 0;
  let goalReached = false;

  const helperReconstructPath = (targetId: string): string[] => {
    const route: string[] = [];
    let curr: string | null = targetId;
    const loopGuard = new Set<string>();

    while (curr !== null) {
      if (loopGuard.has(curr)) {
        // Prevent infinite cycle if cyclic predecessor occurs
        break;
      }
      loopGuard.add(curr);
      route.unshift(curr);
      curr = parent.get(curr) || null;
    }
    return route;
  };

  const getCandidateList = (): CandidateItem[] => {
    return pq.getItems().map((item) => {
      const n = graph.nodes.get(item.item);
      const c = costG.get(item.item) ?? item.priority;
      return {
        nodeId: item.item,
        nodeName: n?.name || item.item,
        cost_g: Math.round(c * 1000) / 1000,
        heuristic_h: 0,
        priority: Math.round(item.priority * 1000) / 1000,
        parent: parent.get(item.item) || null,
      };
    });
  };

  // Step 1: Initializing Origin
  steps.push({
    stepNumber: stepCounter++,
    algorithm: 'UCS',
    currentNodeId: originId,
    currentNodeName: originNode.name,
    status: 'INITIALIZING',
    description: `Inisialisasi UCS di titik awal "${originNode.name}". Cumulative cost g(origin) = 0 km dimasukkan ke Priority Queue.`,
    cost_g: 0,
    heuristic_h: 0,
    priority: 0,
    parent: null,
    candidates: getCandidateList(),
    exploredNodeIds: [],
    partialPath: [originId],
    isGoal: false,
  });

  while (!pq.isEmpty()) {
    const entry = pq.dequeueEntry();
    if (!entry) break;

    const currentId = entry.item;
    const dequeuedCost = entry.priority;
    const currentNode = graph.nodes.get(currentId)!;

    // Stale Queue Entry Handling:
    // Discard entry if node is already explored with an equal or better cost
    if (explored.has(currentId)) {
      continue;
    }

    const currentBestCost = costG.get(currentId) ?? Infinity;
    if (dequeuedCost > currentBestCost) {
      continue;
    }

    // Mark node as explored (optimal path to currentId is now guaranteed)
    explored.add(currentId);
    visitedCount++;

    const partialPath = helperReconstructPath(currentId);

    // Goal test: Strictly evaluated upon dequeuing from Priority Queue
    if (currentId === destinationId) {
      goalReached = true;
      steps.push({
        stepNumber: stepCounter++,
        algorithm: 'UCS',
        currentNodeId: currentId,
        currentNodeName: currentNode.name,
        status: 'GOAL_REACHED',
        description: `Tujuan "${destNode.name}" berhasil dikeluarkan dari antrian prioritas dengan cumulative cost optimal g = ${dequeuedCost.toFixed(3)} km.`,
        cost_g: Math.round(dequeuedCost * 1000) / 1000,
        heuristic_h: 0,
        priority: Math.round(dequeuedCost * 1000) / 1000,
        parent: parent.get(currentId) || null,
        candidates: getCandidateList(),
        exploredNodeIds: Array.from(explored),
        partialPath,
        isGoal: true,
      });
      break;
    }

    // Step: Exploring current node
    steps.push({
      stepNumber: stepCounter++,
      algorithm: 'UCS',
      currentNodeId: currentId,
      currentNodeName: currentNode.name,
      status: 'EXPLORING',
      description: `Mengekstrak simpul "${currentNode.name}" dengan cumulative cost terkecil g = ${dequeuedCost.toFixed(3)} km.`,
      cost_g: Math.round(dequeuedCost * 1000) / 1000,
      heuristic_h: 0,
      priority: Math.round(dequeuedCost * 1000) / 1000,
      parent: parent.get(currentId) || null,
      candidates: getCandidateList(),
      exploredNodeIds: Array.from(explored),
      partialPath,
      isGoal: false,
    });

    // Expand outgoing neighbors along directed edges
    const neighbors = graph.adjacency.get(currentId) || [];
    for (const neighbor of neighbors) {
      expandedCount++;
      const targetId = neighbor.targetNodeId;
      const targetNode = graph.nodes.get(targetId);
      const edgeWeight = neighbor.cost;

      // Invariant: Non-negative edge weight
      if (edgeWeight < 0) {
        throw new Error(`Invalid negative edge weight ${edgeWeight} detected between ${currentId} and ${targetId}`);
      }

      const newCost = dequeuedCost + edgeWeight;

      if (!explored.has(targetId)) {
        const existingCost = costG.get(targetId);

        // Cost Relaxation: update if new path is cheaper
        if (existingCost === undefined || newCost < existingCost) {
          costG.set(targetId, newCost);
          parent.set(targetId, currentId);
          pq.enqueue(targetId, newCost);

          const isRelaxation = existingCost !== undefined;
          steps.push({
            stepNumber: stepCounter++,
            algorithm: 'UCS',
            currentNodeId: targetId,
            currentNodeName: targetNode?.name || targetId,
            status: isRelaxation ? 'RELAXING' : 'EXPANDING',
            description: isRelaxation
              ? `Relaksasi jalur ke "${targetNode?.name}": biaya berkurang dari ${existingCost.toFixed(3)} km menjadi ${newCost.toFixed(3)} km via ${neighbor.edge.streetName}.`
              : `Menambahkan kandidat simpul "${targetNode?.name}" via ${neighbor.edge.streetName} (bobot ruas ${edgeWeight.toFixed(3)} km), g = ${newCost.toFixed(3)} km.`,
            cost_g: Math.round(newCost * 1000) / 1000,
            heuristic_h: 0,
            priority: Math.round(newCost * 1000) / 1000,
            parent: currentId,
            candidates: getCandidateList(),
            exploredNodeIds: Array.from(explored),
            partialPath: helperReconstructPath(targetId),
            isGoal: false,
          });
        }
      }
    }
  }

  const elapsed = performance.now() - startTime;

  if (goalReached) {
    const finalPath = helperReconstructPath(destinationId);
    const totalDistance = calculatePathTotalDistance(graph, finalPath);

    return {
      algorithm: 'UCS',
      found: true,
      originId,
      destinationId,
      path: finalPath,
      totalDistance,
      visitedCount,
      expandedCount,
      executionTimeMs: Math.round(elapsed * 1000) / 1000,
      steps,
    };
  } else {
    // Unreachable destination
    steps.push({
      stepNumber: stepCounter++,
      algorithm: 'UCS',
      currentNodeId: destinationId,
      currentNodeName: destNode.name,
      status: 'TARGET_UNREACHABLE',
      description: `Priority Queue kosong dan tujuan "${destNode.name}" tidak dapat dicapai dari "${originNode.name}" akibat arah jalan satu arah atau pemisahan komponen graf.`,
      cost_g: 0,
      heuristic_h: 0,
      priority: 0,
      parent: null,
      candidates: [],
      exploredNodeIds: Array.from(explored),
      partialPath: [],
      isGoal: false,
    });

    return {
      algorithm: 'UCS',
      found: false,
      originId,
      destinationId,
      path: [],
      totalDistance: 0,
      visitedCount,
      expandedCount,
      executionTimeMs: Math.round(elapsed * 1000) / 1000,
      steps,
      unreachableReason: `Tujuan tidak dapat dijangkau dari origin yang dipilih berdasarkan aturan arah jalan graf.`,
    };
  }
}
