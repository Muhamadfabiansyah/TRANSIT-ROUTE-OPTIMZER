import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GlobalSimulationState,
  AlgorithmSimulationState,
  SelectedAlgorithm,
  SimulationStatus,
  createInitialAlgorithmState,
  PlaybackSpeed,
} from './SimulationState';
import { defaultSharedGraph, extractRouteCoordinates } from '../graph/buildGraph';
import { runUniformCostSearch } from '../algorithms/ucs';
import { runGreedyBestFirstSearch } from '../algorithms/greedy';
import { compareSearchResults } from '../algorithms/compareAlgorithms';
import { SearchResult } from '../algorithms/algorithmTypes';
import {
  buildGeometrySegments,
  interpolateBusPosition,
  RouteGeometrySegments,
} from './busAnimation';

export function useSimulation(initialOrigin = 'N01', initialDest = 'N08') {
  const [originId, setOriginId] = useState<string>(initialOrigin);
  const [destinationId, setDestinationId] = useState<string>(initialDest);
  const [speedMs, setSpeedMs] = useState<PlaybackSpeed>(500);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Algorithm Selector: 'UCS' | 'GREEDY' | 'BOTH'
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SelectedAlgorithm>('UCS');

  // Simulation Lifecycle Status: 'IDLE' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('READY');

  const [ucsState, setUcsState] = useState<AlgorithmSimulationState>(
    createInitialAlgorithmState()
  );
  const [greedyState, setGreedyState] = useState<AlgorithmSimulationState>(
    createInitialAlgorithmState()
  );

  // Cached route geometries for bus movement
  const ucsSegmentsRef = useRef<RouteGeometrySegments | null>(null);
  const greedySegmentsRef = useRef<RouteGeometrySegments | null>(null);

  // Comparison result (only available when BOTH algorithms have completed)
  const comparison =
    ucsState.searchResult && greedyState.searchResult
      ? compareSearchResults(ucsState.searchResult, greedyState.searchResult)
      : null;

  // Helper to sync step data into algorithm state
  const applyStepToState = (
    result: SearchResult,
    stepIdx: number
  ): Partial<AlgorithmSimulationState> => {
    if (stepIdx < 0 || stepIdx >= result.steps.length) {
      return {};
    }
    const step = result.steps[stepIdx];
    const isLast = stepIdx === result.steps.length - 1;

    return {
      currentStepIndex: stepIdx,
      currentStep: step,
      currentNodeId: step.currentNodeId,
      exploredNodeIds: step.exploredNodeIds,
      candidateNodeIds: step.candidates.map((c) => c.nodeId),
      highlightedPath: isLast && result.found ? result.path : step.partialPath,
      isFinished: isLast,
    };
  };

  // Change Origin / Destination -> resets previous results and readies selected algorithm
  const handleSetOrigin = useCallback((newOriginId: string) => {
    setIsPlaying(false);
    setOriginId(newOriginId);
    ucsSegmentsRef.current = null;
    greedySegmentsRef.current = null;
    setUcsState(createInitialAlgorithmState());
    setGreedyState(createInitialAlgorithmState());
    setSimulationStatus('READY');
  }, []);

  const handleSetDestination = useCallback((newDestId: string) => {
    setIsPlaying(false);
    setDestinationId(newDestId);
    ucsSegmentsRef.current = null;
    greedySegmentsRef.current = null;
    setUcsState(createInitialAlgorithmState());
    setGreedyState(createInitialAlgorithmState());
    setSimulationStatus('READY');
  }, []);

  // SELECTOR FUNCTION: Select Algorithm (Does NOT execute search or start bus)
  const handleSelectAlgorithm = useCallback((algo: SelectedAlgorithm) => {
    // 1. Safely stop any running playback timer
    setIsPlaying(false);

    // 2. Set active selected mode
    setSelectedAlgorithm(algo);

    // 3. Clear conflicting states and road segments cleanly
    ucsSegmentsRef.current = null;
    greedySegmentsRef.current = null;
    setUcsState(createInitialAlgorithmState());
    setGreedyState(createInitialAlgorithmState());

    // 4. Mark status as Ready for user to press Play
    setSimulationStatus('READY');
  }, []);

  // Internal Executor for UCS
  const executeUCS = useCallback(() => {
    const result = runUniformCostSearch(
      defaultSharedGraph,
      originId,
      destinationId
    );
    const initialStepIdx = 0;
    const initialUpdate = applyStepToState(result, initialStepIdx);

    const coords = extractRouteCoordinates(defaultSharedGraph, result.path);
    const segments = buildGeometrySegments(coords);
    ucsSegmentsRef.current = segments;

    const initialPos = coords.length > 0 ? coords[0] : null;

    setUcsState({
      hasRun: true,
      isFinished: false,
      phase: 'EXPLORING',
      currentStepIndex: initialStepIdx,
      totalSteps: result.steps.length,
      searchResult: result,
      currentStep: result.steps[0] || null,
      highlightedPath: initialUpdate.highlightedPath || [],
      exploredNodeIds: initialUpdate.exploredNodeIds || [],
      candidateNodeIds: initialUpdate.candidateNodeIds || [],
      currentNodeId: initialUpdate.currentNodeId || null,
      bus: {
        active: false,
        progress: 0,
        position: initialPos,
        bearing: segments.coordinates.length >= 2 ? segments.coordinates[0][0] : 0,
        isAtDestination: false,
      },
    });

    return result;
  }, [originId, destinationId]);

  // Internal Executor for Greedy
  const executeGreedy = useCallback(() => {
    const result = runGreedyBestFirstSearch(
      defaultSharedGraph,
      originId,
      destinationId
    );
    const initialStepIdx = 0;
    const initialUpdate = applyStepToState(result, initialStepIdx);

    const coords = extractRouteCoordinates(defaultSharedGraph, result.path);
    const segments = buildGeometrySegments(coords);
    greedySegmentsRef.current = segments;

    const initialPos = coords.length > 0 ? coords[0] : null;

    setGreedyState({
      hasRun: true,
      isFinished: false,
      phase: 'EXPLORING',
      currentStepIndex: initialStepIdx,
      totalSteps: result.steps.length,
      searchResult: result,
      currentStep: result.steps[0] || null,
      highlightedPath: initialUpdate.highlightedPath || [],
      exploredNodeIds: initialUpdate.exploredNodeIds || [],
      candidateNodeIds: initialUpdate.candidateNodeIds || [],
      currentNodeId: initialUpdate.currentNodeId || null,
      bus: {
        active: false,
        progress: 0,
        position: initialPos,
        bearing: segments.coordinates.length >= 2 ? segments.coordinates[0][0] : 0,
        isAtDestination: false,
      },
    });

    return result;
  }, [originId, destinationId]);

  // Internal Executor for Both
  const executeBoth = useCallback(() => {
    executeUCS();
    executeGreedy();
  }, [executeUCS, executeGreedy]);

  // Advance Bus Position Helper
  const advanceBus = (
    prevState: AlgorithmSimulationState,
    segments: RouteGeometrySegments | null,
    deltaProgress: number
  ): AlgorithmSimulationState => {
    if (!segments || !prevState.searchResult?.found) {
      return {
        ...prevState,
        phase: 'COMPLETED',
        bus: { ...prevState.bus, isAtDestination: true },
      };
    }

    const nextProgress = Math.min(1.0, prevState.bus.progress + deltaProgress);
    const pos = interpolateBusPosition(segments, nextProgress);
    const isAtDest = nextProgress >= 0.9999;

    return {
      ...prevState,
      phase: isAtDest ? 'COMPLETED' : 'NAVIGATING_BUS',
      bus: {
        active: true,
        progress: nextProgress,
        position: pos ? [pos.lat, pos.lng] : prevState.bus.position,
        bearing: pos ? pos.bearing : prevState.bus.bearing,
        isAtDestination: isAtDest,
      },
    };
  };

  // PLAY CONTROLLER: Runs the selected algorithm and starts playback
  const handlePlay = useCallback(() => {
    // If not run yet, execute based on selectedAlgorithm
    if (selectedAlgorithm === 'UCS') {
      if (!ucsState.hasRun || simulationStatus === 'COMPLETED' || ucsState.bus.isAtDestination) {
        executeUCS();
      }
    } else if (selectedAlgorithm === 'GREEDY') {
      if (!greedyState.hasRun || simulationStatus === 'COMPLETED' || greedyState.bus.isAtDestination) {
        executeGreedy();
      }
    } else if (selectedAlgorithm === 'BOTH') {
      if (!ucsState.hasRun || !greedyState.hasRun || simulationStatus === 'COMPLETED') {
        executeBoth();
      }
    }

    setIsPlaying(true);
    setSimulationStatus('RUNNING');
  }, [
    selectedAlgorithm,
    simulationStatus,
    ucsState.hasRun,
    ucsState.bus.isAtDestination,
    greedyState.hasRun,
    greedyState.bus.isAtDestination,
    executeUCS,
    executeGreedy,
    executeBoth,
  ]);

  // PAUSE CONTROLLER: Truly pauses playback without altering computed results
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setSimulationStatus('PAUSED');
  }, []);

  // STEP FORWARD CONTROLLER: Advances one execution step
  const handleStepForward = useCallback(() => {
    // If algorithm hasn't run yet, initialize it first and step once
    if (selectedAlgorithm === 'UCS' && !ucsState.hasRun) {
      executeUCS();
      setSimulationStatus('PAUSED');
      return;
    }
    if (selectedAlgorithm === 'GREEDY' && !greedyState.hasRun) {
      executeGreedy();
      setSimulationStatus('PAUSED');
      return;
    }
    if (selectedAlgorithm === 'BOTH' && (!ucsState.hasRun || !greedyState.hasRun)) {
      executeBoth();
      setSimulationStatus('PAUSED');
      return;
    }

    const stepTarget = (
      state: AlgorithmSimulationState,
      segments: RouteGeometrySegments | null,
      setter: React.Dispatch<React.SetStateAction<AlgorithmSimulationState>>
    ) => {
      if (!state.searchResult) return;

      // Phase 1: Exploration steps
      if (state.currentStepIndex < state.totalSteps - 1) {
        const nextIdx = state.currentStepIndex + 1;
        const up = applyStepToState(state.searchResult, nextIdx);
        const isLastStep = nextIdx === state.totalSteps - 1;

        setter((prev) => ({
          ...prev,
          ...up,
          phase: isLastStep && state.searchResult?.found ? 'NAVIGATING_BUS' : 'EXPLORING',
          bus: {
            ...prev.bus,
            active: isLastStep && !!state.searchResult?.found,
            progress: isLastStep ? 0 : prev.bus.progress,
          },
        }));
      }
      // Phase 2: Bus movement step along road centerline
      else if (state.searchResult.found && !state.bus.isAtDestination) {
        setter((prev) => advanceBus(prev, segments, 0.12));
      }
    };

    if (selectedAlgorithm === 'UCS' || selectedAlgorithm === 'BOTH') {
      stepTarget(ucsState, ucsSegmentsRef.current, setUcsState);
    }
    if (selectedAlgorithm === 'GREEDY' || selectedAlgorithm === 'BOTH') {
      stepTarget(greedyState, greedySegmentsRef.current, setGreedyState);
    }

    setSimulationStatus('PAUSED');
  }, [
    selectedAlgorithm,
    ucsState,
    greedyState,
    executeUCS,
    executeGreedy,
    executeBoth,
  ]);

  // JUMP TO STEP (From Execution Log)
  const handleJumpToStep = useCallback(
    (algo: 'UCS' | 'GREEDY', targetStepIdx: number) => {
      if (algo === 'UCS' && ucsState.searchResult) {
        const clamped = Math.max(
          0,
          Math.min(targetStepIdx, ucsState.totalSteps - 1)
        );
        const up = applyStepToState(ucsState.searchResult, clamped);
        const isLast = clamped === ucsState.totalSteps - 1;
        setUcsState((prev) => ({
          ...prev,
          ...up,
          phase: isLast && ucsState.searchResult?.found ? 'NAVIGATING_BUS' : 'EXPLORING',
          bus: {
            ...prev.bus,
            active: isLast && !!ucsState.searchResult?.found,
            progress: isLast ? prev.bus.progress : 0,
          },
        }));
      } else if (algo === 'GREEDY' && greedyState.searchResult) {
        const clamped = Math.max(
          0,
          Math.min(targetStepIdx, greedyState.totalSteps - 1)
        );
        const up = applyStepToState(greedyState.searchResult, clamped);
        const isLast = clamped === greedyState.totalSteps - 1;
        setGreedyState((prev) => ({
          ...prev,
          ...up,
          phase: isLast && greedyState.searchResult?.found ? 'NAVIGATING_BUS' : 'EXPLORING',
          bus: {
            ...prev.bus,
            active: isLast && !!greedyState.searchResult?.found,
            progress: isLast ? prev.bus.progress : 0,
          },
        }));
      }
      setSimulationStatus('PAUSED');
    },
    [ucsState, greedyState]
  );

  // RESET CONTROLLERS
  const handleResetUCS = useCallback(() => {
    setIsPlaying(false);
    ucsSegmentsRef.current = null;
    setUcsState(createInitialAlgorithmState());
    setSimulationStatus('READY');
  }, []);

  const handleResetGreedy = useCallback(() => {
    setIsPlaying(false);
    greedySegmentsRef.current = null;
    setGreedyState(createInitialAlgorithmState());
    setSimulationStatus('READY');
  }, []);

  const handleResetAll = useCallback(() => {
    setIsPlaying(false);
    ucsSegmentsRef.current = null;
    greedySegmentsRef.current = null;
    setUcsState(createInitialAlgorithmState());
    setGreedyState(createInitialAlgorithmState());
    setSimulationStatus('READY');
  }, []);

  // Main Simulation & Playback Loop
  const targetRef = useRef(selectedAlgorithm);
  targetRef.current = selectedAlgorithm;

  useEffect(() => {
    if (!isPlaying) return;

    const isBusRunning =
      (ucsState.phase === 'NAVIGATING_BUS' && !ucsState.bus.isAtDestination) ||
      (greedyState.phase === 'NAVIGATING_BUS' && !greedyState.bus.isAtDestination);

    const tickIntervalMs = isBusRunning ? 30 : speedMs;

    const timer = setInterval(() => {
      // 1. Advance UCS if selected or Both
      if (targetRef.current === 'UCS' || targetRef.current === 'BOTH') {
        setUcsState((prev) => {
          if (!prev.searchResult) return prev;

          // Exploration phase
          if (prev.currentStepIndex < prev.totalSteps - 1) {
            const nextIdx = prev.currentStepIndex + 1;
            const up = applyStepToState(prev.searchResult, nextIdx);
            const isLast = nextIdx === prev.totalSteps - 1;
            return {
              ...prev,
              ...up,
              phase: isLast && prev.searchResult.found ? 'NAVIGATING_BUS' : 'EXPLORING',
              bus: {
                ...prev.bus,
                active: isLast && prev.searchResult.found,
              },
            };
          }

          // Bus navigation phase along road centerline
          if (prev.searchResult.found && !prev.bus.isAtDestination) {
            const speedFactor = 500 / speedMs;
            const deltaProgress = 0.010 * speedFactor;
            return advanceBus(prev, ucsSegmentsRef.current, deltaProgress);
          }

          return prev;
        });
      }

      // 2. Advance Greedy if selected or Both
      if (targetRef.current === 'GREEDY' || targetRef.current === 'BOTH') {
        setGreedyState((prev) => {
          if (!prev.searchResult) return prev;

          // Exploration phase
          if (prev.currentStepIndex < prev.totalSteps - 1) {
            const nextIdx = prev.currentStepIndex + 1;
            const up = applyStepToState(prev.searchResult, nextIdx);
            const isLast = nextIdx === prev.totalSteps - 1;
            return {
              ...prev,
              ...up,
              phase: isLast && prev.searchResult.found ? 'NAVIGATING_BUS' : 'EXPLORING',
              bus: {
                ...prev.bus,
                active: isLast && prev.searchResult.found,
              },
            };
          }

          // Bus navigation phase along road centerline
          if (prev.searchResult.found && !prev.bus.isAtDestination) {
            const speedFactor = 500 / speedMs;
            const deltaProgress = 0.010 * speedFactor;
            return advanceBus(prev, greedySegmentsRef.current, deltaProgress);
          }

          return prev;
        });
      }

      // 3. Termination Check
      const ucsDone =
        !ucsState.searchResult ||
        (ucsState.currentStepIndex >= ucsState.totalSteps - 1 &&
          (!ucsState.searchResult.found || ucsState.bus.isAtDestination));

      const greedyDone =
        !greedyState.searchResult ||
        (greedyState.currentStepIndex >= greedyState.totalSteps - 1 &&
          (!greedyState.searchResult.found || greedyState.bus.isAtDestination));

      if (
        (targetRef.current === 'UCS' && ucsDone) ||
        (targetRef.current === 'GREEDY' && greedyDone) ||
        (targetRef.current === 'BOTH' && ucsDone && greedyDone)
      ) {
        setIsPlaying(false);
        setSimulationStatus('COMPLETED');
      }
    }, tickIntervalMs);

    return () => clearInterval(timer);
  }, [
    isPlaying,
    speedMs,
    ucsState.phase,
    greedyState.phase,
    ucsState.currentStepIndex,
    greedyState.currentStepIndex,
    ucsState.bus.isAtDestination,
    greedyState.bus.isAtDestination,
  ]);

  return {
    state: {
      originId,
      destinationId,
      selectedAlgorithm,
      simulationStatus,
      speedMs,
      isPlaying,
      ucsState,
      greedyState,
      comparison,
    } as GlobalSimulationState,
    actions: {
      setOrigin: handleSetOrigin,
      setDestination: handleSetDestination,
      selectAlgorithm: handleSelectAlgorithm,
      setSpeed: setSpeedMs,
      play: handlePlay,
      pause: handlePause,
      stepForward: handleStepForward,
      jumpToStep: handleJumpToStep,
      resetUCS: handleResetUCS,
      resetGreedy: handleResetGreedy,
      resetAll: handleResetAll,
    },
  };
}
