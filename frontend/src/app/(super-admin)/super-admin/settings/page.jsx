'use client';

import React, { useState } from 'react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';

export default function SuperAdminSettingsPage() {
  const [platformName, setPlatformName] = useState('BUSLY');
  const [takeRate, setTakeRate] = useState('1.5');
  const [supportEmail, setSupportEmail] = useState('support@busly.test');

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Platform settings saved', 'success');
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Platform Global Configuration" subtitle="SaaS Gateway & System Defaults" />

      <main className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader title="SaaS Gateway Configuration" />
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Platform Brand Name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
              <Input
                label="Transport Fee Take Rate (%)"
                value={takeRate}
                onChange={(e) => setTakeRate(e.target.value)}
              />
              <Input
                label="Support Desk Contact"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />

              <Button type="submit" variant="primary">
                Save Global Config
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
