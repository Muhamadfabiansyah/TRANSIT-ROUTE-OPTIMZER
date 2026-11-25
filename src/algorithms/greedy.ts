import { SharedGraph } from '../graph/graphTypes';
import { ExecutionStep, SearchResult, CandidateItem } from './algorithmTypes';
import { PriorityQueue } from './PriorityQueue';
import { haversineDistance } from '../graph/distance';
import { calculatePathTotalDistance } from '../graph/buildGraph';

/**
 * Custom Greedy Best-First Search Implementation
 * Prioritizes nodes strictly based on straight-line geographic heuristic to destination:
 * 
 * Formula: f(n) = h(n)
 * Heuristic: Haversine great-circle distance from current node (lat, lng) to destination (lat, lng).
 * 
 * Invariants & Correctness Guarantees:
 * 1. Priority is purely h(n), NEVER g(n) and NEVER g(n) + h(n).
 * 2. Min-Priority Queue orders nodes by minimum h(n) to goal.
 * 3. Predecessor tracking for sequential path reconstruction.
 * 4. Cycle prevention: explored nodes are tracked to prevent infinite loops in cyclic directed graphs.
 * 5. Goal test is performed on DEQUEUING from Priority Queue.
 * 6. Total distance returned is the SUM OF ACTUAL ROAD EDGE WEIGHTS along the path, NOT the heuristic value.
 * 7. Greedy Best-First Search does NOT guarantee path optimality.
 */
export function runGreedyBestFirstSearch(
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
      algorithm: 'GREEDY',
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

  // Edge case: Origin is Destination
  if (originId === destinationId) {
    const elapsed = performance.now() - startTime;
    const initialStep: ExecutionStep = {
      stepNumber: 1,
      algorithm: 'GREEDY',
      currentNodeId: originId,
      currentNodeName: originNode.name,
      status: 'SAME_ORIGIN_DEST',
      description: `Origin dan Destination sama (${originNode.name}). Heuristic h = 0 km, pencarian selesai seketika.`,
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
      algorithm: 'GREEDY',
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

  // Heuristic function: Straight-line Haversine distance from node to destination
  const getHeuristic = (nodeId: string): number => {
    const n = graph.nodes.get(nodeId);
    if (!n) return Infinity;
    return haversineDistance(n.lat, n.lng, destNode.lat, destNode.lng);
  };

  const parent = new Map<string, string | null>();
  const explored = new Set<string>();
  const inQueue = new Set<string>();
  const pq = new PriorityQueue<string>();

  const initialH = getHeuristic(originId);
  parent.set(originId, null);
  pq.enqueue(originId, initialH);
  inQueue.add(originId);

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
      const h = item.priority;
      return {
        nodeId: item.item,
        nodeName: n?.name || item.item,
        cost_g: 0,
        heuristic_h: Math.round(h * 1000) / 1000,
        priority: Math.round(h * 1000) / 1000,
        parent: parent.get(item.item) || null,
      };
    });
  };

  // Step 1: Initialization
  steps.push({
    stepNumber: stepCounter++,
    algorithm: 'GREEDY',
    currentNodeId: originId,
    currentNodeName: originNode.name,
    status: 'INITIALIZING',
    description: `Inisialisasi Greedy Best-First Search di "${originNode.name}". Heuristic garis lurus ke tujuan h(origin) = ${initialH.toFixed(3)} km.`,
    cost_g: 0,
    heuristic_h: Math.round(initialH * 1000) / 1000,
    priority: Math.round(initialH * 1000) / 1000,
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
    const currentH = entry.priority;
    inQueue.delete(currentId);
    const currentNode = graph.nodes.get(currentId)!;

    // Discard if already explored (prevents cycles in directed graph)
    if (explored.has(currentId)) {
      continue;
    }

    explored.add(currentId);
    visitedCount++;

    const partialPath = helperReconstructPath(currentId);

    // Goal test: Evaluated upon dequeuing
    if (currentId === destinationId) {
      goalReached = true;
      steps.push({
        stepNumber: stepCounter++,
        algorithm: 'GREEDY',
        currentNodeId: currentId,
        currentNodeName: currentNode.name,
        status: 'GOAL_REACHED',
        description: `Tujuan "${destNode.name}" berhasil dicapai! Nilai heuristic garis lurus ke target h = 0 km.`,
        cost_g: 0,
        heuristic_h: 0,
        priority: 0,
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
      algorithm: 'GREEDY',
      currentNodeId: currentId,
      currentNodeName: currentNode.name,
      status: 'EXPLORING',
      description: `Mengevaluasi simpul "${currentNode.name}" dengan perkiraan jarak garis lurus terdekat ke target (h = ${currentH.toFixed(3)} km).`,
      cost_g: 0,
      heuristic_h: Math.round(currentH * 1000) / 1000,
      priority: Math.round(currentH * 1000) / 1000,
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

      // Invariant: Do not revisit closed nodes and do not duplicate queue entries
      if (!explored.has(targetId) && !inQueue.has(targetId)) {
        const targetH = getHeuristic(targetId);
        parent.set(targetId, currentId);
        pq.enqueue(targetId, targetH);
        inQueue.add(targetId);

        steps.push({
          stepNumber: stepCounter++,
          algorithm: 'GREEDY',
          currentNodeId: targetId,
          currentNodeName: targetNode?.name || targetId,
          status: 'EXPANDING',
          description: `Menambahkan tetangga "${targetNode?.name}" via ${neighbor.edge.streetName} dengan nilai heuristik geografis h = ${targetH.toFixed(3)} km ke antrian.`,
          cost_g: 0,
          heuristic_h: Math.round(targetH * 1000) / 1000,
          priority: Math.round(targetH * 1000) / 1000,
          parent: currentId,
          candidates: getCandidateList(),
          exploredNodeIds: Array.from(explored),
          partialPath: helperReconstructPath(targetId),
          isGoal: false,
        });
      }
    }
  }

  const elapsed = performance.now() - startTime;

  if (goalReached) {
    const finalPath = helperReconstructPath(destinationId);
    // Road distance is calculated by summing ACTUAL ROAD EDGE WEIGHTS along the path
    const totalDistance = calculatePathTotalDistance(graph, finalPath);

    return {
      algorithm: 'GREEDY',
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
      algorithm: 'GREEDY',
      currentNodeId: destinationId,
      currentNodeName: destNode.name,
      status: 'TARGET_UNREACHABLE',
      description: `Tujuan "${destNode.name}" tidak dapat dicapai dari "${originNode.name}". Antrian prioritas heuristik telah habis.`,
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
      algorithm: 'GREEDY',
      found: false,
      originId,
      destinationId,
      path: [],
      totalDistance: 0,
      visitedCount,
      expandedCount,
      executionTimeMs: Math.round(elapsed * 1000) / 1000,
      steps,
      unreachableReason: `Tujuan tidak dapat dijangkau dari origin yang dipilih berdasarkan aturan arah koneksi graph.`,
    };
  }
}
