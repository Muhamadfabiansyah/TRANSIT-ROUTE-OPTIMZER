import { ExecutionStep, SearchResult, ComparisonResult } from '../algorithms/algorithmTypes';

export type SelectedAlgorithm = 'UCS' | 'GREEDY' | 'BOTH';

export type SimulationStatus = 'IDLE' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type SimulationPhase = 'IDLE' | 'EXPLORING' | 'NAVIGATING_BUS' | 'COMPLETED';

export interface BusMarkerState {
  active: boolean;
  progress: number; // 0.0 to 1.0
  position: [number, number] | null;
  bearing: number; // Heading angle in degrees
  isAtDestination: boolean;
}

export interface AlgorithmSimulationState {
  hasRun: boolean;
  isFinished: boolean;
  phase: SimulationPhase;
  currentStepIndex: number;
  totalSteps: number;
  searchResult: SearchResult | null;
  currentStep: ExecutionStep | null;
  highlightedPath: string[];
  exploredNodeIds: string[];
  candidateNodeIds: string[];
  currentNodeId: string | null;
  bus: BusMarkerState;
}

export function createInitialBusState(): BusMarkerState {
  return {
    active: false,
    progress: 0,
    position: null,
    bearing: 0,
    isAtDestination: false,
  };
}

export function createInitialAlgorithmState(): AlgorithmSimulationState {
  return {
    hasRun: false,
    isFinished: false,
    phase: 'IDLE',
    currentStepIndex: -1,
    totalSteps: 0,
    searchResult: null,
    currentStep: null,
    highlightedPath: [],
    exploredNodeIds: [],
    candidateNodeIds: [],
    currentNodeId: null,
    bus: createInitialBusState(),
  };
}

export type PlaybackSpeed = 2000 | 1000 | 500 | 250 | 100; // milliseconds delay per step

export interface GlobalSimulationState {
  originId: string;
  destinationId: string;
  selectedAlgorithm: SelectedAlgorithm;
  simulationStatus: SimulationStatus;
  speedMs: PlaybackSpeed;
  isPlaying: boolean;
  ucsState: AlgorithmSimulationState;
  greedyState: AlgorithmSimulationState;
  comparison: ComparisonResult | null;
}
