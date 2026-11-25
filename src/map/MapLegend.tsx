import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    { label: 'Origin', color: 'bg-red-500 ring-2 ring-red-400/30' },
    { label: 'Destination', color: 'bg-purple-500 ring-2 ring-purple-400/30' },
    { label: 'UCS (Optimal)', color: 'bg-cyan-400 shadow-sm shadow-cyan-500/50', textColor: 'text-cyan-300', isLine: true },
    { label: 'Greedy (Heuristik)', color: 'bg-amber-400 border-b border-dashed border-amber-600 shadow-sm shadow-amber-500/50', textColor: 'text-amber-300', isLine: true },
    { label: 'Explored', color: 'bg-slate-500' },
    { label: 'Jaringan Jalan', color: 'bg-slate-500', isLine: true },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs select-none">
      {/* Mobile Top Toggle (Optional expand/collapse for ultra-small screens) */}
      <div className="flex sm:hidden items-center justify-between pb-1">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400" /> Legenda Peta
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-cyan-400 font-medium flex items-center gap-0.5"
          aria-label={isExpanded ? 'Sembunyikan Legenda' : 'Tampilkan Legenda Lengkap'}
        >
          <span>{isExpanded ? 'Ringkas' : 'Semua'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Horizontal Scrollable Legend Content */}
      <div
        className={`w-full flex items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-300 overflow-x-auto no-scrollbar pb-0.5 ${
          isExpanded ? 'flex-wrap' : 'whitespace-nowrap'
        }`}
      >
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 shrink-0 py-0.5">
            {item.isLine ? (
              <span className={`w-3.5 h-1.5 rounded-sm ${item.color}`}></span>
            ) : (
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
            )}
            <span className={`font-medium ${item.textColor || 'text-slate-300'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
