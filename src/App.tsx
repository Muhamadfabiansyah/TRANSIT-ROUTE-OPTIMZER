import { useState, useEffect } from 'react';
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
  Map as MapIcon,
  BarChart3,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  X,
} from 'lucide-react';
import { PlaybackSpeed } from './simulation/SimulationState';

export function App() {
  const { state: simState, actions: simActions } = useSimulation('N01', 'N08');
  const [layers, setLayers] = useState<MapLayerVisibility>(defaultMapLayerVisibility);

  // Desktop Sidebars Collapsible State
  const [showConfig, setShowConfig] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Tablet Drawer Overlay State (768-1023px)
  const [tabletDrawer, setTabletDrawer] = useState<'none' | 'config' | 'analysis'>('none');

  // Bottom Execution Log Drawer State for Desktop/Tablet
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  // Mobile Tab Switcher ('map' | 'config' | 'analysis' | 'log')
  const [mobileTab, setMobileTab] = useState<'map' | 'config' | 'analysis' | 'log'>('map');

  // Adaptive sidebars on screen width changes
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      // On narrow laptop (1024-1279px), ensure map has at least 500px by keeping one sidebar open by default
      if (w >= 1024 && w < 1280) {
        if (showConfig && showAnalysis) {
          setShowAnalysis(false);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [showConfig, showAnalysis]);

  // Cycle speed for mobile mini playback bar
  const speeds: PlaybackSpeed[] = [1000, 500, 250, 100];
  const handleCycleSpeed = () => {
    const currentIndex = speeds.indexOf(simState.speedMs);
    const nextIndex = (currentIndex + 1) % speeds.length;
    simActions.setSpeed(speeds[nextIndex]);
  };

  const getSpeedLabel = (ms: PlaybackSpeed) => {
    switch (ms) {
      case 1000:
        return '0.5x';
      case 500:
        return '1.0x';
      case 250:
        return '2.0x';
      case 100:
        return '5.0x';
      default:
        return '1.0x';
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* 1. Header (Adaptive, single-row on mobile) */}
      <Header
        nodeCount={defaultSharedGraph.nodeList.length}
        edgeCount={defaultSharedGraph.edges.length}
      />

      {/* 2. Main Workspace (Flex-calculated dynamic viewport, zero hardcoded heights) */}
      <div className="flex-1 min-h-0 relative flex overflow-hidden w-full">
        {/* Left Sidebar (Desktop: >=1024px) */}
        <aside
          aria-label="Panel Konfigurasi Desktop"
          className={`shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-slate-900/95 z-20 hidden lg:flex flex-col ${
            showConfig ? 'w-72 xl:w-80' : 'w-0 border-r-0 overflow-hidden'
          }`}
        >
          {showConfig && (
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">Pengaturan Simulasi</span>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400"
                  title="Sembunyikan Panel Kontrol"
                  aria-label="Sembunyikan Panel Kontrol"
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
        </aside>

        {/* Center: Dominant Map Canvas (Main Stage) */}
        <main className="flex-1 min-h-0 h-full relative flex flex-col overflow-hidden bg-slate-950">
          {/* Leaflet Map Container: Fills 100% of Central Canvas */}
          <div className="flex-1 w-full min-h-0 relative">
            <MapContainer
              graph={defaultSharedGraph}
              simulationState={simState}
              layers={layers}
              onSetOrigin={simActions.setOrigin}
              onSetDestination={simActions.setDestination}
              extraLeftControls={
                <>
                  {/* Desktop Control Sidebar Opener */}
                  {!showConfig && (
                    <button
                      type="button"
                      onClick={() => setShowConfig(true)}
                      className="hidden lg:flex min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition items-center gap-1.5 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-cyan-400"
                      title="Buka Panel Kontrol"
                      aria-label="Buka Panel Kontrol"
                    >
                      <PanelLeftOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="hidden xl:inline">Kontrol</span>
                    </button>
                  )}

                  {/* Tablet Drawer Opener: Kontrol */}
                  <button
                    type="button"
                    onClick={() => setTabletDrawer(tabletDrawer === 'config' ? 'none' : 'config')}
                    className="hidden md:flex lg:hidden min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition items-center gap-1.5 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-cyan-400"
                    title="Buka Kontrol"
                    aria-label="Buka Kontrol"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Kontrol</span>
                  </button>
                </>
              }
              centerControl={
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 shadow-lg text-xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-semibold text-slate-200">Kota Serang</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-[11px] text-slate-400">Pasar Rau — Alun-Alun</span>
                </div>
              }
              extraRightControls={
                <>
                  <LayerControls layers={layers} onChangeLayers={setLayers} />

                  {/* Desktop Analysis Sidebar Opener */}
                  {!showAnalysis && (
                    <button
                      type="button"
                      onClick={() => setShowAnalysis(true)}
                      className="hidden lg:flex min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition items-center gap-1.5 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-cyan-400"
                      title="Buka Panel Analisis"
                      aria-label="Buka Panel Analisis"
                    >
                      <PanelRightOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="hidden xl:inline">Analisis</span>
                    </button>
                  )}

                  {/* Tablet Drawer Opener: Analisis */}
                  <button
                    type="button"
                    onClick={() => setTabletDrawer(tabletDrawer === 'analysis' ? 'none' : 'analysis')}
                    className="hidden md:flex lg:hidden min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition items-center gap-1.5 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-cyan-400"
                    title="Buka Analisis"
                    aria-label="Buka Analisis"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Analisis</span>
                  </button>
                </>
              }
            />

            {/* Mobile Mini Playback Control Bar (Floats above bottom nav when looking at map) */}
            {mobileTab === 'map' && (
              <div className="md:hidden absolute bottom-2 left-2 right-2 z-[900] pointer-events-none flex justify-center">
                <div className="pointer-events-auto bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 flex items-center justify-between gap-1.5 backdrop-blur-md max-w-sm w-full">
                  {/* Mode Indicator Button */}
                  <button
                    type="button"
                    onClick={() => setMobileTab('config')}
                    className={`min-h-[44px] px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 shrink-0 ${
                      simState.selectedAlgorithm === 'UCS'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : simState.selectedAlgorithm === 'GREEDY'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    }`}
                    title="Ganti Mode Algoritma"
                  >
                    <span>{simState.selectedAlgorithm}</span>
                  </button>

                  {/* Play / Pause / Replay Button */}
                  {simState.isPlaying ? (
                    <button
                      type="button"
                      onClick={simActions.pause}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 flex items-center justify-center font-bold shadow transition"
                      aria-label="Pause Simulasi"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={simActions.play}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center font-bold shadow transition"
                      aria-label={simState.simulationStatus === 'COMPLETED' ? 'Replay Simulasi' : 'Play Simulasi'}
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}

                  {/* Step Forward Button */}
                  <button
                    type="button"
                    onClick={simActions.stepForward}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 flex items-center justify-center transition"
                    aria-label="Langkah Berikutnya"
                    title="Step Forward"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={simActions.resetAll}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 active:bg-rose-900 border border-slate-700 flex items-center justify-center transition"
                    aria-label="Reset Simulasi"
                    title="Reset All"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Speed Cycle Button */}
                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="min-h-[44px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center transition shrink-0"
                    aria-label={`Ubah Kecepatan Simulasi, saat ini ${getSpeedLabel(simState.speedMs)}`}
                  >
                    <span>{getSpeedLabel(simState.speedMs)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Map Legend: Responsive strip below canvas */}
          <div className="shrink-0 w-full px-3 py-1.5 sm:px-4 bg-slate-950/95 border-t border-slate-800/80 z-10">
            <MapLegend />
          </div>

          {/* Desktop & Tablet Bottom Drawer: Execution Log */}
          <div className="w-full shrink-0 z-20 hidden md:block">
            <ExecutionLog
              simulationState={simState}
              onJumpToStep={simActions.jumpToStep}
              isDrawerOpen={isLogDrawerOpen}
              onToggleDrawer={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
            />
          </div>
        </main>

        {/* Right Sidebar (Desktop: >=1024px) */}
        <aside
          aria-label="Panel Analisis Desktop"
          className={`shrink-0 transition-all duration-300 ease-in-out border-l border-slate-800/80 bg-slate-900/95 z-20 hidden lg:flex flex-col ${
            showAnalysis ? 'w-72 xl:w-80' : 'w-0 border-l-0 overflow-hidden'
          }`}
        >
          {showAnalysis && (
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">Hasil & Analisis</span>
                <button
                  type="button"
                  onClick={() => setShowAnalysis(false)}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400"
                  title="Sembunyikan Panel Analisis"
                  aria-label="Sembunyikan Panel Analisis"
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
        </aside>

        {/* Tablet Drawers Overlay (768-1023px) */}
        {tabletDrawer !== 'none' && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs hidden md:flex lg:hidden animate-in fade-in duration-150"
            onClick={() => setTabletDrawer('none')}
          >
            <div
              className={`w-80 max-w-[85vw] h-full bg-slate-900 border-slate-800 shadow-2xl flex flex-col p-4 overflow-y-auto ${
                tabletDrawer === 'config' ? 'border-r animate-in slide-in-from-left duration-200' : 'ml-auto border-l animate-in slide-in-from-right duration-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-sm font-bold text-slate-200">
                  {tabletDrawer === 'config' ? 'Pengaturan Simulasi' : 'Hasil & Analisis'}
                </span>
                <button
                  type="button"
                  onClick={() => setTabletDrawer('none')}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Tutup Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {tabletDrawer === 'config' ? (
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
              ) : (
                <AnalysisPanel
                  graph={defaultSharedGraph}
                  ucsResult={simState.ucsState.searchResult}
                  greedyResult={simState.greedyState.searchResult}
                  comparison={simState.comparison}
                />
              )}
            </div>
          </div>
        )}

        {/* Mobile Fullscreen Panel Overlays (<768px): Leaves MapContainer mounted underneath */}
        {mobileTab === 'config' && (
          <div className="md:hidden absolute inset-0 z-30 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>Pengaturan Simulasi</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className="min-h-[44px] px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Ke Peta</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pb-6">
              <ConfigurationPanel
                nodes={defaultSharedGraph.nodeList}
                simulationState={simState}
                onSetOrigin={simActions.setOrigin}
                onSetDestination={simActions.setDestination}
                onSelectAlgorithm={simActions.selectAlgorithm}
                onPlay={() => {
                  simActions.play();
                  setMobileTab('map');
                }}
                onPause={simActions.pause}
                onStepForward={simActions.stepForward}
                onResetUCS={simActions.resetUCS}
                onResetGreedy={simActions.resetGreedy}
                onResetAll={simActions.resetAll}
                onSetSpeed={simActions.setSpeed}
              />
            </div>
          </div>
        )}

        {mobileTab === 'analysis' && (
          <div className="md:hidden absolute inset-0 z-30 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>Hasil & Analisis</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className="min-h-[44px] px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Ke Peta</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 pb-6">
              <AnalysisPanel
                graph={defaultSharedGraph}
                ucsResult={simState.ucsState.searchResult}
                greedyResult={simState.greedyState.searchResult}
                comparison={simState.comparison}
              />
            </div>
          </div>
        )}

        {mobileTab === 'log' && (
          <div className="md:hidden absolute inset-0 z-30 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Terminal className="w-4 h-4" />
                <span>Log Eksekusi</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className="min-h-[44px] px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Ke Peta</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 pb-6">
              <ExecutionLog
                simulationState={simState}
                onJumpToStep={(algo, idx) => {
                  simActions.jumpToStep(algo, idx);
                  setMobileTab('map');
                }}
                isDrawerOpen={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Mobile Thumb-Friendly Bottom Navigation Bar (<768px) */}
      <nav
        role="tablist"
        aria-label="Navigasi Utama Aplikasi"
        className="md:hidden grid grid-cols-4 items-center bg-slate-900 border-t border-slate-800/90 shrink-0 z-30 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <button
          role="tab"
          type="button"
          aria-selected={mobileTab === 'map'}
          aria-label="Tampilan Peta"
          onClick={() => setMobileTab('map')}
          className={`min-h-[52px] flex flex-col items-center justify-center gap-1 py-1 transition select-none ${
            mobileTab === 'map'
              ? 'text-cyan-400 font-bold bg-cyan-950/40 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
          }`}
        >
          <MapIcon className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-none">Peta</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={mobileTab === 'config'}
          aria-label="Panel Kontrol Simulasi"
          onClick={() => setMobileTab('config')}
          className={`min-h-[52px] flex flex-col items-center justify-center gap-1 py-1 transition select-none ${
            mobileTab === 'config'
              ? 'text-cyan-400 font-bold bg-cyan-950/40 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-none">Kontrol</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={mobileTab === 'analysis'}
          aria-label="Panel Hasil dan Analisis"
          onClick={() => setMobileTab('analysis')}
          className={`min-h-[52px] flex flex-col items-center justify-center gap-1 py-1 transition select-none ${
            mobileTab === 'analysis'
              ? 'text-cyan-400 font-bold bg-cyan-950/40 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-none">Analisis</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={mobileTab === 'log'}
          aria-label="Log Eksekusi Langkah"
          onClick={() => setMobileTab('log')}
          className={`min-h-[52px] flex flex-col items-center justify-center gap-1 py-1 transition select-none ${
            mobileTab === 'log'
              ? 'text-cyan-400 font-bold bg-cyan-950/40 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
          }`}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-none">Log</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
