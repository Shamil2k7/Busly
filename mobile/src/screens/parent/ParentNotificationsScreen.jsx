import React from 'react';
import { Bus, CheckCircle2, MapPin } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function ParentNotificationsScreen() {
  const { user } = useMobileAuth();

  const notifications = [
    {
      id: 'notif-1',
      title: 'Bus 01 Trip Started',
      message: 'Bus 01 has departed from school on the morning pickup route.',
      time: '07:02 AM',
      type: 'BUS_STARTED',
      icon: Bus,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'notif-2',
      title: 'Approaching Stop: Nilambur Junction',
      message: 'Bus 01 is 2 stops away. Please have Rahul ready at the boarding point.',
      time: '07:28 AM',
      type: 'BUS_APPROACHING',
      icon: MapPin,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: 'notif-3',
      title: 'Student Boarded: Rahul Kumar',
      message: 'Rahul has safely boarded Bus 01 at Nilambur Junction.',
      time: '07:36 AM',
      type: 'STUDENT_PICKED_UP',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'notif-4',
      title: 'Fee Payment Received',
      message: 'Payment of ₹1,500 for Anu Kumar (Junior Transport Plan) was settled successfully.',
      time: 'Yesterday',
      type: 'PAYMENT_SUCCESS',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-3 overflow-y-auto no-scrollbar font-sans">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Trip & Transport Activity Feed
        </h3>
        <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          Real-time Feed
        </span>
      </div>

      <div className="space-y-2.5">
        {notifications.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">{item.time}</span>
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
