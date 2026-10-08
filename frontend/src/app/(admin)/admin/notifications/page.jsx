'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Megaphone, CheckCircle2, Clock } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('ALL');
  const [sending, setSending] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    try {
      const res = await api.post('/api/notifications/announcement', {
        title,
        message,
        recipientRole,
      });
      if (res.success) {
        showToast('Announcement broadcasted in real time!', 'success');
        setTitle('');
        setMessage('');
        loadNotifications();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Notification Broadcast Center" subtitle="School Announcements & Transport Alerts" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcement Composer */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader
                title="Send School Announcement"
                subtitle="Broadcast an immediate alert to mobile apps"
              />
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <Input
                    label="Announcement Subject"
                    placeholder="e.g. Weather Advisory / Early Departure"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Select
                    label="Audience Scope"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Users (Everyone)' },
                      { value: 'PARENT', label: 'Parents Only' },
                      { value: 'TEACHER', label: 'Teachers Only' },
                      { value: 'DRIVER', label: 'Drivers Only' },
                    ]}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Message Content
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your official school announcement..."
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-busly-primary"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={sending}
                  >
                    <Send className="w-4 h-4 mr-1.5" /> Broadcast Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recent Notification Log"
                subtitle="All dispatched system notifications and operational alerts"
              />
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      No notifications logged.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 flex items-start space-x-3 hover:bg-gray-50/60">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-800 flex-shrink-0 mt-0.5">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                              {n.title}
                            </h4>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="default" size="sm">
                              {n.type}
                            </Badge>
                            <span className="text-[10px] text-gray-400">
                              Audience: {n.recipientRole || 'Targeted'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
