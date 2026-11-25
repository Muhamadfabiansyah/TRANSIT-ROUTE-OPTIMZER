import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="w-full flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[11px] text-slate-300 py-0.5 select-none">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-400/30"></span>
        <span className="font-medium text-slate-300">Origin</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-400/30"></span>
        <span className="font-medium text-slate-300">Destination</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-3.5 h-1.5 bg-cyan-400 rounded-sm shadow-sm shadow-cyan-500/50"></span>
        <span className="font-medium text-cyan-300">UCS (Optimal)</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-3.5 h-1.5 bg-amber-400 rounded-sm border-b border-dashed border-amber-600 shadow-sm shadow-amber-500/50"></span>
        <span className="font-medium text-amber-300">Greedy (Heuristic)</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
        <span className="font-medium text-slate-400">Explored</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-3.5 h-1 bg-slate-500 rounded-sm"></span>
        <span className="font-medium text-slate-400">Jaringan Jalan</span>
      </div>
    </div>
  );
};
