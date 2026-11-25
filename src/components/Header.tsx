import React, { useState, useEffect } from 'react';
import { Route, MapPin, Database, Info, X } from 'lucide-react';

interface HeaderProps {
  nodeCount: number;
  edgeCount: number;
}

export const Header: React.FC<HeaderProps> = ({ nodeCount, edgeCount }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Close info modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInfoOpen(false);
      }
    };
    if (isInfoOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInfoOpen]);

  return (
    <header className="bg-slate-900/95 border-b border-slate-800/80 px-3 py-2 sm:px-5 sm:py-2.5 shadow-md shrink-0 z-30 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
      <div className="flex items-center justify-between gap-2 max-w-full">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white shrink-0">
            <Route className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white truncate">
                TRANSIT ROUTE OPTIMIZER
              </h1>
              <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                UCS vs Greedy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block truncate max-w-xl">
              Sistem Analisis & Visualisasi Optimasi Rute Angkutan Umum Berbasis Graph Geografis Nyata
            </p>
          </div>
        </div>

        {/* Right Desktop: Area & Dataset Status Badges (Hidden on mobile to eliminate clutter & duplication) */}
        <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-medium text-slate-200">Kota Serang, Banten</span>
            <span className="text-slate-500 text-[11px]">(Pasar Rau — Alun-Alun)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-cyan-300">{nodeCount} Nodes</span>
            <span className="text-slate-500">·</span>
            <span className="font-semibold text-cyan-300">{edgeCount} Edges</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1" title="Dataset Terverifikasi OpenStreetMap"></span>
          </div>
        </div>

        {/* Right Mobile: Info Button (Thumb-friendly touch target >= 44x44px) */}
        <div className="md:hidden flex items-center shrink-0">
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Informasi Dataset & Wilayah"
            aria-expanded={isInfoOpen}
          >
            <Info className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Mobile Info Sheet / Modal */}
      {isInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detail Dataset dan Wilayah"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsInfoOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>Informasi Dataset & Sistem</span>
              </div>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Tutup Informasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Wilayah Operasi: Kota Serang, Banten</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Koridor Trayek: Pasar Rau — Alun-Alun Kota Serang dan sekitarnya.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Dataset Graph Terverifikasi OSM</span>
                </div>
                <p className="text-[11px] text-cyan-300 pl-5 font-mono">
                  {nodeCount} Nodes Simpul · {edgeCount} Ruas Jalan (Edges)
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                Sistem simulasi dan komparasi algoritma Uniform Cost Search (UCS) dan Greedy Best-First Search untuk optimasi jaringan angkutan perkotaan.
              </p>
            </div>

            <button
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition min-h-[44px]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
