import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Map.css';
import {
  WORLD_REGIONS,
  MAP_CAMERA_PRESETS,
  GeoRegion,
  latLngToPoint,
  pointToLatLng,
  formatCoordinates,
} from './mapData';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Layers,
  MapPin as MapPinIcon,
  Navigation,
  Globe,
} from 'lucide-react';

export interface MapRegionDatum {
  id: string; // matches GeoRegion id or code
  code?: string;
  name?: string;
  value?: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface MapMarker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  value?: number | string;
  category?: string;
  color?: string;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export interface MapRoute {
  id: string;
  from: { lat: number; lng: number; label?: string };
  to: { lat: number; lng: number; label?: string };
  label?: string;
  value?: number | string;
  color?: string;
  dashed?: boolean;
  animated?: boolean;
  width?: number;
}

export interface MapBubble {
  id: string;
  label: string;
  lat: number;
  lng: number;
  value: number;
  color?: string;
}

export type MapColorScale =
  | 'editorial'
  | 'stone'
  | 'amber'
  | 'emerald'
  | 'azure'
  | 'crimson'
  | string[];

export interface MapViewport {
  zoom: number;
  center: { lat: number; lng: number };
}

export interface MapProps {
  /** Optional title for map header */
  title?: React.ReactNode;
  /** Optional descriptive subtitle */
  subtitle?: React.ReactNode;
  /** Height in pixels of map canvas (default: 520) */
  height?: number;
  /** Choropleth region data */
  regionsData?: MapRegionDatum[];
  /** Geographic pin markers */
  markers?: MapMarker[];
  /** Connection routes / flight arcs */
  routes?: MapRoute[];
  /** Proportional bubbles */
  bubbles?: MapBubble[];
  /** Color scale theme for choropleth mapping */
  colorScale?: MapColorScale;
  /** Show meridians & parallels graticule grid */
  showGraticule?: boolean;
  /** Show floating navigation controls (zoom, reset, presets) */
  showControls?: boolean;
  /** Show bottom monospace telemetry status bar */
  showTelemetry?: boolean;
  /** Show data value gradient legend */
  showLegend?: boolean;
  /** Show north-facing compass rose */
  showCompass?: boolean;
  /** Show top layer switcher buttons */
  showLayerToggles?: boolean;
  /** Default camera preset to jump to */
  initialPreset?: keyof typeof MAP_CAMERA_PRESETS;
  /** Allow mouse pan and scroll wheel zoom */
  interactive?: boolean;
  /** Custom container class */
  className?: string;
  /** Custom container style */
  style?: React.CSSProperties;
  /** Callback fired when a landmass region is clicked */
  onRegionClick?: (region: GeoRegion, data?: MapRegionDatum) => void;
  /** Callback fired when a pin marker is clicked */
  onMarkerClick?: (marker: MapMarker) => void;
  /** Callback fired when a route arc is clicked */
  onRouteClick?: (route: MapRoute) => void;
  /** Callback fired when viewport zoom or pan changes */
  onViewportChange?: (viewport: MapViewport) => void;
}

const COLOR_SCALES: Record<string, string[]> = {
  editorial: ['#E7E5E4', '#A8A29E', '#78716C', '#44403C', '#1C1917'],
  stone: ['#F5F5F4', '#D6D3D1', '#A8A29E', '#57534E', '#292524'],
  amber: ['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706', '#92400E'],
  emerald: ['#D1FAE5', '#A7F3D0', '#34D399', '#059669', '#065F46'],
  azure: ['#E0F2FE', '#BAE6FD', '#38BDF8', '#0284C7', '#075985'],
  crimson: ['#FEE2E2', '#FECACA', '#F87171', '#DC2626', '#991B1B'],
};

/**
 * ThoughtStream Map Component
 *
 * Minimalist, high-telemetry interactive geographic visualization engine
 * with 0px geometry, hairline graticules, vector world paths, and liquid glass HUD.
 */
export const Map: React.FC<MapProps> = ({
  title,
  subtitle,
  height = 520,
  regionsData = [],
  markers = [],
  routes = [],
  bubbles = [],
  colorScale = 'editorial',
  showGraticule = true,
  showControls = true,
  showTelemetry = true,
  showLegend = true,
  showCompass = true,
  showLayerToggles = true,
  initialPreset = 'world',
  interactive = true,
  className = '',
  style,
  onRegionClick,
  onMarkerClick,
  onRouteClick,
  onViewportChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Layer Visibility
  const [layers, setLayers] = useState({
    regions: true,
    markers: true,
    routes: true,
    bubbles: true,
    graticule: showGraticule,
  });

  // Camera & Viewport Transformation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Telemetry Cursor Tracking
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Hover Tooltip State
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'region' | 'marker' | 'route' | 'bubble';
    data: any;
    x: number;
    y: number;
  } | null>(null);

  // Selected Region
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const baseWidth = 1000;
  const baseHeight = 500;

  // Initialize initial preset view
  useEffect(() => {
    if (initialPreset && MAP_CAMERA_PRESETS[initialPreset]) {
      const preset = MAP_CAMERA_PRESETS[initialPreset];
      setZoom(preset.zoom);
      const pt = latLngToPoint(preset.lat, preset.lng, baseWidth, baseHeight);
      setPan({
        x: (baseWidth / 2 - pt.x) * preset.zoom,
        y: (baseHeight / 2 - pt.y) * preset.zoom,
      });
    }
  }, [initialPreset]);

  // Notify viewport change
  useEffect(() => {
    const centerPoint = {
      x: baseWidth / 2 - pan.x / zoom,
      y: baseHeight / 2 - pan.y / zoom,
    };
    const centerLatLng = pointToLatLng(centerPoint.x, centerPoint.y, baseWidth, baseHeight);
    onViewportChange?.({
      zoom,
      center: centerLatLng,
    });
  }, [zoom, pan, onViewportChange]);

  // Color Scale Resolution
  const resolvedColors = useMemo(() => {
    if (Array.isArray(colorScale)) return colorScale;
    return COLOR_SCALES[colorScale] || COLOR_SCALES.editorial;
  }, [colorScale]);

  // Regional Value Range Calculation
  const { minVal, maxVal, dataMap } = useMemo(() => {
    const map = new globalThis.Map<string, MapRegionDatum>();
    let min = Infinity;
    let max = -Infinity;

    regionsData.forEach((d) => {
      map.set(d.id.toLowerCase(), d);
      if (d.code) map.set(d.code.toLowerCase(), d);
      if (d.value !== undefined) {
        if (d.value < min) min = d.value;
        if (d.value > max) max = d.value;
      }
    });

    return {
      minVal: min === Infinity ? 0 : min,
      maxVal: max === -Infinity ? 100 : max,
      dataMap: map,
    };
  }, [regionsData]);

  // Interpolate Region Color
  const getRegionColor = useCallback(
    (region: GeoRegion) => {
      const datum =
        dataMap.get(region.id.toLowerCase()) || dataMap.get(region.code.toLowerCase());
      if (datum?.color) return datum.color;
      if (datum?.value === undefined) return 'var(--ts-border-subtle)';

      if (maxVal === minVal) return resolvedColors[resolvedColors.length - 1];
      const ratio = Math.max(0, Math.min(1, (datum.value - minVal) / (maxVal - minVal)));
      const colorIndex = Math.min(
        resolvedColors.length - 1,
        Math.floor(ratio * (resolvedColors.length - 1))
      );
      return resolvedColors[colorIndex];
    },
    [dataMap, minVal, maxVal, resolvedColors]
  );

  // Zoom Helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(8, prev * 1.35));
  const handleZoomOut = () => setZoom((prev) => Math.max(1, prev / 1.35));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedRegionId(null);
  };

  const handleSelectPreset = (presetKey: string) => {
    const preset = MAP_CAMERA_PRESETS[presetKey];
    if (!preset) return;
    setZoom(preset.zoom);
    const pt = latLngToPoint(preset.lat, preset.lng, baseWidth, baseHeight);
    setPan({
      x: (baseWidth / 2 - pt.x) * preset.zoom,
      y: (baseHeight / 2 - pt.y) * preset.zoom,
    });
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate GPS coordinates under cursor
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Transform from screen pixels to unzoomed SVG map coordinates
      const svgX = (clickX - pan.x) / zoom;
      const svgY = (clickY - pan.y) / zoom;

      if (svgX >= 0 && svgX <= baseWidth && svgY >= 0 && svgY <= baseHeight) {
        setCursorCoords(pointToLatLng(svgX, svgY, baseWidth, baseHeight));
      }
    }

    if (isDragging && interactive) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel Zoom towards cursor
  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(1, Math.min(8, zoom * zoomFactor));

    if (newZoom !== zoom) {
      // Center zoom around mouse point
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`ts-map-container ${className}`.trim()}
      style={{ height, ...style }}
    >
      {/* Top Header & Layer Toggles */}
      {(title || subtitle || showLayerToggles) && (
        <div className="ts-map-header">
          <div className="ts-map-title-group">
            {title && (
              <h4 className="ts-map-title">
                <Globe size={18} strokeWidth={2} />
                {title}
              </h4>
            )}
            {subtitle && <p className="ts-map-subtitle">{subtitle}</p>}
          </div>

          {showLayerToggles && (
            <div className="ts-map-header-actions">
              <div className="ts-map-layer-toggles">
                <button
                  type="button"
                  className={`ts-map-layer-btn ${layers.regions ? 'ts-map-layer-btn--active' : ''}`}
                  onClick={() => setLayers((l) => ({ ...l, regions: !l.regions }))}
                  title="Toggle Regions / Choropleth"
                >
                  <Layers size={12} />
                  Regions
                </button>
                {markers.length > 0 && (
                  <button
                    type="button"
                    className={`ts-map-layer-btn ${layers.markers ? 'ts-map-layer-btn--active' : ''}`}
                    onClick={() => setLayers((l) => ({ ...l, markers: !l.markers }))}
                    title="Toggle Markers"
                  >
                    <MapPinIcon size={12} />
                    Markers ({markers.length})
                  </button>
                )}
                {routes.length > 0 && (
                  <button
                    type="button"
                    className={`ts-map-layer-btn ${layers.routes ? 'ts-map-layer-btn--active' : ''}`}
                    onClick={() => setLayers((l) => ({ ...l, routes: !l.routes }))}
                    title="Toggle Arcs / Routes"
                  >
                    <Navigation size={12} />
                    Routes ({routes.length})
                  </button>
                )}
                <button
                  type="button"
                  className={`ts-map-layer-btn ${layers.graticule ? 'ts-map-layer-btn--active' : ''}`}
                  onClick={() => setLayers((l) => ({ ...l, graticule: !l.graticule }))}
                  title="Toggle Coordinate Grid"
                >
                  Graticule
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Map Viewport */}
      <div
        className={`ts-map-viewport ${isDragging ? 'ts-map-viewport--dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setCursorCoords(null);
          setHoveredEntity(null);
        }}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
          className="ts-map-svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Graticule Grid (Parallels & Meridians) */}
            {layers.graticule && (
              <g className="ts-map-graticule-group">
                {/* Parallels (Latitude: 60°N, 30°N, Equator 0°, 30°S, 60°S) */}
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const y = ((90 - lat) / 180) * baseHeight;
                  const isEquator = lat === 0;
                  return (
                    <g key={`lat-${lat}`}>
                      <line
                        x1={0}
                        y1={y}
                        x2={baseWidth}
                        y2={y}
                        className={`ts-map-graticule ${isEquator ? 'ts-map-graticule--equator' : ''}`}
                      />
                      <text x={8} y={y - 4} className="ts-map-graticule-label">
                        {lat === 0 ? 'EQUATOR 0°' : `${Math.abs(lat)}° ${lat > 0 ? 'N' : 'S'}`}
                      </text>
                    </g>
                  );
                })}

                {/* Meridians (Longitude: -120°, -60°, Prime 0°, 60°, 120°) */}
                {[-120, -60, 0, 60, 120].map((lng) => {
                  const x = ((lng + 180) / 360) * baseWidth;
                  const isPrime = lng === 0;
                  return (
                    <g key={`lng-${lng}`}>
                      <line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={baseHeight}
                        className={`ts-map-graticule ${isPrime ? 'ts-map-graticule--prime' : ''}`}
                      />
                      <text x={x + 4} y={baseHeight - 8} className="ts-map-graticule-label">
                        {lng === 0 ? 'PRIME 0°' : `${Math.abs(lng)}° ${lng > 0 ? 'E' : 'W'}`}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Landmass Regions Layer */}
            {layers.regions && (
              <g className="ts-map-regions-group">
                {WORLD_REGIONS.map((region) => {
                  const datum =
                    dataMap.get(region.id.toLowerCase()) || dataMap.get(region.code.toLowerCase());
                  const fillColor = getRegionColor(region);
                  const isSelected = selectedRegionId === region.id;

                  return (
                    <path
                      key={region.id}
                      d={region.path}
                      className={`ts-map-region ${isSelected ? 'ts-map-region--selected' : ''}`}
                      style={{ fill: fillColor }}
                      onClick={() => {
                        setSelectedRegionId(region.id);
                        onRegionClick?.(region, datum);
                      }}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredEntity({
                            type: 'region',
                            data: { region, datum },
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredEntity(null)}
                    />
                  );
                })}
              </g>
            )}

            {/* Flight / Connection Arcs Layer */}
            {layers.routes && routes.length > 0 && (
              <g className="ts-map-routes-group">
                {routes.map((route) => {
                  const p1 = latLngToPoint(route.from.lat, route.from.lng, baseWidth, baseHeight);
                  const p2 = latLngToPoint(route.to.lat, route.to.lng, baseWidth, baseHeight);

                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const arcLift = Math.min(80, Math.max(20, dist * 0.22));
                  const cpX = midX;
                  const cpY = midY - arcLift;

                  const pathD = `M ${p1.x} ${p1.y} Q ${cpX} ${cpY} ${p2.x} ${p2.y}`;
                  const color = route.color || 'var(--ts-color-primary)';

                  return (
                    <g
                      key={route.id}
                      onClick={() => onRouteClick?.(route)}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredEntity({
                            type: 'route',
                            data: route,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredEntity(null)}
                    >
                      {/* Arc Base Stroke */}
                      <path
                        d={pathD}
                        className="ts-map-arc"
                        stroke={color}
                        strokeWidth={route.width || 1.5}
                        strokeDasharray={route.dashed ? '4 4' : undefined}
                        opacity={0.8}
                      />
                      {/* Animated Flow Pulse */}
                      {route.animated !== false && (
                        <path
                          d={pathD}
                          className="ts-map-arc-pulse"
                          stroke={color}
                          strokeWidth={(route.width || 1.5) + 1.2}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Proportional Bubbles Layer */}
            {layers.bubbles && bubbles.length > 0 && (
              <g className="ts-map-bubbles-group">
                {bubbles.map((bubble) => {
                  const pt = latLngToPoint(bubble.lat, bubble.lng, baseWidth, baseHeight);
                  const radius = Math.max(4, Math.min(32, Math.sqrt(bubble.value) * 1.5));
                  const color = bubble.color || 'var(--ts-color-primary)';

                  return (
                    <rect
                      key={bubble.id}
                      x={pt.x - radius}
                      y={pt.y - radius}
                      width={radius * 2}
                      height={radius * 2}
                      fill={color}
                      stroke={color}
                      className="ts-map-bubble"
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredEntity({
                            type: 'bubble',
                            data: bubble,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredEntity(null)}
                    />
                  );
                })}
              </g>
            )}

            {/* Markers & Pins Layer */}
            {layers.markers && markers.length > 0 && (
              <g className="ts-map-markers-group">
                {markers.map((marker) => {
                  const pt = latLngToPoint(marker.lat, marker.lng, baseWidth, baseHeight);
                  const color = marker.color || 'var(--ts-color-tertiary)';

                  return (
                    <g
                      key={marker.id}
                      className="ts-map-marker"
                      transform={`translate(${pt.x}, ${pt.y})`}
                      onClick={() => onMarkerClick?.(marker)}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredEntity({
                            type: 'marker',
                            data: marker,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredEntity(null)}
                    >
                      {/* Pulse Box */}
                      {marker.pulse && (
                        <rect
                          x={-8}
                          y={-8}
                          width={16}
                          height={16}
                          fill="none"
                          stroke={color}
                          strokeWidth={1.5}
                          className="ts-map-pulse-rect"
                        />
                      )}

                      {/* 0px Sharp Core Pin */}
                      <rect
                        x={-5}
                        y={-5}
                        width={10}
                        height={10}
                        fill={color}
                        stroke="var(--ts-color-bg)"
                        className="ts-map-marker-pin"
                      />

                      {/* Small Monospace Label if zoomed */}
                      {zoom >= 1.5 && (
                        <text y={-10} className="ts-map-marker-label">
                          {marker.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        {/* Floating Navigation Controls */}
        {showControls && (
          <div className="ts-map-controls">
            {showCompass && (
              <div className="ts-map-compass" title="True North">
                <Compass size={16} strokeWidth={2.2} />
              </div>
            )}
            <div className="ts-map-btn-group">
              <button
                type="button"
                className="ts-map-btn"
                onClick={handleZoomIn}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="ts-map-btn"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="ts-map-btn"
                onClick={handleReset}
                title="Reset Camera"
              >
                <RotateCcw size={14} strokeWidth={2} />
              </button>
            </div>

            <select
              className="ts-map-presets-select"
              defaultValue={initialPreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              title="Camera Region Presets"
            >
              {Object.entries(MAP_CAMERA_PRESETS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Choropleth Legend */}
        {showLegend && regionsData.length > 0 && (
          <div className="ts-map-legend">
            <span className="ts-map-legend-title">Value Intensity</span>
            <div
              className="ts-map-legend-bar"
              style={{
                background: `linear-gradient(to right, ${resolvedColors.join(', ')})`,
              }}
            />
            <div className="ts-map-legend-labels">
              <span>{minVal.toLocaleString()}</span>
              <span>{maxVal.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Hover Telemetry Tooltip */}
        {hoveredEntity && (
          <div
            className="ts-map-tooltip"
            style={{
              left: Math.min(hoveredEntity.x, (containerRef.current?.clientWidth || 800) - 180),
              top: Math.min(hoveredEntity.y, height - 100),
            }}
          >
            {hoveredEntity.type === 'region' && (
              <>
                <div className="ts-map-tooltip-title">
                  {hoveredEntity.data.region.name} ({hoveredEntity.data.region.code})
                </div>
                <div className="ts-map-tooltip-meta">
                  CONTINENT: {hoveredEntity.data.region.continent}
                </div>
                {hoveredEntity.data.datum?.value !== undefined && (
                  <div className="ts-map-tooltip-badge">
                    {hoveredEntity.data.datum.label || 'METRIC'}:{' '}
                    <strong>{hoveredEntity.data.datum.value.toLocaleString()}</strong>
                  </div>
                )}
              </>
            )}

            {hoveredEntity.type === 'marker' && (
              <>
                <div className="ts-map-tooltip-title">{hoveredEntity.data.label}</div>
                <div className="ts-map-tooltip-meta">
                  {formatCoordinates(hoveredEntity.data.lat, hoveredEntity.data.lng)}
                </div>
                {hoveredEntity.data.category && (
                  <div className="ts-map-tooltip-badge">{hoveredEntity.data.category}</div>
                )}
                {hoveredEntity.data.value !== undefined && (
                  <div className="ts-map-tooltip-meta" style={{ marginTop: 4 }}>
                    VALUE: {hoveredEntity.data.value}
                  </div>
                )}
              </>
            )}

            {hoveredEntity.type === 'route' && (
              <>
                <div className="ts-map-tooltip-title">
                  {hoveredEntity.data.label || 'Connection Route'}
                </div>
                <div className="ts-map-tooltip-meta">
                  {hoveredEntity.data.from.label || 'ORIGIN'} &rarr;{' '}
                  {hoveredEntity.data.to.label || 'DESTINATION'}
                </div>
                {hoveredEntity.data.value && (
                  <div className="ts-map-tooltip-badge">{hoveredEntity.data.value}</div>
                )}
              </>
            )}

            {hoveredEntity.type === 'bubble' && (
              <>
                <div className="ts-map-tooltip-title">{hoveredEntity.data.label}</div>
                <div className="ts-map-tooltip-badge">
                  DENSITY: {hoveredEntity.data.value.toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Monospace Telemetry Footer Bar */}
      {showTelemetry && (
        <div className="ts-map-telemetry">
          <div className="ts-map-telemetry-item">
            <span className="ts-map-telemetry-label">CURSOR:</span>
            <span className="ts-map-telemetry-val">
              {cursorCoords
                ? formatCoordinates(cursorCoords.lat, cursorCoords.lng)
                : 'HOVER CANVAS'}
            </span>
          </div>

          <div className="ts-map-telemetry-item">
            <span className="ts-map-telemetry-label">ZOOM:</span>
            <span className="ts-map-telemetry-val">{zoom.toFixed(2)}x</span>
          </div>

          <div className="ts-map-telemetry-item">
            <span className="ts-map-telemetry-label">DATUM:</span>
            <span className="ts-map-telemetry-val">WGS 84</span>
          </div>

          <div className="ts-map-telemetry-item">
            <span className="ts-map-telemetry-label">PROJECTION:</span>
            <span className="ts-map-telemetry-val">EQUIRECTANGULAR</span>
          </div>

          {markers.length > 0 && (
            <div className="ts-map-telemetry-item">
              <span className="ts-map-telemetry-label">ENTITIES:</span>
              <span className="ts-map-telemetry-val">{markers.length} PINS</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
