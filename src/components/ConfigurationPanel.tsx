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
  CheckCircle2,
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
    { label: '1x', ms: 500 },
    { label: '2x', ms: 250 },
    { label: '5x', ms: 100 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          KONTROL SIMULASI
        </h2>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          Serang Core
        </span>
      </div>

      {/* 1. Origin & Destination Selector */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Titik Asal (Origin)
          </label>
          <select
            value={originId}
            onChange={(e) => onSetOrigin(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} — {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            title="Tukar Origin dan Destination"
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition transform hover:rotate-180 duration-200"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Titik Tujuan (Destination)
          </label>
          <select
            value={destinationId}
            onChange={(e) => onSetDestination(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
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
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-400">Pilih Mode Algoritma</label>
          <span className="text-[10px] text-slate-500 font-mono">Selector Mode</span>
        </div>

        {/* UCS Selection Card */}
        <button
          onClick={() => onSelectAlgorithm('UCS')}
          className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 shadow-sm ${
            selectedAlgorithm === 'UCS'
              ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${selectedAlgorithm === 'UCS' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold leading-none">Uniform Cost Search</div>
              <div className="text-[10px] text-slate-400 mt-1">Priority: g(n) · Jarak Jalan Terpendek</div>
            </div>
          </div>
          {selectedAlgorithm === 'UCS' ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-900 text-cyan-300 border border-cyan-700">
              AKTIF
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Pilih</span>
          )}
        </button>

        {/* Greedy Selection Card */}
        <button
          onClick={() => onSelectAlgorithm('GREEDY')}
          className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 shadow-sm ${
            selectedAlgorithm === 'GREEDY'
              ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${selectedAlgorithm === 'GREEDY' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold leading-none">Greedy Best-First</div>
              <div className="text-[10px] text-slate-400 mt-1">Priority: h(n) · Heuristik Garis Lurus</div>
            </div>
          </div>
          {selectedAlgorithm === 'GREEDY' ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-900 text-amber-300 border border-amber-700">
              AKTIF
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Pilih</span>
          )}
        </button>

        {/* Both Selection Card */}
        <button
          onClick={() => onSelectAlgorithm('BOTH')}
          className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 shadow-sm ${
            selectedAlgorithm === 'BOTH'
              ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${selectedAlgorithm === 'BOTH' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold leading-none">Both (Komparasi Langsung)</div>
              <div className="text-[10px] text-slate-400 mt-1">Jalankan UCS & Greedy Bersamaan</div>
            </div>
          </div>
          {selectedAlgorithm === 'BOTH' ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-900 text-indigo-300 border border-indigo-700">
              AKTIF
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Pilih</span>
          )}
        </button>

        {/* Status Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-slate-400 font-medium">Status Simulasi:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
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
              ? 'READY (Tekan Play)'
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
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <label className="text-[11px] font-semibold text-slate-400">Kontrol Playback</label>

        <div className="grid grid-cols-3 gap-2">
          {isPlaying ? (
            <button
              onClick={onPause}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              {simulationStatus === 'COMPLETED' ? 'Replay' : 'Play'}
            </button>
          )}

          <button
            onClick={onStepForward}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Step
          </button>

          <button
            onClick={onResetAll}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1"
            title="Reset All Simulation States"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Individual Resets */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onResetUCS}
            disabled={!ucsState.hasRun}
            className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-slate-400 border border-slate-700/60 transition"
          >
            Reset UCS
          </button>
          <button
            onClick={onResetGreedy}
            disabled={!greedyState.hasRun}
            className="flex-1 py-1 text-[10px] font-medium rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-400 border border-slate-700/60 transition"
          >
            Reset Greedy
          </button>
        </div>
      </div>

      {/* 4. Playback Speed Selector */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Kecepatan Simulasi</span>
          <span className="text-[10px] font-mono text-cyan-400">
            {speedMs === 1000 ? '0.5x' : speedMs === 500 ? '1.0x' : speedMs === 250 ? '2.0x' : '5.0x'}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {speedOptions.map((opt) => (
            <button
              key={opt.ms}
              onClick={() => onSetSpeed(opt.ms)}
              className={`py-1 rounded text-xs font-medium transition ${
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
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
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
