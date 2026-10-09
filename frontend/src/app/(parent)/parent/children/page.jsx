'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Bus, MapPin, ArrowLeft, KeyRound, Edit, CheckCircle2 } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Stops Modal State
  const [editingChild, setEditingChild] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPickupStopId, setSelectedPickupStopId] = useState('');
  const [selectedDropStopId, setSelectedDropStopId] = useState('');
  const [savingStops, setSavingStops] = useState(false);

  const loadData = async () => {
    try {
      const [dashRes, routesRes] = await Promise.all([
        api.get('/api/reports/dashboard/parent'),
        api.get('/api/routes').catch(() => ({ success: false })),
      ]);
      if (dashRes.success) {
        setChildren(dashRes.data.children || []);
        setFamilyCode(dashRes.data.familyCode || '');
      }
      if (routesRes.success) {
        setRoutes(routesRes.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load child profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditStops = (child) => {
    setEditingChild(child);
    setSelectedPickupStopId(child.pickupStopId || child.pickupStop?.id || '');
    setSelectedDropStopId(child.dropStopId || child.dropStop?.id || '');
    setIsEditModalOpen(true);
  };

  const handleSaveStops = async (e) => {
    e.preventDefault();
    if (!editingChild) return;
    setSavingStops(true);
    try {
      const res = await api.put(`/api/students/${editingChild.id}/stops`, {
        pickupStopId: selectedPickupStopId || null,
        dropStopId: selectedDropStopId || null,
      });
      if (res.success) {
        showToast(`Pickup & drop stops updated for ${editingChild.name}!`, 'success');
        setIsEditModalOpen(false);
        setEditingChild(null);
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update stops', 'error');
    } finally {
      setSavingStops(false);
    }
  };

  // Flatten all stops from all routes or prioritize child's route
  const allStops = routes.flatMap((r) =>
    (r.stops || []).map((s) => ({
      ...s,
      routeName: r.name,
      busNumber: r.bus?.busNumber,
    }))
  );

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Children Profiles"
        subtitle={`Family Code: ${familyCode}`}
        rightAction={
          <Link href="/parent/home">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        {children.map((child) => (
          <Card key={child.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{child.name}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  Student ID: {child.studentId} • Class {child.class}-{child.division}
                </p>
              </div>
              <Badge variant="primary" size="sm">
                Enrolled
              </Badge>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                <span className="text-gray-500 flex items-center space-x-1.5">
                  <Bus className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Assigned Bus:</span>
                </span>
                <span className="font-bold text-gray-900">
                  {child.bus?.busNumber || 'None'} ({child.bus?.registrationNumber || '--'})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium">Pickup Stop:</span>
                </span>
                <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {child.pickupStop?.name || 'School Gate'}
                  {child.pickupStop?.estimatedArrival && (
                    <span className="font-mono text-[10px] text-emerald-700 ml-1">
                      ({child.pickupStop.estimatedArrival})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">Drop Stop:</span>
                </span>
                <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {child.dropStop?.name || 'School Gate'}
                  {child.dropStop?.estimatedArrival && (
                    <span className="font-mono text-[10px] text-blue-700 ml-1">
                      ({child.dropStop.estimatedArrival})
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenEditStops(child)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-600" />
                  <span>Change Pickup / Drop Stop</span>
                </button>
              </div>
            </div>

            <div className="pt-1 flex space-x-2">
              <Link href="/parent/live-tracking" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Track Assigned Bus
                </Button>
              </Link>
              <Link href="/parent/bus-fees" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Transport Pass Fees
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </main>

      {/* Edit Stops Modal */}
      {editingChild && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingChild(null);
          }}
          title={`Edit Stops: ${editingChild.name}`}
          subtitle="Choose official route waypoints for morning pickup and evening drop"
        >
          <form onSubmit={handleSaveStops} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs space-y-1">
              <p className="font-bold text-amber-900">
                Child: <span className="font-normal">{editingChild.name} (Class {editingChild.class}-{editingChild.division})</span>
              </p>
              <p className="font-bold text-amber-900">
                Assigned Bus: <span className="font-normal">{editingChild.bus?.busNumber || 'Fleet Bus'} ({editingChild.bus?.registrationNumber || '--'})</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Morning Pickup Stop
              </label>
              <Select
                value={selectedPickupStopId}
                onChange={(e) => setSelectedPickupStopId(e.target.value)}
              >
                <option value="">Default (School Gate)</option>
                {routes.map((route) => (
                  <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                    {(route.stops || []).map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Evening Drop-off Stop
              </label>
              <Select
                value={selectedDropStopId}
                onChange={(e) => setSelectedDropStopId(e.target.value)}
              >
                <option value="">Default (School Gate)</option>
                {routes.map((route) => (
                  <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                    {(route.stops || []).map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingChild(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingStops} className="font-bold shadow-md">
                Save Stops
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
