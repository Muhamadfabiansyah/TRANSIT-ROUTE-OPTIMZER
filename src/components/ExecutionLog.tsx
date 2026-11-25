import React, { useState, useEffect, useRef } from 'react';
import { ExecutionStep } from '../algorithms/algorithmTypes';
import { GlobalSimulationState } from '../simulation/SimulationState';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface ExecutionLogProps {
  simulationState: GlobalSimulationState;
  onJumpToStep: (algo: 'UCS' | 'GREEDY', stepIndex: number) => void;
  isDrawerOpen?: boolean;
  onToggleDrawer?: () => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({
  simulationState,
  onJumpToStep,
  isDrawerOpen,
  onToggleDrawer,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UCS' | 'GREEDY'>('ALL');
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const isCollapsed = isDrawerOpen !== undefined ? !isDrawerOpen : internalCollapsed;
  const toggleCollapse = onToggleDrawer ? onToggleDrawer : () => setInternalCollapsed(!internalCollapsed);

  const { ucsState, greedyState } = simulationState;

  const ucsSteps = ucsState.searchResult?.steps || [];
  const greedySteps = greedyState.searchResult?.steps || [];

  interface CombinedLogItem {
    step: ExecutionStep;
    originalIndex: number;
    isActive: boolean;
  }

  const combinedItems: CombinedLogItem[] = [];

  if (filter === 'ALL' || filter === 'UCS') {
    ucsSteps.forEach((s, idx) => {
      combinedItems.push({
        step: s,
        originalIndex: idx,
        isActive: ucsState.currentStepIndex === idx,
      });
    });
  }

  if (filter === 'ALL' || filter === 'GREEDY') {
    greedySteps.forEach((s, idx) => {
      combinedItems.push({
        step: s,
        originalIndex: idx,
        isActive: greedyState.currentStepIndex === idx,
      });
    });
  }

  if (filter === 'ALL') {
    combinedItems.sort((a, b) => a.step.stepNumber - b.step.stepNumber);
  }

  // Auto scroll to active step
  useEffect(() => {
    if (isCollapsed) return;
    const activeEl = logContainerRef.current?.querySelector('.log-row-active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [ucsState.currentStepIndex, greedyState.currentStepIndex, isCollapsed]);

  // Current active status description for the collapsed bar
  const activeDesc =
    ucsState.currentStep?.description ||
    greedyState.currentStep?.description ||
    'Siap menjalankan simulasi pencarian rute.';

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-slate-900/98 border-t border-slate-700/80 backdrop-blur-md shadow-2xl flex flex-col select-text ${
        isCollapsed ? 'h-11' : 'h-64 sm:h-72'
      }`}
      role="region"
      aria-label="Log Eksekusi Pencarian"
    >
      {/* Drawer Bar Header */}
      <div
        onClick={toggleCollapse}
        className="h-11 px-3 sm:px-4 bg-slate-950/95 hover:bg-slate-900 cursor-pointer border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs transition"
      >
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-slate-200 shrink-0 tracking-wide">
            LOG EKSEKUSI
          </span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
            {combinedItems.length}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-xs text-slate-400 truncate hidden md:inline font-sans">
            {activeDesc}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`min-h-[32px] px-2.5 py-1 rounded transition font-medium ${
                filter === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('UCS')}
              className={`min-h-[32px] px-2.5 py-1 rounded transition font-medium ${
                filter === 'UCS'
                  ? 'bg-cyan-900 text-cyan-300 font-bold border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UCS
            </button>
            <button
              type="button"
              onClick={() => setFilter('GREEDY')}
              className={`min-h-[32px] px-2.5 py-1 rounded transition font-medium ${
                filter === 'GREEDY'
                  ? 'bg-amber-900 text-amber-300 font-bold border border-amber-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Greedy
            </button>
          </div>

          <button
            type="button"
            onClick={toggleCollapse}
            className="min-h-[36px] px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
            aria-label={isCollapsed ? 'Buka Log Eksekusi' : 'Tutup Log Eksekusi'}
          >
            <span className="hidden xs:inline">{isCollapsed ? 'Buka' : 'Tutup'}</span>
            {isCollapsed ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Body (Steps Table) */}
      {!isCollapsed && (
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs p-1"
        >
          {combinedItems.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs font-sans">
              Belum ada log eksekusi. Silakan klik Play atau Step untuk memulai proses pencarian.
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const { step, originalIndex, isActive } = item;
              const isUCS = step.algorithm === 'UCS';

              return (
                <div
                  key={`${step.algorithm}-${step.stepNumber}-${idx}`}
                  onClick={() => onJumpToStep(step.algorithm, originalIndex)}
                  className={`min-h-[44px] px-3 py-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-800/60 ${
                    isActive
                      ? isUCS
                        ? 'log-row-active bg-cyan-950/70 border-l-4 border-cyan-400'
                        : 'log-row-active bg-amber-950/70 border-l-4 border-amber-400'
                      : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onJumpToStep(step.algorithm, originalIndex);
                    }
                  }}
                >
                  {/* Left Column: Step #, Algorithm, Node, Status */}
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-400 text-xs">#{step.stepNumber}</span>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isUCS
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {step.algorithm}
                    </span>

                    <span className="font-semibold text-slate-200 truncate">
                      {step.currentNodeId} ({step.currentNodeName})
                    </span>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-medium uppercase ${
                        step.status === 'GOAL_REACHED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : step.status === 'EXPLORING'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : step.status === 'RELAXING'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : step.status === 'TARGET_UNREACHABLE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.status}
                    </span>

                    {/* Cost / Heuristic */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      {isUCS ? (
                        <span>
                          g(n) = <b className="text-cyan-400">{step.cost_g.toFixed(3)} km</b>
                        </span>
                      ) : (
                        <span>
                          h(n) = <b className="text-amber-400">{step.heuristic_h.toFixed(3)} km</b>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Description */}
                  <div className="text-xs text-slate-400 max-w-lg font-sans text-left sm:text-right line-clamp-1 break-words">
                    {step.description}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
