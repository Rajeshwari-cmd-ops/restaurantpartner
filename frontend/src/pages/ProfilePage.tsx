import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockRestaurant } from '../mock/restaurant';

export const ProfilePage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Restaurant Profile & Outlets"
        subtitle="Manage brand identity, FSSAI license details, manager contact information, and outlet locations."
        breadcrumbs={['Partner Portal']}
        action={<Button variant="primary">Save Changes</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Basic Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <Input label="Restaurant Name" defaultValue={mockRestaurant.name} />
            <Input label="Tagline / Description" defaultValue={mockRestaurant.tagline} />
            <Input label="FSSAI License Number" defaultValue={mockRestaurant.fssaiLicense} />
            <Input label="Primary Phone (+91)" defaultValue={mockRestaurant.phone} />
            <Input label="Official Email" defaultValue={mockRestaurant.email} />
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Active Outlets ({mockRestaurant.outlets.length})</CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockRestaurant.outlets.map((o) => (
              <div key={o.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f8fafc' }}>
                <strong style={{ fontSize: '14px', color: '#0D47A1' }}>{o.name}</strong>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{o.address}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
