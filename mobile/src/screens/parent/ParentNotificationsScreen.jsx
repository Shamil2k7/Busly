import React, { useEffect, useState } from 'react';
import { Bus, CheckCircle2, MapPin, Bell, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { mobileApi } from '../../config/api';

export default function ParentNotificationsScreen() {
  const { notifications, loadNotifications, showToast } = useMobileAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
    showToast('Notifications refreshed from server', 'info');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EMERGENCY':
      case 'SOS':
        return { icon: AlertTriangle, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'STUDENT_PICKED_UP':
      case 'STUDENT_DROPPED_OFF':
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_RECEIVED':
        return { icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'BUS_APPROACHING':
      case 'STOP_ARRIVAL':
        return { icon: MapPin, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'BUS_STARTED':
      default:
        return { icon: Bus, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-3 overflow-y-auto no-scrollbar font-sans">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Trip & Transport Activity Feed ({notifications.length})
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 px-2 py-0.5 rounded-lg border border-gray-200 bg-white shadow-2xs"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.map((item) => {
          const { icon: IconComponent, color } = getNotificationIcon(item.type);
          const timeString = item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : item.time || 'Recent';

          return (
            <div
              key={item.id}
              className={`bg-white border border-gray-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs ${
                item.isRead === false ? 'ring-1 ring-amber-300' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${color}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">{timeString}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
