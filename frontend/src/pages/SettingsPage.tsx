import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Portal Settings & Preferences"
        subtitle="Configure order sound notifications, printer integrations, auto-accept preferences, and security."
        breadcrumbs={['Partner Portal']}
        action={<Button variant="primary">Save Preferences</Button>}
      />

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Order Notification Sound & Auto-Accept</CardTitle>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Toggle checked={true} onChange={() => {}} label="Loud Audio Alert on New Incoming Orders" sublabel="Plays continuous chime until accepted" />
          <Toggle checked={false} onChange={() => {}} label="Auto-Accept Orders When Online" sublabel="Automatically confirms new incoming orders into prep queue" />
          <Toggle checked={true} onChange={() => {}} label="Auto KOT Thermal Printing" sublabel="Sends order slip to Bluetooth/Network kitchen printer" />
        </CardContent>
      </Card>
    </div>
  );
};
