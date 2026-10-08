'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  LocateFixed,
  Search,
  CheckCircle2,
  Navigation,
  Loader2,
  Crosshair,
  Compass
} from 'lucide-react';
import { loadLeaflet } from '@/lib/leaflet-loader';
import { getCurrentGpsLocation, reverseGeocode, searchAddress } from '@/lib/geo-utils';
import Button from '../ui/Button';

/**
 * Interactive Google / Instamart style Location Picker Map
 * Allows user to:
 * 1. Click "Use My Current Location" (HTML5 GPS with reverse geocoding)
 * 2. Search any landmark or address with autocomplete
 * 3. Click anywhere on the map or drag the pin to set exact coordinates
 */
export default function LocationPickerMap({
  initialLat = 11.2850,
  initialLng = 76.2350,
  existingStops = [],
  onLocationSelect,
  className = '',
  height = 'h-64 sm:h-72',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickedMarkerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Map
  useEffect(() => {
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

        // CartoDB Voyager Tiles (Clean Google / Instamart style)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Render Existing Stops as small reference markers
        existingStops.forEach((s) => {
          const refHtml = `
            <div class="w-5 h-5 rounded-full bg-slate-700 border-2 border-white text-white flex items-center justify-center font-bold text-[9px] shadow opacity-70">
              ${s.sequence}
            </div>
          `;
          const refIcon = L.divIcon({
            html: refHtml,
            className: 'leaflet-div-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          L.marker([s.latitude, s.longitude], { icon: refIcon, interactive: false }).addTo(map);
        });

        // Draggable Picked Pin
        const pinHtml = `
          <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing" style="transform: translate(-50%, -100%);">
            <div class="w-8 h-8 rounded-full bg-amber-400 border-2 border-slate-900 shadow-xl flex items-center justify-center text-slate-900 font-extrabold ring-4 ring-amber-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1 shadow-sm"></div>
          </div>
        `;

        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'leaflet-div-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const pickedMarker = L.marker([currentLat, currentLng], {
          icon: pinIcon,
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        pickedMarker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          handleLocationUpdate(lat, lng, true);
        });

        // Click anywhere to place/move the pin
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          pickedMarker.setLatLng([lat, lng]);
          handleLocationUpdate(lat, lng, true);
        });

        pickedMarkerRef.current = pickedMarker;
        mapInstanceRef.current = map;
      })
      .catch((err) => console.error('Picker map error:', err));

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleLocationUpdate = async (lat, lng, shouldGeocode = true) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setCurrentLat(roundedLat);
    setCurrentLng(roundedLng);

    if (shouldGeocode) {
      setLocationStatus('Finding address...');
      const geocode = await reverseGeocode(roundedLat, roundedLng);
      setLocationStatus(`Selected: ${geocode.shortName}`);
      if (onLocationSelect) {
        onLocationSelect({
          latitude: roundedLat,
          longitude: roundedLng,
          suggestedName: geocode.shortName,
          fullAddress: geocode.displayName,
        });
      }
    } else {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: roundedLat,
          longitude: roundedLng,
        });
      }
    }
  };

  // 1. "Use My Current Location" GPS action
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationStatus('Accessing device GPS...');
    try {
      const gps = await getCurrentGpsLocation();
      setLocationStatus(`GPS Locked: ±${gps.accuracy}m accuracy`);

      if (mapInstanceRef.current && pickedMarkerRef.current) {
        pickedMarkerRef.current.setLatLng([gps.latitude, gps.longitude]);
        mapInstanceRef.current.flyTo([gps.latitude, gps.longitude], 16, { animate: true });
      }

      const geocode = await reverseGeocode(gps.latitude, gps.longitude);
      setLocationStatus(`✓ Detected: ${geocode.shortName}`);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: gps.latitude,
          longitude: gps.longitude,
          suggestedName: geocode.shortName,
          fullAddress: geocode.displayName,
          accuracy: gps.accuracy,
        });
      }
    } catch (err) {
      setLocationStatus(err.message || 'GPS location failed');
    } finally {
      setIsLocating(false);
    }
  };

  // 2. Search Landmark / Address
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSearchResults([]);
    setSearchQuery(result.displayName.split(',')[0]);

    if (mapInstanceRef.current && pickedMarkerRef.current) {
      pickedMarkerRef.current.setLatLng([result.latitude, result.longitude]);
      mapInstanceRef.current.flyTo([result.latitude, result.longitude], 16, { animate: true });
    }

    handleLocationUpdate(result.latitude, result.longitude, false);
    if (onLocationSelect) {
      onLocationSelect({
        latitude: result.latitude,
        longitude: result.longitude,
        suggestedName: result.displayName.split(',')[0],
        fullAddress: result.displayName,
      });
    }
    setLocationStatus(`Selected: ${result.displayName.split(',')[0]}`);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Top Action Bar: Use Current Location Button & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Prominent "Use My Current Location" button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex-1 flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow transition-all active:scale-98"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          ) : (
            <LocateFixed className="w-4 h-4 text-slate-900" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : '📍 Use My Current Location'}</span>
        </button>

        {/* Address Search Input */}
        <div className="relative flex-1">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search landmark or road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-2.5 top-3" />
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(r)}
                  className="w-full text-left px-3 py-2 text-[11px] text-gray-700 hover:bg-amber-50 border-b border-gray-100 last:border-0 flex items-start space-x-1.5"
                >
                  <MapPin className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map Picker Canvas */}
      <div className={`relative w-full rounded-2xl overflow-hidden border border-gray-300 shadow-inner ${height}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Overlay Instruction Hint */}
        <div className="absolute bottom-2 left-2 right-2 z-[400] pointer-events-none flex items-center justify-between">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-medium shadow pointer-events-auto">
            {locationStatus || 'Click map or drag pin to adjust location'}
          </div>
          <div className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-mono shadow pointer-events-auto">
            {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}
