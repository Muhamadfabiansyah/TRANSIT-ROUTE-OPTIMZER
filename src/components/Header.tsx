import React from 'react';
import { Route, MapPin, Database, Activity } from 'lucide-react';

interface HeaderProps {
  nodeCount: number;
  edgeCount: number;
}

export const Header: React.FC<HeaderProps> = ({ nodeCount, edgeCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Core Topic */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TRANSIT ROUTE OPTIMIZER
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                UCS vs Greedy
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl line-clamp-1">
              Sistem Analisis & Visualisasi Optimasi Rute Angkutan Umum Berbasis Graph Geografis Nyata
            </p>
          </div>
        </div>

        {/* Right: Area & Verified Dataset Status Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span className="font-medium text-slate-200">Kota Serang, Banten</span>
            <span className="text-slate-500 text-[11px]">(Pasar Rau — Alun-Alun)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-300">{nodeCount} Nodes</span>
            <span className="text-slate-500">·</span>
            <span className="font-semibold text-cyan-300">{edgeCount} Edges</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1" title="Dataset Terverifikasi OpenStreetMap"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
