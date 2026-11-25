import React, { useState } from 'react';
import { defaultSharedGraph } from './graph/buildGraph';
import { useSimulation } from './simulation/useSimulation';
import { defaultMapLayerVisibility, MapLayerVisibility } from './map/mapTypes';
import { Header } from './components/Header';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { MapContainer } from './map/MapContainer';
import { LayerControls } from './map/LayerControls';
import { MapLegend } from './map/MapLegend';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ExecutionLog } from './components/ExecutionLog';
import {
  Sliders,
  Map,
  BarChart3,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

export function App() {
  const { state: simState, actions: simActions } = useSimulation('N01', 'N08');
  const [layers, setLayers] = useState<MapLayerVisibility>(defaultMapLayerVisibility);

  // Desktop Sidebars Collapsible State (Empowers Map-Centric Focus)
  const [showConfig, setShowConfig] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Bottom Execution Log Drawer State
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  // Mobile Tab Switcher ('map' | 'config' | 'analysis' | 'log')
  const [mobileTab, setMobileTab] = useState<'map' | 'config' | 'analysis' | 'log'>('map');

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header (Fixed Height: 56px) */}
      <Header
        nodeCount={defaultSharedGraph.nodeList.length}
        edgeCount={defaultSharedGraph.edges.length}
      />

      {/* Mobile Tab Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 p-1 text-xs shrink-0 z-30">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
            mobileTab === 'map'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Peta</span>
        </button>
        <button
          onClick={() => setMobileTab('config')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
            mobileTab === 'config'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kontrol</span>
        </button>
        <button
          onClick={() => setMobileTab('analysis')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
            mobileTab === 'analysis'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analisis</span>
        </button>
        <button
          onClick={() => setMobileTab('log')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition ${
            mobileTab === 'log'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Log</span>
        </button>
      </div>

      {/* 2. Main Map-Centric Workspace (Fills exact viewport height) */}
      <div className="flex-1 relative flex overflow-hidden w-full h-[calc(100vh-56px)]">
        {/* Left Sidebar: Configuration Panel */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-900/90 z-20 flex flex-col ${
            showConfig ? 'w-80' : 'w-0'
          } ${
            mobileTab === 'config'
              ? 'fixed inset-0 top-24 bottom-0 z-40 w-full overflow-y-auto bg-slate-950 p-4'
              : 'hidden lg:flex'
          }`}
        >
          {showConfig && (
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">Pengaturan Simulasi</span>
                <button
                  onClick={() => setShowConfig(false)}
                  className="hidden lg:flex p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Sembunyikan Panel Kontrol"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <ConfigurationPanel
                nodes={defaultSharedGraph.nodeList}
                simulationState={simState}
                onSetOrigin={simActions.setOrigin}
                onSetDestination={simActions.setDestination}
                onSelectAlgorithm={simActions.selectAlgorithm}
                onPlay={simActions.play}
                onPause={simActions.pause}
                onStepForward={simActions.stepForward}
                onResetUCS={simActions.resetUCS}
                onResetGreedy={simActions.resetGreedy}
                onResetAll={simActions.resetAll}
                onSetSpeed={simActions.setSpeed}
              />
            </div>
          )}
        </div>

        {/* Center: Dominant Map Area (70-80% Screen Priority) */}
        <div className="flex-1 h-full relative flex flex-col overflow-hidden bg-slate-950">
          {/* Map Top Floating Controls Bar */}
          <div className="absolute top-3 left-3 right-3 z-[900] pointer-events-none flex items-center justify-between gap-2">
            {/* Left toggle buttons for sidebars */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {!showConfig && (
                <button
                  onClick={() => setShowConfig(true)}
                  className="hidden lg:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700 shadow-xl hover:bg-slate-800 hover:text-white backdrop-blur-md items-center gap-1.5 transition"
                  title="Tampilkan Panel Kontrol"
                >
                  <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
                  <span>Kontrol</span>
                </button>
              )}

              {/* Research status pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 shadow-lg text-xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">Kota Serang</span>
                <span className="text-slate-500">·</span>
                <span className="text-[11px] text-slate-400">Pasar Rau — Alun-Alun</span>
              </div>
            </div>

            {/* Right: Layer Controls & Analysis Toggle */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <LayerControls layers={layers} onChangeLayers={setLayers} />

              {!showAnalysis && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="hidden lg:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700 shadow-xl hover:bg-slate-800 hover:text-white backdrop-blur-md items-center gap-1.5 transition"
                  title="Tampilkan Panel Analisis"
                >
                  <PanelRightOpen className="w-4 h-4 text-cyan-400" />
                  <span>Analisis</span>
                </button>
              )}
            </div>
          </div>

          {/* Leaflet Map Container: Fills 100% of Central Canvas */}
          <div className="flex-1 w-full min-h-0 relative">
            <MapContainer
              graph={defaultSharedGraph}
              simulationState={simState}
              layers={layers}
              onSetOrigin={simActions.setOrigin}
              onSetDestination={simActions.setDestination}
            />
          </div>

          {/* Dedicated Visual Legend Strip (Outside Map, Below Canvas) */}
          <div className="shrink-0 w-full px-4 py-1.5 bg-slate-950/95 border-t border-slate-800/80 z-20">
            <MapLegend />
          </div>

          {/* Bottom Drawer: Execution Log (Collapsible, Does Not Sacrifice Map) */}
          <div className="w-full shrink-0 z-30">
            <ExecutionLog
              simulationState={simState}
              onJumpToStep={simActions.jumpToStep}
              isDrawerOpen={isLogDrawerOpen}
              onToggleDrawer={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
            />
          </div>
        </div>

        {/* Right Sidebar: Analysis Panel */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out border-l border-slate-800/80 bg-slate-900/90 z-20 flex flex-col ${
            showAnalysis ? 'w-80' : 'w-0'
          } ${
            mobileTab === 'analysis'
              ? 'fixed inset-0 top-24 bottom-0 z-40 w-full overflow-y-auto bg-slate-950 p-4'
              : 'hidden lg:flex'
          }`}
        >
          {showAnalysis && (
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">Hasil & Analisis</span>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="hidden lg:flex p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Sembunyikan Panel Analisis"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              <AnalysisPanel
                graph={defaultSharedGraph}
                ucsResult={simState.ucsState.searchResult}
                greedyResult={simState.greedyState.searchResult}
                comparison={simState.comparison}
              />
            </div>
          )}
        </div>

        {/* Mobile Log Viewport */}
        {mobileTab === 'log' && (
          <div className="fixed inset-0 top-24 bottom-0 z-40 w-full bg-slate-950 p-3 lg:hidden overflow-y-auto">
            <ExecutionLog
              simulationState={simState}
              onJumpToStep={(algo, idx) => {
                simActions.jumpToStep(algo, idx);
                setMobileTab('map');
              }}
              isDrawerOpen={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
