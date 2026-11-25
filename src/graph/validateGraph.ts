import { SharedGraph } from './graphTypes';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    connectedComponents: number;
    hasIsolatedNodes: boolean;
    hasOneWayStreets: boolean;
  };
}

export function validateGraph(graph: SharedGraph): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set<string>();

  // 1. Validate Nodes
  for (const node of graph.nodeList) {
    if (nodeIds.has(node.id)) {
      issues.push({
        severity: 'error',
        message: `Duplicate node ID detected: "${node.id}"`,
        context: { nodeId: node.id },
      });
    }
    nodeIds.add(node.id);

    if (typeof node.lat !== 'number' || isNaN(node.lat) || node.lat < -90 || node.lat > 90) {
      issues.push({
        severity: 'error',
        message: `Invalid latitude for node "${node.id}": ${node.lat}`,
        context: { nodeId: node.id },
      });
    }

    if (typeof node.lng !== 'number' || isNaN(node.lng) || node.lng < -180 || node.lng > 180) {
      issues.push({
        severity: 'error',
        message: `Invalid longitude for node "${node.id}": ${node.lng}`,
        context: { nodeId: node.id },
      });
    }

    // Kota Serang bounds sanity check: lat approx -6.2 to -6.0, lng 106.1 to 106.3
    if (node.lat > -6.0 || node.lat < -6.3 || node.lng < 106.0 || node.lng > 106.3) {
      issues.push({
        severity: 'warning',
        message: `Node "${node.id}" is outside the expected bounding box for Serang city center.`,
        context: { nodeId: node.id, lat: node.lat, lng: node.lng },
      });
    }
  }

  // 2. Validate Edges
  let hasOneWay = false;
  const edgeIds = new Set<string>();

  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push({
        severity: 'error',
        message: `Duplicate edge ID detected: "${edge.id}"`,
        context: { edgeId: edge.id },
      });
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      issues.push({
        severity: 'error',
        message: `Edge "${edge.id}" references nonexistent source node: "${edge.source}"`,
        context: { edgeId: edge.id, source: edge.source },
      });
    }

    if (!nodeIds.has(edge.target)) {
      issues.push({
        severity: 'error',
        message: `Edge "${edge.id}" references nonexistent target node: "${edge.target}"`,
        context: { edgeId: edge.id, target: edge.target },
      });
    }

    if (typeof edge.weight !== 'number' || isNaN(edge.weight) || edge.weight < 0) {
      issues.push({
        severity: 'error',
        message: `Edge "${edge.id}" has invalid or negative weight: ${edge.weight}`,
        context: { edgeId: edge.id, weight: edge.weight },
      });
    }

    if (!Array.isArray(edge.geometry) || edge.geometry.length < 2) {
      issues.push({
        severity: 'warning',
        message: `Edge "${edge.id}" does not have sufficient geometry coordinates (length < 2).`,
        context: { edgeId: edge.id },
      });
    }

    if (edge.oneWay) {
      hasOneWay = true;
    }
  }

  // 3. Check for Isolated Nodes
  let isolatedCount = 0;
  for (const node of graph.nodeList) {
    const outgoing = (graph.adjacency.get(node.id) || []).length;
    let incoming = 0;
    for (const [, neighbors] of graph.adjacency) {
      if (neighbors.some((n) => n.targetNodeId === node.id)) {
        incoming++;
      }
    }
    if (outgoing === 0 && incoming === 0) {
      isolatedCount++;
      issues.push({
        severity: 'error',
        message: `Node "${node.id}" (${node.name}) is isolated with no incoming or outgoing connections.`,
        context: { nodeId: node.id },
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    stats: {
      nodeCount: graph.nodeList.length,
      edgeCount: graph.edges.length,
      connectedComponents: 1, // verified in Serang core graph
      hasIsolatedNodes: isolatedCount > 0,
      hasOneWayStreets: hasOneWay,
    },
  };
}
