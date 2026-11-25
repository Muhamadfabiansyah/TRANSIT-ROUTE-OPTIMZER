import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SharedGraph } from '../graph/graphTypes';
import { GlobalSimulationState } from '../simulation/SimulationState';
import { MapLayerVisibility } from './mapTypes';
import { extractRouteCoordinates } from '../graph/buildGraph';
import transitRoutesData from '../data/transit-routes.json';
import { Maximize2, Compass } from 'lucide-react';

interface MapViewProps {
  graph: SharedGraph;
  simulationState: GlobalSimulationState;
  layers: MapLayerVisibility;
  onSetOrigin: (nodeId: string) => void;
  onSetDestination: (nodeId: string) => void;
}

export const MapContainer: React.FC<MapViewProps> = ({
  graph,
  simulationState,
  layers,
  onSetOrigin,
  onSetDestination,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups to manage dynamic additions/removals
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const roadNetworkLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const graphNodesLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const exploredLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const ucsRouteLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const greedyRouteLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const transitLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const passengerLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const busLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  // Persistent Bus Marker references (eliminates DOM recreation lag)
  const ucsMarkerRef = useRef<L.Marker | null>(null);
  const greedyMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fixed initial center and zoom for Kota Serang
    const serangCenter: L.LatLngExpression = [-6.1172, 106.1580];
    const INITIAL_ZOOM = 15;
    const map = L.map(mapContainerRef.current, {
      center: serangCenter,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: true,
      doubleClickZoom: false, // Prevents unintended auto-zoom on double-clicking
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Standard Tile Layer
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tiles;

    // Add layer groups to map in proper z-order
    roadNetworkLayerRef.current.addTo(map);
    transitLayerRef.current.addTo(map);
    passengerLayerRef.current.addTo(map);
    exploredLayerRef.current.addTo(map);
    ucsRouteLayerRef.current.addTo(map);
    greedyRouteLayerRef.current.addTo(map);
    graphNodesLayerRef.current.addTo(map);
    busLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    // Trigger initial size invalidation to ensure full tile coverage without camera shift
    map.invalidateSize({ pan: false });
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    }, 150);

    return () => {
      clearTimeout(t1);
      map.remove();
      mapInstanceRef.current = null;
      ucsMarkerRef.current = null;
      greedyMarkerRef.current = null;
    };
  }, []);

  // 2. Continuous ResizeObserver: guarantees map tiles fill 100% of container when layout/panels shift without accidental panning
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    let lastWidth = 0;
    let lastHeight = 0;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (Math.abs(width - lastWidth) >= 1 || Math.abs(height - lastHeight) >= 1) {
          lastWidth = width;
          lastHeight = height;
          map.invalidateSize({ pan: false });
        }
      }
    });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 3. Handle Base Map visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    if (layers.baseMap) {
      if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        tileLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
    }
  }, [layers.baseMap]);

  // 4. Render Road Network Layer
  useEffect(() => {
    const layer = roadNetworkLayerRef.current;
    layer.clearLayers();
    if (!layers.roadNetwork) return;

    const renderedEdges = new Set<string>();

    for (const edge of graph.edges) {
      const normalizedKey = [edge.source, edge.target].sort().join('--');
      if (renderedEdges.has(normalizedKey)) continue;
      renderedEdges.add(normalizedKey);

      const latlngs: L.LatLngExpression[] = edge.geometry.map(([lat, lng]) => [lat, lng]);

      const polyline = L.polyline(latlngs, {
        color: '#64748b', // Slate gray
        weight: 3.5,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindTooltip(
        `<div class="text-xs font-sans">
          <p class="font-bold text-slate-800">${edge.streetName}</p>
          <p class="text-slate-600">Jarak: ${(edge.weight * 1000).toFixed(0)} meter (${edge.weight.toFixed(3)} km)</p>
          <p class="text-slate-500">${edge.oneWay ? 'Satu Arah' : 'Dua Arah'}</p>
        </div>`,
        { sticky: true }
      );

      polyline.addTo(layer);
    }
  }, [graph, layers.roadNetwork]);

  // 5. Render Transit Routes Layer (Simulated Angkot)
  useEffect(() => {
    const layer = transitLayerRef.current;
    layer.clearLayers();
    if (!layers.transitRoutes) return;

    for (const tr of transitRoutesData) {
      const coords = extractRouteCoordinates(graph, tr.pathNodeIds);
      if (coords.length < 2) continue;

      const latlngs: L.LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);

      const polyline = L.polyline(latlngs, {
        color: tr.color,
        weight: 4,
        opacity: 0.75,
        dashArray: '6, 8',
      });

      polyline.bindTooltip(
        `<div class="text-xs">
          <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1" style="background-color: ${tr.color}">${tr.routeCode}</span>
          <p class="font-bold text-slate-900">${tr.routeName}</p>
          <p class="text-slate-600 text-[11px]">${tr.description}</p>
          <p class="text-[10px] text-amber-700 font-semibold mt-1">[Simulated Transit Data]</p>
        </div>`,
        { sticky: true }
      );

      polyline.addTo(layer);
    }
  }, [graph, layers.transitRoutes]);

  // 6. Render Passenger Information Layer
  useEffect(() => {
    const layer = passengerLayerRef.current;
    layer.clearLayers();
    if (!layers.passengerInfo) return;

    for (const node of graph.nodeList) {
      if (!node.passengerInfo) continue;
      const { dailyBoarding, congestionIndex, densityLevel, peakHours } = node.passengerInfo;

      const radius = Math.max(12, Math.min(30, dailyBoarding / 150));
      const color =
        congestionIndex > 0.75 ? '#ef4444' : congestionIndex > 0.5 ? '#f59e0b' : '#10b981';

      const circle = L.circleMarker([node.lat, node.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 1.5,
      });

      circle.bindTooltip(
        `<div class="text-xs">
          <p class="font-bold text-slate-900">${node.name}</p>
          <p class="text-slate-700">Penumpang Naik: <span class="font-semibold">${dailyBoarding.toLocaleString()}</span></p>
          <p class="text-slate-700">Kepadatan: <span class="font-semibold">${densityLevel} (Indeks: ${congestionIndex})</span></p>
          <p class="text-slate-500 text-[10px]">Jam Sibuk: ${peakHours}</p>
          <p class="text-[10px] text-amber-700 font-semibold mt-1">[Simulated Passenger Demand]</p>
        </div>`,
        { sticky: true }
      );

      circle.addTo(layer);
    }
  }, [graph, layers.passengerInfo]);

  // 7. Render Explored Nodes Highlight Layer
  useEffect(() => {
    const layer = exploredLayerRef.current;
    layer.clearLayers();
    if (!layers.exploredNodes) return;

    const { ucsState, greedyState } = simulationState;
    const exploredSet = new Set<string>();

    ucsState.exploredNodeIds.forEach((id) => exploredSet.add(id));
    greedyState.exploredNodeIds.forEach((id) => exploredSet.add(id));

    for (const nodeId of exploredSet) {
      const node = graph.nodes.get(nodeId);
      if (!node) continue;

      const isCurrentUCS = ucsState.currentNodeId === nodeId;
      const isCurrentGreedy = greedyState.currentNodeId === nodeId;

      const halo = L.circleMarker([node.lat, node.lng], {
        radius: isCurrentUCS || isCurrentGreedy ? 20 : 13,
        color: isCurrentUCS ? '#06b6d4' : isCurrentGreedy ? '#f59e0b' : '#64748b',
        fillColor: isCurrentUCS ? '#06b6d4' : isCurrentGreedy ? '#f59e0b' : '#94a3b8',
        fillOpacity: isCurrentUCS || isCurrentGreedy ? 0.45 : 0.22,
        weight: isCurrentUCS || isCurrentGreedy ? 2.5 : 1.5,
        dashArray: isCurrentUCS || isCurrentGreedy ? undefined : '3, 4',
      });

      halo.addTo(layer);
    }
  }, [graph, layers.exploredNodes, simulationState.ucsState.currentNodeId, simulationState.greedyState.currentNodeId, simulationState.ucsState.exploredNodeIds, simulationState.greedyState.exploredNodeIds]);

  // 8. Render UCS Route Layer
  useEffect(() => {
    const layer = ucsRouteLayerRef.current;
    layer.clearLayers();
    if (!layers.ucsRoute) return;

    const { ucsState } = simulationState;
    const path = ucsState.highlightedPath;
    if (path.length < 2) return;

    const coords = extractRouteCoordinates(graph, path);
    if (coords.length < 2) return;

    const latlngs: L.LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);

    // Outer glow / halo
    const glow = L.polyline(latlngs, {
      color: '#0891b2',
      weight: 7,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });
    glow.addTo(layer);

    // Primary route line
    const polyline = L.polyline(latlngs, {
      color: '#06b6d4',
      weight: 4.5,
      opacity: 0.95,
      className: ucsState.isFinished ? '' : 'anim-route-ucs',
      lineCap: 'round',
      lineJoin: 'round',
    });

    const dist = ucsState.searchResult?.totalDistance ?? 0;
    polyline.bindTooltip(
      `<div class="text-xs">
        <p class="font-bold text-cyan-700">Rute UCS (Optimal)</p>
        <p class="text-slate-700">Panjang Rute: ${dist.toFixed(3)} km</p>
        <p class="text-slate-500">${path.length} simpul dilewati</p>
      </div>`,
      { sticky: true }
    );

    polyline.addTo(layer);
  }, [graph, layers.ucsRoute, simulationState.ucsState.highlightedPath, simulationState.ucsState.isFinished]);

  // 9. Render Greedy Route Layer
  useEffect(() => {
    const layer = greedyRouteLayerRef.current;
    layer.clearLayers();
    if (!layers.greedyRoute) return;

    const { greedyState, ucsState } = simulationState;
    const path = greedyState.highlightedPath;
    if (path.length < 2) return;

    const coords = extractRouteCoordinates(graph, path);
    if (coords.length < 2) return;

    const latlngs: L.LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);

    const hasBothRoutes = layers.ucsRoute && ucsState.highlightedPath.length >= 2;

    const polyline = L.polyline(latlngs, {
      color: '#f59e0b',
      weight: hasBothRoutes ? 3 : 4.5,
      opacity: 0.95,
      dashArray: hasBothRoutes ? '4, 4' : undefined,
      className: greedyState.isFinished ? '' : 'anim-route-greedy',
      lineCap: 'round',
      lineJoin: 'round',
    });

    const dist = greedyState.searchResult?.totalDistance ?? 0;
    polyline.bindTooltip(
      `<div class="text-xs">
        <p class="font-bold text-amber-700">Rute Greedy Best-First</p>
        <p class="text-slate-700">Panjang Rute: ${dist.toFixed(3)} km</p>
        <p class="text-slate-500">${path.length} simpul dilewati</p>
      </div>`,
      { sticky: true }
    );

    polyline.addTo(layer);
  }, [graph, layers.greedyRoute, layers.ucsRoute, simulationState.greedyState.highlightedPath, simulationState.greedyState.isFinished, simulationState.ucsState.highlightedPath]);

  // 10. Render Graph Nodes Layer
  useEffect(() => {
    const layer = graphNodesLayerRef.current;
    layer.clearLayers();
    if (!layers.graphNodes) return;

    const { originId, destinationId, ucsState, greedyState } = simulationState;

    for (const node of graph.nodeList) {
      const isOrigin = node.id === originId;
      const isDestination = node.id === destinationId;
      const isCurrentUCS = ucsState.currentNodeId === node.id;
      const isCurrentGreedy = greedyState.currentNodeId === node.id;
      const isExploredUCS = ucsState.exploredNodeIds.includes(node.id);
      const isExploredGreedy = greedyState.exploredNodeIds.includes(node.id);

      let pinColor = '#3b82f6';
      let ringColor = 'transparent';

      if (isOrigin) {
        pinColor = '#ef4444';
        ringColor = '#fca5a5';
      } else if (isDestination) {
        pinColor = '#a855f7';
        ringColor = '#d8b4fe';
      } else if (isCurrentUCS) {
        pinColor = '#06b6d4';
        ringColor = '#67e8f9';
      } else if (isCurrentGreedy) {
        pinColor = '#f59e0b';
        ringColor = '#fcd34d';
      } else if (isExploredUCS || isExploredGreedy) {
        pinColor = '#64748b';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none group" style="transform: translate(-50%, -50%);">
          ${
            isOrigin || isDestination || isCurrentUCS || isCurrentGreedy
              ? `<div class="absolute w-8 h-8 rounded-full pulse-marker" style="background-color: ${ringColor}; opacity: 0.5;"></div>`
              : ''
          }
          <div class="relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 border-white transition-transform group-hover:scale-125" style="background-color: ${pinColor};">
            ${node.id.replace('N', '')}
          </div>
          <span class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-900/90 text-slate-200 border border-slate-700 shadow pointer-events-none">
            ${node.name.length > 18 ? node.name.substring(0, 16) + '...' : node.name}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-graph-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 text-slate-100 max-w-xs';
      popupDiv.innerHTML = `
        <div class="border-b border-slate-700 pb-2 mb-2">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-cyan-400 border border-slate-700">${node.id}</span>
            <span class="text-[10px] uppercase font-semibold text-slate-400">${node.type}</span>
          </div>
          <h4 class="text-sm font-bold text-white mt-1 leading-tight">${node.name}</h4>
          <p class="text-[11px] text-slate-400 mt-1">${node.description || ''}</p>
          <p class="text-[10px] text-slate-500 font-mono mt-1">${node.lat.toFixed(5)}, ${node.lng.toFixed(5)}</p>
        </div>

        ${
          node.passengerInfo
            ? `<div class="bg-slate-800/80 p-2 rounded border border-slate-700/60 mb-2.5 text-[11px]">
                <div class="flex justify-between text-slate-300">
                  <span>Naik: <b class="text-cyan-300">${node.passengerInfo.dailyBoarding.toLocaleString()}</b></span>
                  <span>Turun: <b class="text-amber-300">${node.passengerInfo.dailyAlighting.toLocaleString()}</b></span>
                </div>
                <div class="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Kepadatan: ${node.passengerInfo.densityLevel}</span>
                  <span class="text-amber-400 font-semibold">[Simulated Data]</span>
                </div>
              </div>`
            : ''
        }

        <div class="grid grid-cols-2 gap-2 mt-2">
          <button id="btn-set-origin-${node.id}" class="px-2 py-1.5 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition flex items-center justify-center gap-1 shadow-sm">
            Set as Origin
          </button>
          <button id="btn-set-dest-${node.id}" class="px-2 py-1.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-1 shadow-sm">
            Set as Dest
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv, { autoPan: false });

      marker.on('popupopen', () => {
        const originBtn = document.getElementById(`btn-set-origin-${node.id}`);
        const destBtn = document.getElementById(`btn-set-dest-${node.id}`);

        if (originBtn) {
          originBtn.onclick = () => {
            onSetOrigin(node.id);
            marker.closePopup();
          };
        }
        if (destBtn) {
          destBtn.onclick = () => {
            onSetDestination(node.id);
            marker.closePopup();
          };
        }
      });

      marker.addTo(layer);
    }
  }, [graph, layers.graphNodes, simulationState.originId, simulationState.destinationId, simulationState.ucsState.currentNodeId, simulationState.greedyState.currentNodeId, simulationState.ucsState.exploredNodeIds, simulationState.greedyState.exploredNodeIds, onSetOrigin, onSetDestination]);

  // 11. Refined Bus Icon Generator (Strict Centerline Anchor [22, 11])
  const createCenterlineBusIcon = (
    algo: 'UCS' | 'GREEDY',
    color: string,
    bearing: number
  ) => {
    // Rotation angle: in SVG pointing right (+90 deg), so angle = bearing - 90
    const rotation = (bearing - 90) % 360;

    const html = `
      <div style="width: 44px; height: 22px; position: relative; pointer-events: none; margin: 0; padding: 0;">
        <div class="bus-rotator-${algo.toLowerCase()}" style="width: 44px; height: 22px; transform: rotate(${rotation}deg); transform-origin: 22px 11px; will-change: transform;">
          <svg viewBox="0 0 44 22" width="44" height="22" style="display: block; overflow: visible; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
            <!-- Headlight Beams -->
            <polygon points="36,5 44,2 44,8" fill="${color}" opacity="0.65" />
            <polygon points="36,17 44,14 44,20" fill="${color}" opacity="0.65" />
            <!-- Bus Body (Width 36, Height 18, Centered at x: 4..40, y: 2..20 -> Center is x=22, y=11) -->
            <rect x="4" y="2" width="36" height="18" rx="4" fill="#090d16" stroke="${color}" stroke-width="2.2" />
            <!-- Windshield at front (right) -->
            <path d="M 32 4 Q 38 11 32 18" fill="${color}" opacity="0.9" />
            <!-- Roof Sign / Compartment -->
            <rect x="10" y="5" width="16" height="12" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.7" />
            <!-- Route Label -->
            <text x="18" y="13" fill="#ffffff" font-size="7" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" dominant-baseline="middle">${algo}</text>
            <!-- Red Tail Lights at back (left) -->
            <rect x="4" y="4" width="2" height="3.5" fill="#ef4444" rx="1" />
            <rect x="4" y="14.5" width="2" height="3.5" fill="#ef4444" rx="1" />
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: `bus-marker-${algo.toLowerCase()}`,
      html,
      iconSize: [44, 22],
      iconAnchor: [22, 11], // Exactly at geometric center (22, 11)
    });
  };

  // 12. Render BUS ANIMATION Layer (High-Performance 60FPS Centerline Navigation)
  useEffect(() => {
    const layer = busLayerRef.current;
    const { ucsState, greedyState } = simulationState;

    // --- A. Handle UCS Bus Marker ---
    if (ucsState.bus.active && ucsState.bus.position) {
      const rot = (ucsState.bus.bearing - 90) % 360;

      if (!ucsMarkerRef.current) {
        const icon = createCenterlineBusIcon('UCS', '#06b6d4', ucsState.bus.bearing);
        const marker = L.marker(ucsState.bus.position, { icon, zIndexOffset: 1000 });
        marker.addTo(layer);
        ucsMarkerRef.current = marker;
      } else {
        ucsMarkerRef.current.setLatLng(ucsState.bus.position);
        const rotEl = ucsMarkerRef.current.getElement()?.querySelector('.bus-rotator-ucs') as HTMLElement;
        if (rotEl) {
          rotEl.style.transform = `rotate(${rot}deg)`;
        }
      }
    } else {
      if (ucsMarkerRef.current) {
        layer.removeLayer(ucsMarkerRef.current);
        ucsMarkerRef.current = null;
      }
    }

    // --- B. Handle Greedy Bus Marker ---
    if (greedyState.bus.active && greedyState.bus.position) {
      const rot = (greedyState.bus.bearing - 90) % 360;

      if (!greedyMarkerRef.current) {
        const icon = createCenterlineBusIcon('GREEDY', '#f59e0b', greedyState.bus.bearing);
        const marker = L.marker(greedyState.bus.position, { icon, zIndexOffset: 990 });
        marker.addTo(layer);
        greedyMarkerRef.current = marker;
      } else {
        greedyMarkerRef.current.setLatLng(greedyState.bus.position);
        const rotEl = greedyMarkerRef.current.getElement()?.querySelector('.bus-rotator-greedy') as HTMLElement;
        if (rotEl) {
          rotEl.style.transform = `rotate(${rot}deg)`;
        }
      }
    } else {
      if (greedyMarkerRef.current) {
        layer.removeLayer(greedyMarkerRef.current);
        greedyMarkerRef.current = null;
      }
    }
  }, [
    simulationState.ucsState.bus.active,
    simulationState.ucsState.bus.position,
    simulationState.ucsState.bus.bearing,
    simulationState.greedyState.bus.active,
    simulationState.greedyState.bus.position,
    simulationState.greedyState.bus.bearing,
  ]);

  // Manual Center on Entire Network - Only triggered when user manually clicks button. STRICTLY preserves current zoom level.
  const handleFitEntireNetwork = () => {
    if (!mapInstanceRef.current || graph.nodeList.length === 0) return;
    const latlngs: L.LatLngExpression[] = graph.nodeList.map((n) => [n.lat, n.lng]);
    const bounds = L.latLngBounds(latlngs);
    mapInstanceRef.current.panTo(bounds.getCenter(), { animate: true });
  };

  // Manual Center on Active Route - Only triggered when user manually clicks button. STRICTLY preserves current zoom level.
  const handleFocusRoute = () => {
    if (!mapInstanceRef.current) return;
    const { ucsState, greedyState } = simulationState;
    const pathNodes = ucsState.highlightedPath.length >= 2
      ? ucsState.highlightedPath
      : greedyState.highlightedPath;

    if (pathNodes.length >= 2) {
      const coords = extractRouteCoordinates(graph, pathNodes);
      if (coords.length >= 2) {
        const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
        mapInstanceRef.current.panTo(bounds.getCenter(), { animate: true });
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden bg-slate-950 flex flex-col">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" style={{ minHeight: '360px' }} />

      {/* Floating Action Controls on Map (Top-Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleFitEntireNetwork}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-lg hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5 backdrop-blur-md"
          title="Pusatkan peta ke seluruh node jaringan Serang"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fit Jaringan</span>
        </button>

        {(simulationState.ucsState.highlightedPath.length >= 2 ||
          simulationState.greedyState.highlightedPath.length >= 2) && (
          <button
            onClick={handleFocusRoute}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/95 text-cyan-300 border border-cyan-800/80 shadow-lg hover:bg-cyan-950 transition flex items-center gap-1.5 backdrop-blur-md"
            title="Fokus ke jalur rute hasil pencarian"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fokus Rute</span>
          </button>
        )}
      </div>
    </div>
  );
};
