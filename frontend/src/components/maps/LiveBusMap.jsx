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
  Sparkles
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { loadLeaflet } from '@/lib/leaflet-loader';
import { getCurrentGpsLocation, reverseGeocode } from '@/lib/geo-utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * Rapido / Instamart / Google Maps Style Route & Live Telemetry Map
 * Features real interactive tiles (CartoDB Voyager / OSM / Dark),
 * glowing route corridor polyline, animated radar-pulse bus marker,
 * numbered sequenced stops, user live GPS tracking, and a Rapido/Instamart floating bottom trip card.
 */
export default function LiveBusMap({
  bus,
  route,
  stops = [],
  activeTrip = null,
  showControls = true,
  className = '',
  height = 'h-[520px]',
  onAddStopAtLocation = null,
  interactive = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stopMarkersRef = useRef([]);

  const { busLocations } = useSocket();
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState('voyager'); // 'voyager' (Google/Instamart style), 'osm', 'dark'
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

  // Determine current active / next stop in Rapido / Instamart style
  const nextStop = sortedStops.length > 1 ? sortedStops[1] : sortedStops[0] || null;

  // Tile layer URL definitions
  const tileLayers = {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    },
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;
    let LInstance = null;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;
        LInstance = L;

        // If map already initialized, remove old one
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const initialCenter = [currentLat, currentLng];
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          zoomControl: false, // We render modern floating zoom controls
          attributionControl: false,
        });

        // Add Base Tile Layer (CartoDB Voyager - Google Maps / Instamart look)
        const currentLayerConfig = tileLayers[mapStyle];
        const tileLayer = L.tileLayer(currentLayerConfig.url, {
          attribution: currentLayerConfig.attribution,
          subdomains: currentLayerConfig.subdomains || 'abc',
          maxZoom: currentLayerConfig.maxZoom || 19,
        }).addTo(map);

        map._buslyTileLayer = tileLayer;

        // Map Click Handler (for adding stops or picking coords)
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
        console.error('Failed to initialize Leaflet map:', err);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Switch Tile Style (Voyager / OSM / Dark)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (map._buslyTileLayer) {
      map.removeLayer(map._buslyTileLayer);
    }

    const cfg = tileLayers[mapStyle];
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: cfg.maxZoom || 19,
    }).addTo(map);

    map._buslyTileLayer = newLayer;
  }, [mapStyle, mapReady]);

  // 3. Render Route Polyline & Sequenced Stops
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear previous stop markers & polyline
    stopMarkersRef.current.forEach((m) => map.removeLayer(m));
    stopMarkersRef.current = [];

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (sortedStops.length === 0) return;

    const latLngs = sortedStops.map((s) => [s.latitude, s.longitude]);

    // Outer glow polyline (Rapido / Instamart style corridor)
    const glowLine = L.polyline(latLngs, {
      color: '#F5B800',
      weight: 9,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Inner sharp polyline
    const innerLine = L.polyline(latLngs, {
      color: '#D97706',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '8, 6',
    });

    const routeFeatureGroup = L.featureGroup([glowLine, innerLine]).addTo(map);
    routePolylineRef.current = routeFeatureGroup;

    // Render Sequenced Stops Markers
    sortedStops.forEach((stop, index) => {
      const isOrigin = index === 0;
      const isDestination = index === sortedStops.length - 1;

      // Custom HTML Pin in Instamart / Rapido numbered style
      const pinHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <!-- Floating Stop Label -->
          <div class="mb-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-white font-bold text-[10px] shadow-md border border-slate-700 whitespace-nowrap backdrop-blur-sm pointer-events-none transition-all group-hover:scale-110">
            ${stop.name}
          </div>
          
          <!-- Circular Waypoint Pin -->
          <div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform group-hover:scale-125 ${
            isOrigin
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40'
              : isDestination
              ? 'bg-red-600 text-white ring-4 ring-red-400/40'
              : 'bg-white text-slate-800 border-2 border-amber-500 ring-2 ring-black/10'
          }">
            ${isOrigin ? 'S' : isDestination ? 'D' : stop.sequence}
          </div>

          <!-- Needle pointer -->
          <div class="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: pinHtml,
        className: 'leaflet-div-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(map);

      // Popup on click
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #1e293b; margin-bottom: 2px;">
            Stop ${stop.sequence}: ${stop.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            ETA: <span style="font-weight: 700; color: #0284c7;">${stop.estimatedArrival || '--'}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">
            GPS: ${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}
          </div>
        </div>
      `);

      stopMarkersRef.current.push(marker);
    });

    // Fit map bounds to show the entire route smoothly
    if (latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 16 });
    }
  }, [stops, mapReady]);

  // 4. Render & Update Live Moving Bus Marker (with Radar Waves)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    const busNumber = bus?.busNumber || 'Fleet Vehicle';
    const speedDisplay = Math.round(speed);

    // Iconic Rapido / Instamart vehicle pin with concentric radar pulse
    const busHtml = `
      <div class="relative flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
        <!-- Radar concentric pulse waves -->
        <div class="radar-ring"></div>
        <div class="radar-ring radar-ring-2"></div>

        <!-- Top Vehicle Badge -->
        <div class="mb-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-lg border border-amber-300 flex items-center space-x-1 whitespace-nowrap z-20">
          <span>${busNumber}</span>
          <span class="w-1 h-1 rounded-full bg-slate-900"></span>
          <span>${speedDisplay} km/h</span>
        </div>

        <!-- Animated Vehicle Center Icon -->
        <div class="w-11 h-11 rounded-2xl bg-slate-900 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-amber-400 z-10 transition-transform duration-500" style="transform: rotate(${heading}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
      // Smoothly update position
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
          <span style="color: #64748b;">Route: <strong>${route?.name || 'Assigned Route'}</strong></span><br/>
          <span style="color: #10b981; font-weight: 700;">● Active GPS Telemetry</span>
        </div>
      `);
    }
  }, [currentLat, currentLng, speed, heading, bus, mapReady]);

  // Center on Vehicle
  const handleCenterBus = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([currentLat, currentLng], 16, { animate: true, duration: 1.2 });
  };

  // Fit Entire Route Corridor
  const handleFitRoute = () => {
    if (!mapInstanceRef.current || sortedStops.length === 0) return;
    const L = window.L;
    const allPts = [
      ...sortedStops.map((s) => [s.latitude, s.longitude]),
      [currentLat, currentLng],
    ];
    mapInstanceRef.current.fitBounds(L.latLngBounds(allPts), { padding: [60, 60], maxZoom: 16 });
  };

  // Detect and Center on User's Current GPS Location
  const handleLocateMe = async () => {
    setIsLocatingUser(true);
    try {
      const gps = await getCurrentGpsLocation();
      setUserLocation(gps);

      if (mapInstanceRef.current && window.L) {
        const L = window.L;
        const userHtml = `
          <div class="user-location-pin" style="transform: translate(-50%, -50%);"></div>
        `;
        const userIcon = L.divIcon({
          html: userHtml,
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

  return (
    <div className={`relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${height} ${className}`}>
      {/* Top Floating Rapido / Instamart Style Navigation Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        {/* Route / Vehicle Branding Pill */}
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl p-2 sm:px-4 sm:py-2.5 shadow-xl flex items-center space-x-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 text-xs sm:text-sm">
                {bus?.busNumber || 'School Transport'}
              </span>
              <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                LIVE
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              {route?.name || 'Active Corridor'} • <span className="font-bold text-gray-800">{speed.toFixed(0)} km/h</span>
            </p>
          </div>
        </div>

        {/* Quick Map Controls (Center Bus, Fit Route, Locate Me, Layers) */}
        {showControls && (
          <div className="flex items-center space-x-2 pointer-events-auto">
            {/* Center Bus Button */}
            <button
              onClick={handleCenterBus}
              title="Center on Vehicle"
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
            >
              <Crosshair className="w-5 h-5" />
            </button>

            {/* Fit Full Route */}
            <button
              onClick={handleFitRoute}
              title="Fit Full Route"
              className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Locate My Current GPS Position */}
            <button
              onClick={handleLocateMe}
              title="Locate Me (Current GPS)"
              disabled={isLocatingUser}
              className={`w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isLocatingUser ? 'text-blue-600 animate-spin' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <LocateFixed className="w-5 h-5" />
            </button>

            {/* Layer Switcher (Voyager / OSM / Dark) */}
            <div className="relative group">
              <button
                onClick={() => {
                  setMapStyle((prev) => (prev === 'voyager' ? 'osm' : prev === 'osm' ? 'dark' : 'voyager'));
                }}
                title="Switch Map Theme (Google/Instamart / Street / Dark)"
                className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Real Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[340px] z-0" />

      {/* Bottom Floating Rapido / Instamart Delivery Style Trip Sheet */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-2xl p-3.5 space-y-3 pointer-events-auto transition-all">
          {/* Header Row: Next Stop ETA & Expand Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {nextStop ? `Next Stop: ${nextStop.name}` : 'Route Completed'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {nextStop?.estimatedArrival || 'On Time'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  {sortedStops.length} stops in sequence • Telemetry Updated: {lastUpdated}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCardExpanded(!isCardExpanded)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              {isCardExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          {/* Expanded Trip Progress Details */}
          {isCardExpanded && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* Trip Progress Bar (Rapido style) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                  <span>{sortedStops[0]?.name || 'Origin'}</span>
                  <span className="text-amber-600 font-bold">In Transit (~{speed.toFixed(0)} km/h)</span>
                  <span>{sortedStops[sortedStops.length - 1]?.name || 'School'}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-700 w-3/5" />
                </div>
              </div>

              {/* Driver & Bus Info Strip */}
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
                  {activeTrip && (
                    <Badge variant="warning" size="sm" className="font-bold">
                      {activeTrip.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
