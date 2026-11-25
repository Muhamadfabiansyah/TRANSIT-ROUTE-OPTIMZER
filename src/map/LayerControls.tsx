import React from 'react';
import { MapLayerVisibility } from './mapTypes';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface LayerControlsProps {
  layers: MapLayerVisibility;
  onChangeLayers: (newLayers: MapLayerVisibility) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onChangeLayers,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleLayer = (key: keyof MapLayerVisibility) => {
    onChangeLayers({
      ...layers,
      [key]: !layers[key],
    });
  };

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
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-2 backdrop-blur-sm"
      >
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span>Map Layers</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-64 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-3 z-[1100] backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-semibold text-slate-200">Layer Kontrol Visual</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {layerItems.map((item) => {
              const active = layers[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleLayer(item.key)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition ${
                    active
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.colorIndicator }}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {active ? (
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
