import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockNotifications } from '../mock/notifications';

export const NotificationsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Notifications & Alerts Center"
        subtitle="Stay updated on new order alerts, inventory threshold warnings, and system updates."
        breadcrumbs={['Partner Portal']}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockNotifications.map((n) => (
          <Card key={n.id} padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '15px' }}>{n.title}</strong>
                  <Badge variant={n.type === 'order' ? 'primary' : n.type === 'inventory' ? 'warning' : 'info'} size="sm">
                    {n.type.toUpperCase()}
                  </Badge>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{n.message}</p>
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{n.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
