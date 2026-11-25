export type AlgorithmType = 'UCS' | 'GREEDY';

export type StepActionStatus =
  | 'INITIALIZING'
  | 'EXPLORING'
  | 'EXPANDING'
  | 'RELAXING'
  | 'GOAL_REACHED'
  | 'TARGET_UNREACHABLE'
  | 'SAME_ORIGIN_DEST';

export interface CandidateItem {
  nodeId: string;
  nodeName: string;
  cost_g: number;
  heuristic_h: number;
  priority: number;
  parent: string | null;
}

export interface ExecutionStep {
  stepNumber: number;
  algorithm: AlgorithmType;
  currentNodeId: string;
  currentNodeName: string;
  status: StepActionStatus;
  description: string;
  cost_g: number;
  heuristic_h: number;
  priority: number;
  parent: string | null;
  candidates: CandidateItem[]; // Snapshot of the frontier / Priority Queue
  exploredNodeIds: string[]; // Snapshot of closed / visited nodes
  partialPath: string[]; // Reconstructed path from origin to current node
  isGoal: boolean;
}

export interface SearchResult {
  algorithm: AlgorithmType;
  found: boolean;
  originId: string;
  destinationId: string;
  path: string[];
  totalDistance: number; // in kilometers along road geometry
  visitedCount: number; // nodes extracted from priority queue
  expandedCount: number; // total neighbor edge evaluations
  executionTimeMs: number; // actual search time in milliseconds (excluding UI animation)
  steps: ExecutionStep[];
  unreachableReason?: string;
}

export interface ComparisonResult {
  ucsResult: SearchResult;
  greedyResult: SearchResult;
  distanceDiffKm: number;
  distanceDiffPct: number;
  shorterAlgorithm: 'UCS' | 'GREEDY' | 'EQUAL';
  visitedDiff: number; // ucs visited - greedy visited
  expandedDiff: number;
  timeDiffMs: number;
  summaryText: string;
}
