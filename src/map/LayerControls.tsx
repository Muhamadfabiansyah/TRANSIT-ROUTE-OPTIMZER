import React, { useState, useEffect } from 'react';
import { MapLayerVisibility } from './mapTypes';
import { Layers, Eye, EyeOff, X } from 'lucide-react';

interface LayerControlsProps {
  layers: MapLayerVisibility;
  onChangeLayers: (newLayers: MapLayerVisibility) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onChangeLayers,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLayer = (key: keyof MapLayerVisibility) => {
    onChangeLayers({
      ...layers,
      [key]: !layers[key],
    });
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const layerItems: {
    key: keyof MapLayerVisibility;
    label: string;
    badge?: string;
    colorIndicator?: string;
  }[] = [
    { key: 'baseMap', label: 'Base Map (OpenStreetMap)', colorIndicator: '#94a3b8' },
    { key: 'roadNetwork', label: 'Jaringan Jalan (GeoJSON)', colorIndicator: '#64748b' },
    { key: 'graphNodes', label: 'Graph Nodes (14 Simpul)', colorIndicator: '#3b82f6' },
    { key: 'exploredNodes', label: 'Explored Nodes', colorIndicator: '#64748b' },
    { key: 'ucsRoute', label: 'UCS Route (Optimal)', colorIndicator: '#06b6d4' },
    { key: 'greedyRoute', label: 'Greedy Route', colorIndicator: '#f59e0b' },
    { key: 'transitRoutes', label: 'Trayek Angkot Serang', badge: 'Simulasi', colorIndicator: '#10b981' },
    { key: 'passengerInfo', label: 'Distribusi Penumpang', badge: 'Simulasi', colorIndicator: '#ef4444' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="Pengaturan Layer Peta"
        aria-expanded={isOpen}
      >
        <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="hidden xs:inline">Layers</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for click outside / mobile overlay */}
          <div
            className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-xs sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover / Sheet Container */}
          <div
            className="fixed inset-x-3 bottom-3 max-h-[75vh] z-[1200] sm:absolute sm:inset-auto sm:top-10 sm:right-0 sm:bottom-auto sm:w-64 max-w-[calc(100vw-1.5rem)] bg-slate-900/98 border border-slate-700 rounded-2xl sm:rounded-xl shadow-2xl p-3 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Pilih Lapisan Peta"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Layer Kontrol Visual
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition"
                aria-label="Tutup Pengaturan Layer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[60vh] sm:max-h-72 pr-0.5">
              {layerItems.map((item) => {
                const active = layers[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleLayer(item.key)}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition ${
                      active
                        ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/60'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: item.colorIndicator }}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {active ? (
                      <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
