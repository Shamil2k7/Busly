import React from 'react';
import {
  Home,
  Navigation,
  CreditCard,
  Bell,
  Users,
  PlusCircle,
  Bus,
  Gauge,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function BottomNav({ activeTab, onSelectTab, onOpenAddStudent, onOpenSos }) {
  const { user } = useMobileAuth();
  const role = user?.role || 'PARENT';

  if (role === 'PARENT') {
    return (
      <nav className="w-full bg-white border-t border-gray-200 px-3 pt-1 safe-bottom shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'home' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('track')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'track' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Navigation className={`w-5 h-5 ${activeTab === 'track' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Tracking</span>
          </button>

          <button
            onClick={() => onSelectTab('fees')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'fees' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${activeTab === 'fees' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Fees</span>
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'alerts' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'alerts' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Alerts</span>
          </button>
        </div>
      </nav>
    );
  }

  if (role === 'TEACHER') {
    return (
      <nav className="w-full bg-white border-t border-gray-200 px-3 pt-1 safe-bottom shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'home' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'students' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'students' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Students</span>
          </button>

          {/* Center Highlighted Add Student Button */}
          <button
            onClick={onOpenAddStudent}
            className="flex flex-col items-center -mt-4 active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-full bg-busly-primary text-slate-900 flex items-center justify-center shadow-md border-2 border-white">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-gray-900 mt-0.5">Enroll</span>
          </button>

          <button
            onClick={() => onSelectTab('fleet')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'fleet' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bus className={`w-5 h-5 ${activeTab === 'fleet' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Fleet</span>
          </button>
        </div>
      </nav>
    );
  }

  if (role === 'DRIVER') {
    return (
      <nav className="w-full bg-white border-t border-gray-200 px-3 pt-1 safe-bottom shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => onSelectTab('cockpit')}
            className={`flex flex-col items-center py-1.5 px-4 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'cockpit' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Gauge className={`w-5 h-5 ${activeTab === 'cockpit' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Cockpit</span>
          </button>

          <button
            onClick={() => onSelectTab('manifest')}
            className={`flex flex-col items-center py-1.5 px-4 rounded-lg transition-colors active:scale-95 ${
              activeTab === 'manifest' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'manifest' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 font-medium">Students</span>
          </button>

          {/* Big Emergency SOS Tab */}
          <button
            onClick={onOpenSos}
            className="flex flex-col items-center py-1.5 px-4 text-red-600 hover:text-red-700 transition active:scale-95"
          >
            <div className="relative">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                !
              </span>
            </div>
            <span className="text-[10px] mt-0.5 font-bold">SOS Emergency</span>
          </button>
        </div>
      </nav>
    );
  }

  return null;
}
