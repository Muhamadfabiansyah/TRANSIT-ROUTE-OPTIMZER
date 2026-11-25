import React from 'react';
import { GraphNode } from '../graph/graphTypes';
import { GlobalSimulationState, PlaybackSpeed, SelectedAlgorithm } from '../simulation/SimulationState';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowRightLeft,
  Sliders,
  Sparkles,
  Zap,
  Scale,
} from 'lucide-react';

interface ConfigurationPanelProps {
  nodes: GraphNode[];
  simulationState: GlobalSimulationState;
  onSetOrigin: (nodeId: string) => void;
  onSetDestination: (nodeId: string) => void;
  onSelectAlgorithm: (algo: SelectedAlgorithm) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onResetUCS: () => void;
  onResetGreedy: () => void;
  onResetAll: () => void;
  onSetSpeed: (speedMs: PlaybackSpeed) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  nodes,
  simulationState,
  onSetOrigin,
  onSetDestination,
  onSelectAlgorithm,
  onPlay,
  onPause,
  onStepForward,
  onResetUCS,
  onResetGreedy,
  onResetAll,
  onSetSpeed,
}) => {
  const {
    originId,
    destinationId,
    selectedAlgorithm,
    simulationStatus,
    isPlaying,
    speedMs,
    ucsState,
    greedyState,
  } = simulationState;

  const handleSwap = () => {
    const prevOrigin = originId;
    onSetOrigin(destinationId);
    onSetDestination(prevOrigin);
  };

  const speedOptions: { label: string; ms: PlaybackSpeed }[] = [
    { label: '0.5x', ms: 1000 },
    { label: '1.0x', ms: 500 },
    { label: '2.0x', ms: 250 },
    { label: '5.0x', ms: 100 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3.5 text-slate-100">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          KONTROL SIMULASI
        </h2>
        <span className="text-[11px] uppercase font-bold text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
          Kota Serang
        </span>
      </div>

      {/* 1. Origin & Destination Selector */}
      <div className="space-y-2.5">
        <div>
          <label htmlFor="origin-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            Titik Asal (Origin)
          </label>
          <select
            id="origin-select"
            value={originId}
            onChange={(e) => onSetOrigin(e.target.value)}
            className="w-full min-h-[44px] bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm sm:text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-0.5">
          <button
            type="button"
            onClick={handleSwap}
            title="Tukar Origin dan Destination"
            aria-label="Tukar Titik Asal dan Tujuan"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition transform hover:rotate-180 duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label htmlFor="dest-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
            Titik Tujuan (Destination)
          </label>
          <select
            id="dest-select"
            value={destinationId}
            onChange={(e) => onSetDestination(e.target.value)}
            className="w-full min-h-[44px] bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm sm:text-xs text-white focus:outline-none focus:border-purple-500 transition"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. ALGORITHM SELECTOR (Mode Selector: UCS, Greedy, Both) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Pilih Mode Algoritma</label>
          <span className="text-[11px] text-slate-500 font-mono">Selector Mode</span>
        </div>

        {/* UCS Selection Card */}
        <button
          type="button"
          onClick={() => onSelectAlgorithm('UCS')}
          aria-pressed={selectedAlgorithm === 'UCS'}
          className={`w-full min-h-[50px] p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            selectedAlgorithm === 'UCS'
              ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${selectedAlgorithm === 'UCS' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">Uniform Cost Search</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">Priority: g(n) · Rute Terpendek</div>
            </div>
          </div>
          {selectedAlgorithm === 'UCS' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-300 border border-cyan-700 shrink-0">
              AKTIF
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 shrink-0">Pilih</span>
          )}
        </button>

        {/* Greedy Selection Card */}
        <button
          type="button"
          onClick={() => onSelectAlgorithm('GREEDY')}
          aria-pressed={selectedAlgorithm === 'GREEDY'}
          className={`w-full min-h-[50px] p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 ${
            selectedAlgorithm === 'GREEDY'
              ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${selectedAlgorithm === 'GREEDY' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">Greedy Best-First</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">Priority: h(n) · Heuristik Lurus</div>
            </div>
          </div>
          {selectedAlgorithm === 'GREEDY' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-300 border border-amber-700 shrink-0">
              AKTIF
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 shrink-0">Pilih</span>
          )}
        </button>

        {/* Both Selection Card */}
        <button
          type="button"
          onClick={() => onSelectAlgorithm('BOTH')}
          aria-pressed={selectedAlgorithm === 'BOTH'}
          className={`w-full min-h-[50px] p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            selectedAlgorithm === 'BOTH'
              ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${selectedAlgorithm === 'BOTH' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">Both (Komparasi Langsung)</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">Jalankan UCS & Greedy Bersamaan</div>
            </div>
          </div>
          {selectedAlgorithm === 'BOTH' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-300 border border-indigo-700 shrink-0">
              AKTIF
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 shrink-0">Pilih</span>
          )}
        </button>

        {/* Status Badge */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
              simulationStatus === 'RUNNING'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
                : simulationStatus === 'PAUSED'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : simulationStatus === 'COMPLETED'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {simulationStatus === 'READY'
              ? 'READY (Play)'
              : simulationStatus === 'RUNNING'
              ? 'RUNNING'
              : simulationStatus === 'PAUSED'
              ? 'PAUSED'
              : simulationStatus === 'COMPLETED'
              ? 'COMPLETED'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* 3. PLAYBACK CONTROLS (Play, Pause, Step Forward, Reset) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300">Kontrol Playback</label>

        <div className="grid grid-cols-3 gap-2">
          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 transition flex items-center justify-center gap-1.5 shadow focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Pause Simulasi"
            >
              <Pause className="w-4 h-4 shrink-0" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={simulationStatus === 'COMPLETED' ? 'Replay Simulasi' : 'Jalankan Simulasi'}
            >
              <Play className="w-4 h-4 shrink-0" />
              <span>{simulationStatus === 'COMPLETED' ? 'Replay' : 'Play'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStepForward}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Langkah Berikutnya"
          >
            <SkipForward className="w-4 h-4 shrink-0" />
            <span>Step</span>
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950 hover:text-rose-300 active:bg-rose-900 text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-400"
            title="Reset Seluruh Status Simulasi"
            aria-label="Reset Semua Simulasi"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Reset</span>
          </button>
        </div>

        {/* Individual Resets */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onResetUCS}
            disabled={!ucsState.hasRun}
            className="flex-1 min-h-[40px] py-1.5 text-xs font-medium rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-slate-400 border border-slate-700/60 transition"
          >
            Reset UCS
          </button>
          <button
            type="button"
            onClick={onResetGreedy}
            disabled={!greedyState.hasRun}
            className="flex-1 min-h-[40px] py-1.5 text-xs font-medium rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-400 border border-slate-700/60 transition"
          >
            Reset Greedy
          </button>
        </div>
      </div>

      {/* 4. Playback Speed Selector */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Kecepatan Simulasi</span>
          <span className="text-xs font-mono text-cyan-400">
            {speedMs === 1000 ? '0.5x' : speedMs === 500 ? '1.0x' : speedMs === 250 ? '2.0x' : '5.0x'}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {speedOptions.map((opt) => (
            <button
              key={opt.ms}
              type="button"
              onClick={() => onSetSpeed(opt.ms)}
              className={`min-h-[40px] py-1.5 rounded-lg text-xs font-medium transition ${
                speedMs === opt.ms
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step Progress Info */}
      {(ucsState.hasRun || greedyState.hasRun) && (
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
          {ucsState.hasRun && (
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold">UCS Step:</span>
              <span className="font-mono text-slate-300">
                {ucsState.currentStepIndex + 1} / {ucsState.totalSteps}{' '}
                {ucsState.isFinished ? '(Selesai)' : ''}
              </span>
            </div>
          )}
          {greedyState.hasRun && (
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold">Greedy Step:</span>
              <span className="font-mono text-slate-300">
                {greedyState.currentStepIndex + 1} / {greedyState.totalSteps}{' '}
                {greedyState.isFinished ? '(Selesai)' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
