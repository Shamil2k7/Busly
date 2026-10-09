'use client';

import React, { useState, useEffect } from 'react';
import {
  Route as RouteIcon,
  Plus,
  MapPin,
  Bus,
  Clock,
  Trash2,
  Edit,
  LocateFixed,
  Navigation,
  Compass,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import LiveBusMap from '@/components/maps/LiveBusMap';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';
import { getCurrentGpsLocation, reverseGeocode } from '@/lib/geo-utils';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create Route Modal
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeName, setRouteName] = useState('');

  // Edit Route Modal
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [editRouteForm, setEditRouteForm] = useState({
    name: '',
    busId: '',
    status: 'ACTIVE',
  });
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);

  // Add Stop Modal
  const [targetRouteForStop, setTargetRouteForStop] = useState(null);
  const [isLocatingForQuickAdd, setIsLocatingForQuickAdd] = useState(false);
  const [stopForm, setStopForm] = useState({
    name: '',
    latitude: 11.2850,
    longitude: 76.2350,
    sequence: 1,
    estimatedArrival: '07:45 AM',
    detectedAddress: '',
  });

  // Edit Stop Modal
  const [editingStop, setEditingStop] = useState(null);
  const [editStopForm, setEditStopForm] = useState({
    name: '',
    latitude: 11.2850,
    longitude: 76.2350,
    sequence: 1,
    estimatedArrival: '',
    detectedAddress: '',
  });
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);

  const loadRoutes = async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        api.get('/api/routes'),
        api.get('/api/buses').catch(() => ({ success: false })),
      ]);
      if (rRes.success && rRes.data) {
        setRoutes(rRes.data);
        if (!selectedRouteId && rRes.data.length > 0) {
          setSelectedRouteId(rRes.data[0].id);
        }
      }
      if (bRes.success && bRes.data) {
        setBuses(bRes.data);
      }
    } catch (err) {
      showToast('Failed to load routes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/routes', { name: routeName });
      if (res.success) {
        showToast('Route created successfully', 'success');
        setIsRouteModalOpen(false);
        setRouteName('');
        await loadRoutes();
        if (res.data?.id) setSelectedRouteId(res.data.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open Add Stop Modal with default or detected values
  const handleOpenAddStopModal = (route, prefillGps = null) => {
    setTargetRouteForStop(route);
    const nextSeq = (route.stops?.length || 0) + 1;
    const defaultLat = prefillGps?.latitude || route.stops?.[route.stops.length - 1]?.latitude || 11.2850;
    const defaultLng = prefillGps?.longitude || route.stops?.[route.stops.length - 1]?.longitude || 76.2350;

    setStopForm({
      name: prefillGps?.suggestedName || '',
      latitude: defaultLat,
      longitude: defaultLng,
      sequence: nextSeq,
      estimatedArrival: `0${Math.min(7 + Math.floor(nextSeq / 2), 9)}:${(nextSeq % 2) * 30 || '00'} AM`,
      detectedAddress: prefillGps?.fullAddress || '',
    });
  };

  // Quick "Add Stop from Current Location" Action
  const handleQuickAddFromCurrentLocation = async (route) => {
    setIsLocatingForQuickAdd(true);
    try {
      showToast('Detecting your GPS location...', 'info');
      const gps = await getCurrentGpsLocation();
      const geocode = await reverseGeocode(gps.latitude, gps.longitude);

      showToast(`GPS captured: ${geocode.shortName} (±${gps.accuracy}m)`, 'success');
      handleOpenAddStopModal(route, {
        latitude: gps.latitude,
        longitude: gps.longitude,
        suggestedName: geocode.shortName,
        fullAddress: geocode.displayName,
      });
    } catch (err) {
      showToast(err.message || 'Could not acquire GPS location', 'error');
      // Still open modal so they can pick on map
      handleOpenAddStopModal(route);
    } finally {
      setIsLocatingForQuickAdd(false);
    }
  };

  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!targetRouteForStop) return;
    try {
      const res = await api.post(`/api/routes/${targetRouteForStop.id}/stops`, {
        name: stopForm.name,
        latitude: parseFloat(stopForm.latitude),
        longitude: parseFloat(stopForm.longitude),
        sequence: parseInt(stopForm.sequence, 10),
        estimatedArrival: stopForm.estimatedArrival,
      });

      if (res.success) {
        showToast(`Stop "${stopForm.name}" added to ${targetRouteForStop.name}`, 'success');
        setTargetRouteForStop(null);
        await loadRoutes();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteStop = async (stopId, stopName) => {
    if (!confirm(`Are you sure you want to delete stop "${stopName}"?`)) return;
    try {
      const res = await api.delete(`/api/routes/stops/${stopId}`);
      if (res.success) {
        showToast(`Stop "${stopName}" removed`, 'success');
        await loadRoutes();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenEditRoute = (route) => {
    if (!route) return;
    setEditRouteForm({
      name: route.name || '',
      busId: route.busId || route.bus?.id || '',
      status: route.status || 'ACTIVE',
    });
    setIsEditRouteModalOpen(true);
  };

  const handleUpdateRoute = async (e) => {
    e.preventDefault();
    if (!activeRoute) return;
    setIsSubmittingRoute(true);
    try {
      const res = await api.put(`/api/routes/${activeRoute.id}`, {
        name: editRouteForm.name,
        busId: editRouteForm.busId || null,
        status: editRouteForm.status,
      });
      if (res.success) {
        showToast('Route corridor updated successfully', 'success');
        setIsEditRouteModalOpen(false);
        await loadRoutes();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update route', 'error');
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!activeRoute) return;
    if (!confirm(`Are you sure you want to delete route "${activeRoute.name}"? This will delete all its stops.`)) return;
    try {
      const res = await api.delete(`/api/routes/${activeRoute.id}`);
      if (res.success) {
        showToast(`Route "${activeRoute.name}" deleted`, 'success');
        setIsEditRouteModalOpen(false);
        const remaining = routes.filter((r) => r.id !== activeRoute.id);
        setSelectedRouteId(remaining[0]?.id || null);
        await loadRoutes();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete route', 'error');
    }
  };

  const handleOpenEditStopModal = (stop) => {
    setEditingStop(stop);
    setEditStopForm({
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      sequence: stop.sequence,
      estimatedArrival: stop.estimatedArrival || '',
      detectedAddress: '',
    });
  };

  const handleUpdateStopSubmit = async (e) => {
    e.preventDefault();
    if (!editingStop) return;
    setIsSubmittingStop(true);
    try {
      const res = await api.put(`/api/routes/stops/${editingStop.id}`, {
        name: editStopForm.name,
        latitude: parseFloat(editStopForm.latitude),
        longitude: parseFloat(editStopForm.longitude),
        sequence: parseInt(editStopForm.sequence, 10),
        estimatedArrival: editStopForm.estimatedArrival || null,
      });
      if (res.success) {
        showToast(`Stop "${editStopForm.name}" updated successfully`, 'success');
        setEditingStop(null);
        await loadRoutes();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update stop', 'error');
    } finally {
      setIsSubmittingStop(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav
        title="Routes & Corridor Sequencer"
        subtitle="Google Maps / Rapido Style Route View with GPS Stop Registration"
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Top Header & Route Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <RouteIcon className="w-5 h-5 text-amber-500" />
              <span>Transportation Corridors</span>
            </h2>
            <p className="text-xs text-gray-500">
              Interactive Google Maps / Rapido route visualization & stop management
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRouteModalOpen(true)}
            className="font-bold shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create New Route
          </Button>
        </div>

        {/* Route Selector Pills */}
        {routes.length > 0 && (
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1">
            {routes.map((r) => {
              const isSelected = r.id === activeRoute?.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all whitespace-nowrap shadow-sm ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-amber-400'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-ping' : 'bg-gray-400'}`} />
                  <span>{r.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({r.stops?.length || 0} stops)</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Live Google Maps / Rapido / Instamart Route Corridor View */}
        {activeRoute && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {activeRoute.name} Live Corridor
                </span>
                <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                  Rapido / Instamart View
                </Badge>
                <button
                  type="button"
                  onClick={() => handleOpenEditRoute(activeRoute)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-gray-200 shadow-sm transition-all"
                  title="Edit Route Corridor"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-500" />
                  <span>Edit Route</span>
                </button>
              </div>

              {/* Quick Add Stop from GPS Button */}
              <button
                type="button"
                onClick={() => handleQuickAddFromCurrentLocation(activeRoute)}
                disabled={isLocatingForQuickAdd}
                className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocatingForQuickAdd ? 'animate-spin' : ''}`} />
                <span>{isLocatingForQuickAdd ? 'Detecting GPS...' : '+ Add Stop from Current Location'}</span>
              </button>
            </div>

            {/* Interactive Real Map Component */}
            <LiveBusMap
              bus={activeRoute.bus}
              route={activeRoute}
              stops={activeRoute.stops || []}
              height="h-[360px] sm:h-[500px]"
              onAddStopAtLocation={(loc) => {
                handleOpenAddStopModal(activeRoute, {
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  suggestedName: loc.suggestedName,
                });
              }}
            />
          </div>
        )}

        {/* Sequenced Route Stops Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Route Stops List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
                    <span>Sequenced Waypoints & Stops</span>
                    <Badge variant="info" size="sm">
                      {activeRoute?.stops?.length || 0} stops
                    </Badge>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Stops are traversed in sequential order with estimated arrival times
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleQuickAddFromCurrentLocation(activeRoute)}
                    className="flex items-center space-x-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Current Location</span>
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAddStopModal(activeRoute)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Stop
                  </Button>
                </div>
              </div>

              {/* Stops Timeline */}
              {activeRoute?.stops?.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-sm font-semibold">No stops configured for this route yet.</p>
                  <button
                    onClick={() => handleQuickAddFromCurrentLocation(activeRoute)}
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    + Click here to add your current location as the first stop
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeRoute?.stops?.map((stop, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === activeRoute.stops.length - 1;

                    return (
                      <div
                        key={stop.id}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-gray-200/70 flex items-center justify-between text-xs transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                              isFirst
                                ? 'bg-emerald-600 text-white'
                                : isLast
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {stop.sequence}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-extrabold text-slate-900 text-sm">{stop.name}</p>
                              {isFirst && <Badge variant="success" size="sm">Origin</Badge>}
                              {isLast && <Badge variant="danger" size="sm">Destination</Badge>}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">
                              GPS: {stop.latitude?.toFixed(5)}, {stop.longitude?.toFixed(5)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-slate-800 font-mono font-bold text-xs shadow-sm">
                              {stop.estimatedArrival || '--'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenEditStopModal(stop)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit stop"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(stop.id, stop.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Route Overview & Fleet Card */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                Corridor Information
              </h3>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Assigned Fleet Bus</span>
                  <span className="font-extrabold text-slate-900">
                    {activeRoute?.bus?.busNumber || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Registration</span>
                  <span className="font-mono font-bold text-gray-800">
                    {activeRoute?.bus?.registrationNumber || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Corridor Status</span>
                  <Badge variant="success" size="sm">{activeRoute?.status || 'ACTIVE'}</Badge>
                </div>
                <div className="pt-2 border-t border-amber-200/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-bold bg-white text-slate-800 hover:bg-amber-100/50"
                    onClick={() => handleOpenEditRoute(activeRoute)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1 text-amber-500" /> Edit Corridor Details
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl space-y-1.5 text-xs text-blue-900">
                <p className="font-extrabold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pro Tip: Add Stop Options</span>
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  • Click <strong>&quot;+ Add Stop from Current Location&quot;</strong> to instantly capture your physical GPS coordinates.<br/>
                  • You can also <strong>click anywhere directly on the map</strong> above to drop a new stop pinpoint!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Route Modal */}
      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        title="Create New Route Corridor"
        subtitle="Define a school bus transport corridor"
      >
        <form onSubmit={handleCreateRoute} className="space-y-4">
          <Input
            label="Route Name"
            placeholder="e.g. East Valley Highway Corridor"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Stop Modal with Interactive LocationPickerMap & "Use Current Location" GPS */}
      {targetRouteForStop && (
        <Modal
          isOpen={!!targetRouteForStop}
          onClose={() => setTargetRouteForStop(null)}
          title={`Add Stop to ${targetRouteForStop.name}`}
          subtitle="Use your device GPS or click/search on the interactive map"
        >
          <form onSubmit={handleAddStopSubmit} className="space-y-4">
            {/* Interactive Map Picker with "Use Current Location" Button */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Pinpoint Location (GPS or Map)
              </label>
              <LocationPickerMap
                initialLat={parseFloat(stopForm.latitude)}
                initialLng={parseFloat(stopForm.longitude)}
                existingStops={targetRouteForStop.stops || []}
                onLocationSelect={(loc) => {
                  setStopForm((prev) => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    name: prev.name ? prev.name : loc.suggestedName || prev.name,
                    detectedAddress: loc.fullAddress || '',
                  }));
                }}
              />
            </div>

            {/* Stop Name & ETA */}
            <div className="space-y-3">
              <Input
                label="Stop / Landmark Name"
                placeholder="e.g. Town Hall Junction, Nilambur"
                value={stopForm.name}
                onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                required
              />

              {stopForm.detectedAddress && (
                <p className="text-[11px] text-gray-500 font-mono truncate">
                  📍 {stopForm.detectedAddress}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sequence #"
                  type="number"
                  value={stopForm.sequence}
                  onChange={(e) => setStopForm({ ...stopForm, sequence: e.target.value })}
                  required
                />
                <Input
                  label="Estimated Arrival (ETA)"
                  placeholder="07:45 AM"
                  value={stopForm.estimatedArrival}
                  onChange={(e) => setStopForm({ ...stopForm, estimatedArrival: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-500 text-[11px]">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    value={stopForm.latitude}
                    onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-[11px]">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    value={stopForm.longitude}
                    onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Button variant="outline" onClick={() => setTargetRouteForStop(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="font-bold shadow-md">
                Save & Add Stop
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Route Modal */}
      {isEditRouteModalOpen && activeRoute && (
        <Modal
          isOpen={isEditRouteModalOpen}
          onClose={() => setIsEditRouteModalOpen(false)}
          title={`Edit Route: ${activeRoute.name}`}
          subtitle="Update corridor name, assigned fleet bus, or status"
        >
          <form onSubmit={handleUpdateRoute} className="space-y-4">
            <Input
              label="Route Corridor Name"
              placeholder="e.g. East Valley Highway Corridor"
              value={editRouteForm.name}
              onChange={(e) => setEditRouteForm({ ...editRouteForm, name: e.target.value })}
              required
            />

            <Select
              label="Assigned Bus"
              value={editRouteForm.busId}
              onChange={(e) => setEditRouteForm({ ...editRouteForm, busId: e.target.value })}
            >
              <option value="">Unassigned (No Bus)</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} ({b.registrationNumber}) - Cap: {b.capacity}
                </option>
              ))}
            </Select>

            <Select
              label="Corridor Status"
              value={editRouteForm.status}
              onChange={(e) => setEditRouteForm({ ...editRouteForm, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteRoute}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Route
              </Button>

              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={() => setIsEditRouteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSubmittingRoute}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Stop Modal */}
      {editingStop && (
        <Modal
          isOpen={!!editingStop}
          onClose={() => setEditingStop(null)}
          title={`Edit Stop: ${editingStop.name}`}
          subtitle="Adjust sequence order, GPS coordinates, or estimated arrival"
        >
          <form onSubmit={handleUpdateStopSubmit} className="space-y-4">
            {/* Interactive Map Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Pinpoint Location (Click or Drag on Map)
              </label>
              <LocationPickerMap
                initialLat={parseFloat(editStopForm.latitude) || 11.2850}
                initialLng={parseFloat(editStopForm.longitude) || 76.2350}
                existingStops={activeRoute?.stops || []}
                onLocationSelect={(loc) => {
                  setEditStopForm((prev) => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    name: prev.name ? prev.name : loc.suggestedName || prev.name,
                    detectedAddress: loc.fullAddress || '',
                  }));
                }}
              />
            </div>

            {/* Stop Name & ETA */}
            <div className="space-y-3">
              <Input
                label="Stop / Landmark Name"
                placeholder="e.g. Town Hall Junction, Nilambur"
                value={editStopForm.name}
                onChange={(e) => setEditStopForm({ ...editStopForm, name: e.target.value })}
                required
              />

              {editStopForm.detectedAddress && (
                <p className="text-[11px] text-gray-500 font-mono truncate">
                  📍 {editStopForm.detectedAddress}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sequence #"
                  type="number"
                  value={editStopForm.sequence}
                  onChange={(e) => setEditStopForm({ ...editStopForm, sequence: e.target.value })}
                  required
                />
                <Input
                  label="Estimated Arrival (ETA)"
                  placeholder="07:45 AM"
                  value={editStopForm.estimatedArrival}
                  onChange={(e) => setEditStopForm({ ...editStopForm, estimatedArrival: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-500 text-[11px]">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    value={editStopForm.latitude}
                    onChange={(e) => setEditStopForm({ ...editStopForm, latitude: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-[11px]">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    value={editStopForm.longitude}
                    onChange={(e) => setEditStopForm({ ...editStopForm, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Button variant="outline" onClick={() => setEditingStop(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingStop} className="font-bold shadow-md">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
