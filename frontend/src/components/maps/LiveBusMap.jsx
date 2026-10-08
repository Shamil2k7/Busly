'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  Phone,
  Maximize2,
  Crosshair,
  Layers,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  LocateFixed,
  Route as RouteIcon,
  Sparkles,
  Train,
  Split,
  Eye,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { loadLeaflet } from '@/lib/leaflet-loader';
import { getCurrentGpsLocation, reverseGeocode } from '@/lib/geo-utils';
import WhereIsMyTrainTimeline from './WhereIsMyTrainTimeline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * Authentic Google Maps Route & "Where Is My Train" Live Telemetry View
 * Features:
 * - Official Google Maps Roadmap, Satellite/Hybrid, Terrain, and Live Traffic tile layers
 * - Interactive View Mode Switcher: [Google Map View] | [Where Is My Train Timeline] | [Split View]
 * - Glowing navigation corridor polyline with directional indicators
 * - Concentric animated radar-pulse vehicle marker with live heading and speed
 * - Interactive numbered waypoint markers and floating Rapido/Instamart bottom sheet
 */
export default function LiveBusMap({
  bus,
  route,
  stops = [],
  activeTrip = null,
  showControls = true,
  className = '',
  height = 'h-[540px]',
  defaultViewMode = 'map', // 'map', 'timeline', 'split'
  onAddStopAtLocation = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stopMarkersRef = useRef([]);

  const { busLocations } = useSocket();
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState(defaultViewMode); // 'map', 'timeline', 'split'
  const [mapStyle, setMapStyle] = useState('google'); // 'google', 'satellite', 'terrain', 'traffic', 'voyager', 'dark'
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // Real-time bus telemetry
  const busTelemetry = (bus?.id && busLocations[bus.id]) || bus?.locationLogs?.[0] || null;
  const currentLat = busTelemetry?.latitude || (stops[0]?.latitude ?? 11.2785);
  const currentLng = busTelemetry?.longitude || (stops[0]?.longitude ?? 76.2280);
  const speed = busTelemetry?.speed ?? 0;
  const heading = busTelemetry?.heading ?? 45;
  const lastUpdated = busTelemetry?.lastUpdated || (busTelemetry?.timestamp ? new Date(busTelemetry.timestamp).toLocaleTimeString() : 'Live');

  // Sorted stops along the route
  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);
  const nextStop = sortedStops.length > 1 ? sortedStops[1] : sortedStops[0] || null;

  // Google Maps & Custom Tile Layers
  const tileLayers = {
    google: {
      name: 'Google Roadmap',
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    },
    satellite: {
      name: 'Google Satellite',
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    },
    terrain: {
      name: 'Google Terrain',
      url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    },
    traffic: {
      name: 'Google Traffic',
      url: 'https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps',
    },
    voyager: {
      name: 'Instamart Pastel',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; CARTO',
    },
    dark: {
      name: 'Night Dark',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; CARTO',
    },
  };

  // 1. Initialize Leaflet Map with Google Maps
  useEffect(() => {
    if (viewMode === 'timeline') return; // Skip map init if only showing timeline

    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Google Maps Roadmap Base Layer
        const currentCfg = tileLayers[mapStyle] || tileLayers.google;
        const tileLayer = L.tileLayer(currentCfg.url, {
          attribution: currentCfg.attribution,
          subdomains: currentCfg.subdomains || ['0', '1', '2', '3'],
          maxZoom: currentCfg.maxZoom || 20,
        }).addTo(map);

        map._buslyTileLayer = tileLayer;

        if (onAddStopAtLocation) {
          map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            setClickedCoords({ lat, lng });
            const geocodeResult = await reverseGeocode(lat, lng);
            onAddStopAtLocation({
              latitude: parseFloat(lat.toFixed(6)),
              longitude: parseFloat(lng.toFixed(6)),
              suggestedName: geocodeResult.shortName,
            });
          });
        }

        mapInstanceRef.current = map;
        setMapReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize Google Maps:', err);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // 2. Switch Tile Layers (Google Roadmap, Satellite, Terrain, Traffic, Dark)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || viewMode === 'timeline') return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (map._buslyTileLayer) {
      map.removeLayer(map._buslyTileLayer);
    }

    const cfg = tileLayers[mapStyle] || tileLayers.google;
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || ['0', '1', '2', '3'],
      maxZoom: cfg.maxZoom || 20,
    }).addTo(map);

    map._buslyTileLayer = newLayer;
  }, [mapStyle, mapReady, viewMode]);

  // 3. Render Route Polyline & Google Maps Numbered Pins
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || viewMode === 'timeline') return;
    const L = window.L;
    const map = mapInstanceRef.current;

    stopMarkersRef.current.forEach((m) => map.removeLayer(m));
    stopMarkersRef.current = [];

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (sortedStops.length === 0) return;

    const latLngs = sortedStops.map((s) => [s.latitude, s.longitude]);

    // Google Maps Navigation Polyline (Drop shadow + Primary navigation line)
    const shadowLine = L.polyline(latLngs, {
      color: '#0f172a',
      weight: 8,
      opacity: 0.25,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const mainLine = L.polyline(latLngs, {
      color: '#2563EB', // Google Maps vibrant Navigation Blue
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '10, 6',
    });

    const routeGroup = L.featureGroup([shadowLine, mainLine]).addTo(map);
    routePolylineRef.current = routeGroup;

    // Sequenced Stops Markers (Google Maps style pins)
    sortedStops.forEach((stop, index) => {
      const isOrigin = index === 0;
      const isDestination = index === sortedStops.length - 1;

      const pinHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <!-- Google Maps Stop Label -->
          <div class="mb-1 px-2.5 py-0.5 rounded-full bg-white text-slate-900 font-extrabold text-[10px] shadow-md border border-gray-200 whitespace-nowrap pointer-events-none transition-all group-hover:scale-110 flex items-center space-x-1">
            <span>${stop.name}</span>
            <span class="text-blue-600 font-mono">${stop.estimatedArrival || ''}</span>
          </div>
          
          <!-- Google Maps Style Teardrop Pin -->
          <div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xl transition-transform group-hover:scale-125 ${
            isOrigin
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40'
              : isDestination
              ? 'bg-red-600 text-white ring-4 ring-red-400/40'
              : 'bg-blue-600 text-white ring-4 ring-blue-400/30'
          }">
            ${isOrigin ? 'S' : isDestination ? 'D' : stop.sequence}
          </div>

          <div class="w-1.5 h-1.5 ${isOrigin ? 'bg-emerald-600' : isDestination ? 'bg-red-600' : 'bg-blue-600'} rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: pinHtml,
        className: 'leaflet-div-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            Stop ${stop.sequence}: ${stop.name}
          </div>
          <div style="color: #0284c7; font-weight: 700; margin-bottom: 4px;">
            ETA: ${stop.estimatedArrival || '--'} (On Time)
          </div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">
            GPS: ${stop.latitude.toFixed(5)}, ${stop.longitude.toFixed(5)}
          </div>
        </div>
      `);

      stopMarkersRef.current.push(marker);
    });

    if (latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 16 });
    }
  }, [stops, mapReady, viewMode]);

  // 4. Render Live Vehicle with Concentric Radar Pulse
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || viewMode === 'timeline') return;
    const L = window.L;
    const map = mapInstanceRef.current;

    const busNumber = bus?.busNumber || 'Fleet Vehicle';
    const speedDisplay = Math.round(speed);

    const busHtml = `
      <div class="relative flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
        <!-- Concentric Radar Pulse Rings -->
        <div class="radar-ring"></div>
        <div class="radar-ring radar-ring-2"></div>

        <!-- Google Maps Style Vehicle Tag -->
        <div class="mb-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 font-black text-[11px] shadow-xl border border-slate-700 flex items-center space-x-1 whitespace-nowrap z-20">
          <span>${busNumber}</span>
          <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
          <span>${speedDisplay} km/h</span>
        </div>

        <!-- Animated Vehicle Center Icon -->
        <div class="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 z-10 transition-transform duration-500" style="transform: rotate(${heading}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M16 6v6"></path>
            <path d="M2 12h20"></path>
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <path d="m4 19 2-2"></path>
            <path d="m20 19-2-2"></path>
          </svg>
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busHtml,
      className: 'leaflet-div-icon',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([currentLat, currentLng]);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker([currentLat, currentLng], {
        icon: busIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      busMarkerRef.current.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="font-size: 14px; color: #0f172a;">${busNumber}</strong><br/>
          <span style="color: #64748b;">Speed: <strong>${speedDisplay} km/h</strong></span><br/>
          <span style="color: #10b981; font-weight: 700;">● Live GPS Broadcasting</span>
        </div>
      `);
    }
  }, [currentLat, currentLng, speed, heading, bus, mapReady, viewMode]);

  const handleCenterBus = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([currentLat, currentLng], 16, { animate: true, duration: 1 });
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current || sortedStops.length === 0) return;
    const L = window.L;
    const allPts = [
      ...sortedStops.map((s) => [s.latitude, s.longitude]),
      [currentLat, currentLng],
    ];
    mapInstanceRef.current.fitBounds(L.latLngBounds(allPts), { padding: [50, 50], maxZoom: 16 });
  };

  const handleLocateMe = async () => {
    setIsLocatingUser(true);
    try {
      const gps = await getCurrentGpsLocation();
      setUserLocation(gps);

      if (mapInstanceRef.current && window.L) {
        const L = window.L;
        const userIcon = L.divIcon({
          html: '<div class="user-location-pin" style="transform: translate(-50%, -50%);"></div>',
          className: 'leaflet-div-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([gps.latitude, gps.longitude]);
        } else {
          userMarkerRef.current = L.marker([gps.latitude, gps.longitude], {
            icon: userIcon,
            zIndexOffset: 900,
          }).addTo(mapInstanceRef.current);
          userMarkerRef.current.bindPopup('<b>Your Current Location</b><br/>You are here.');
        }

        mapInstanceRef.current.flyTo([gps.latitude, gps.longitude], 16, { animate: true });
      }
    } catch (err) {
      alert(err.message || 'Could not access your location.');
    } finally {
      setIsLocatingUser(false);
    }
  };

  // Fly to stop selected from Where Is My Train timeline
  const handleTimelineStopSelect = (stop) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stop.latitude, stop.longitude], 16, { animate: true, duration: 1 });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* View Mode Switcher: Google Map | Where Is My Train Timeline | Split View */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'map'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Map</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'timeline'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Train className="w-3.5 h-3.5 text-amber-400" />
            <span>Train Timeline</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'split'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-emerald-400" />
            <span>Split View</span>
          </button>
        </div>

        {/* Live GPS Telemetry Pulse Badge */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="hidden sm:inline font-mono">GPS: {Math.round(speed)} km/h • Live</span>
        </div>
      </div>

      {/* Main Display Container */}
      <div
        className={`${
          viewMode === 'split'
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-4'
            : 'w-full'
        }`}
      >
        {/* A. GOOGLE MAP CANVAS (Visible in 'map' or 'split') */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div
            className={`relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${
              viewMode === 'split' ? 'lg:col-span-7 h-[460px] sm:h-[520px]' : height
            }`}
          >
            {/* Google Maps Floating Top Header */}
            <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-2 sm:px-4 sm:py-2.5 shadow-xl flex items-center space-x-3 pointer-events-auto">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {bus?.busNumber || 'Fleet Vehicle'}
                    </span>
                    <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                      Google Maps Live
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {route?.name || 'Active Corridor'} • <span className="font-bold text-gray-800">{speed.toFixed(0)} km/h</span>
                  </p>
                </div>
              </div>

              {/* Google Maps Floating Controls */}
              {showControls && (
                <div className="flex items-center space-x-2 pointer-events-auto">
                  <button
                    onClick={handleCenterBus}
                    title="Center on Vehicle"
                    className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
                  >
                    <Crosshair className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleFitRoute}
                    title="Fit Full Route"
                    className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleLocateMe}
                    title="Locate My Current GPS"
                    disabled={isLocatingUser}
                    className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-blue-600 flex items-center justify-center shadow-lg transition-all active:scale-95"
                  >
                    <LocateFixed className={`w-5 h-5 ${isLocatingUser ? 'text-blue-600 animate-spin' : ''}`} />
                  </button>

                  {/* Google Maps Tile Layer Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                      title="Google Maps Tile Styles"
                      className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-blue-600 flex items-center justify-center shadow-lg transition-all active:scale-95"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    {isLayerMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-[500] text-xs">
                        <div className="px-3 py-1 font-bold text-gray-400 text-[10px] uppercase">
                          Google Maps Layers
                        </div>
                        {Object.entries(tileLayers).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setMapStyle(key);
                              setIsLayerMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 ${
                              mapStyle === key ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-gray-700'
                            }`}
                          >
                            <span>{cfg.name}</span>
                            {mapStyle === key && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full flex-1 min-h-[340px] z-0" />

            {/* Floating Bottom Card */}
            {viewMode === 'map' && (
              <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-2xl p-3.5 space-y-3 pointer-events-auto transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {nextStop ? `Next: ${nextStop.name}` : 'Route Completed'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {nextStop?.estimatedArrival || 'On Time'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {sortedStops.length} stops configured • Last GPS: {lastUpdated}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCardExpanded(!isCardExpanded)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    >
                      {isCardExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                  </div>

                  {isCardExpanded && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                            {bus?.driver?.name ? bus.driver.name.charAt(0) : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{bus?.driver?.name || 'Assigned Driver'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {bus?.registrationNumber || 'KL-10-AB-1234'} • 4.9 ★
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {bus?.driver?.mobile && (
                            <a href={`tel:${bus.driver.mobile}`}>
                              <Button variant="primary" size="sm" className="h-8 px-3 text-xs font-bold rounded-xl shadow-sm">
                                <Phone className="w-3.5 h-3.5 mr-1" /> Call
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* B. "WHERE IS MY TRAIN" TIMELINE (Visible in 'timeline' or 'split') */}
        {(viewMode === 'timeline' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'w-full'}`}>
            <WhereIsMyTrainTimeline
              bus={bus}
              route={route}
              stops={stops}
              activeTrip={activeTrip}
              currentLat={currentLat}
              currentLng={currentLng}
              speed={speed}
              onSelectStop={handleTimelineStopSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
