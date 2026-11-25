import React from 'react';
import { SearchResult, ComparisonResult } from '../algorithms/algorithmTypes';
import { SharedGraph } from '../graph/graphTypes';
import { BarChart3, CheckCircle2, XCircle, ArrowRight, Zap, Sparkles, Scale } from 'lucide-react';

interface AnalysisPanelProps {
  graph: SharedGraph;
  ucsResult: SearchResult | null;
  greedyResult: SearchResult | null;
  comparison: ComparisonResult | null;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  graph,
  ucsResult,
  greedyResult,
  comparison,
}) => {
  const getNodeName = (id: string) => graph.nodes.get(id)?.name || id;

  const hasUCS = ucsResult !== null;
  const hasGreedy = greedyResult !== null;
  const hasBoth = hasUCS && hasGreedy && comparison !== null;

  if (!hasUCS && !hasGreedy) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 flex flex-col items-center justify-center text-center py-12">
        <BarChart3 className="w-10 h-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-300">Panel Analisis Algoritma</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Jalankan Uniform Cost Search (UCS) atau Greedy Best-First Search untuk melihat metrik pencarian rute aktual.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          ANALISIS PERFORMA PENCARIAN
        </h2>
        <span className="text-[10px] text-slate-400 font-mono">Real Performance Data</span>
      </div>

      {/* SECTION A: UCS RESULT */}
      {hasUCS && (
        <div className="bg-slate-950/70 border border-cyan-900/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">A. Hasil UCS (Uniform Cost Search)</span>
            </div>
            {ucsResult.found ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> Tidak Terjangkau
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Route Distance</span>
              <span className="text-base font-bold text-cyan-400 font-mono">
                {ucsResult.totalDistance.toFixed(3)}{' '}
                <span className="text-xs font-normal text-slate-400">km</span>
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Execution Time</span>
              <span className="text-base font-bold text-white font-mono">
                {ucsResult.executionTimeMs.toFixed(3)}{' '}
                <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Visited Nodes</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">
                {ucsResult.visitedCount} simpul
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Expanded Nodes</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">
                {ucsResult.expandedCount} ekspansi
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block mb-1">
              Path Nodes ({ucsResult.path.length} titik):
            </span>
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              {ucsResult.path.map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">
                    {nodeId} ({getNodeName(nodeId)})
                  </span>
                  {idx < ucsResult.path.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: GREEDY RESULT */}
      {hasGreedy && (
        <div className="bg-slate-950/70 border border-amber-900/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-950 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">B. Hasil Greedy Best-First Search</span>
            </div>
            {greedyResult.found ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ditemukan
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> Tidak Terjangkau
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Route Distance</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {greedyResult.totalDistance.toFixed(3)}{' '}
                <span className="text-xs font-normal text-slate-400">km</span>
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Execution Time</span>
              <span className="text-base font-bold text-white font-mono">
                {greedyResult.executionTimeMs.toFixed(3)}{' '}
                <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Visited Nodes</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">
                {greedyResult.visitedCount} simpul
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Expanded Nodes</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">
                {greedyResult.expandedCount} ekspansi
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block mb-1">
              Path Nodes ({greedyResult.path.length} titik):
            </span>
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              {greedyResult.path.map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px]">
                    {nodeId} ({getNodeName(nodeId)})
                  </span>
                  {idx < greedyResult.path.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: COMPARISON (Only rendered if BOTH algorithms are completed) */}
      {hasBoth && (
        <div className="bg-slate-950/90 border border-indigo-900/70 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-indigo-950 pb-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">C. Komparasi Eksperimental (UCS vs Greedy)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Selisih Jarak Jalan</span>
              <span className="text-sm font-bold text-white font-mono">
                {comparison.distanceDiffKm.toFixed(3)} km{' '}
                <span className="text-[10px] text-cyan-400">({comparison.distanceDiffPct}%)</span>
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Perbandingan Waktu Komputasi</span>
              <span className="text-sm font-bold text-white font-mono">
                {Math.abs(comparison.timeDiffMs).toFixed(3)} ms
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Perbandingan Visited Nodes</span>
              <span className="text-xs font-semibold text-slate-200">
                UCS ({ucsResult.visitedCount}) vs Greedy ({greedyResult.visitedCount})
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Perbandingan Expanded Nodes</span>
              <span className="text-xs font-semibold text-slate-200">
                UCS ({ucsResult.expandedCount}) vs Greedy ({greedyResult.expandedCount})
              </span>
            </div>
          </div>

          {/* Scientific Comparison Summary */}
          <div className="bg-indigo-950/40 border border-indigo-900/50 p-2.5 rounded-lg text-xs text-indigo-200 leading-relaxed">
            <span className="font-bold text-indigo-300 block mb-1">Kesimpulan Ilmiah Aktual:</span>
            <p className="text-[11px] text-slate-300">{comparison.summaryText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
