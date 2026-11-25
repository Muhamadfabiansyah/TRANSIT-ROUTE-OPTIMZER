import { GraphNode, GraphEdge, SharedGraph, AdjacencyItem } from './graphTypes';
import nodesData from '../data/nodes.json';
import edgesData from '../data/edges.json';

const rawNodes = nodesData as unknown as GraphNode[];
const rawEdges = edgesData as unknown as GraphEdge[];

export function buildSharedGraph(
  customNodes?: GraphNode[],
  customEdges?: GraphEdge[]
): SharedGraph {
  const nodeList = customNodes || rawNodes;
  const edges = customEdges || rawEdges;

  const nodes = new Map<string, GraphNode>();
  for (const node of nodeList) {
    nodes.set(node.id, node);
  }

  const adjacency = new Map<string, AdjacencyItem[]>();
  for (const node of nodeList) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    // Only link if source exists
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, []);
    }
    adjacency.get(edge.source)!.push({
      targetNodeId: edge.target,
      edge,
      cost: edge.weight,
    });
  }

  return {
    nodes,
    edges,
    adjacency,
    nodeList,
  };
}

export const defaultSharedGraph = buildSharedGraph();

/**
 * Returns edge connecting source to target if it exists in the graph.
 */
export function findEdge(
  graph: SharedGraph,
  sourceId: string,
  targetId: string
): GraphEdge | undefined {
  const neighbors = graph.adjacency.get(sourceId) || [];
  const match = neighbors.find((item) => item.targetNodeId === targetId);
  return match?.edge;
}

/**
 * Extracts complete polyline coordinates along the path of node IDs.
 * Preserves exact street curvature and bends.
 */
export function extractRouteCoordinates(
  graph: SharedGraph,
  pathNodeIds: string[]
): [number, number][] {
  if (pathNodeIds.length === 0) return [];
  if (pathNodeIds.length === 1) {
    const single = graph.nodes.get(pathNodeIds[0]);
    return single ? [[single.lat, single.lng]] : [];
  }

  const fullCoords: [number, number][] = [];

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const u = pathNodeIds[i];
    const v = pathNodeIds[i + 1];
    const edge = findEdge(graph, u, v);

    if (edge && edge.geometry.length > 0) {
      // If continuing from previous segment, avoid duplicating the junction point
      const startIdx = fullCoords.length > 0 ? 1 : 0;
      for (let c = startIdx; c < edge.geometry.length; c++) {
        fullCoords.push(edge.geometry[c]);
      }
    } else {
      // Fallback to straight line if edge geometry missing
      const nU = graph.nodes.get(u);
      const nV = graph.nodes.get(v);
      if (nU && fullCoords.length === 0) fullCoords.push([nU.lat, nU.lng]);
      if (nV) fullCoords.push([nV.lat, nV.lng]);
    }
  }

  return fullCoords;
}

/**
 * Calculates sum of road distances across a path of node IDs.
 */
export function calculatePathTotalDistance(
  graph: SharedGraph,
  pathNodeIds: string[]
): number {
  if (pathNodeIds.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const edge = findEdge(graph, pathNodeIds[i], pathNodeIds[i + 1]);
    if (edge) {
      total += edge.weight;
    }
  }
  return Math.round(total * 1000) / 1000;
}
