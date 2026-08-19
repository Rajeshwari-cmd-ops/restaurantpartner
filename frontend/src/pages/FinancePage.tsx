import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockFinance } from '../mock/finance';
import { formatINR } from '../utils/formatters';

export const FinancePage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Finance & Payouts"
        subtitle="Track revenue settlements, platform commissions, bank payouts, and tax invoices."
        breadcrumbs={['Partner Portal']}
        action={<Button variant="primary">Download Tax Invoice (GST)</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card padding="md">
          <CardHeader>
            <CardTitle style={{ fontSize: '14px', color: '#6b7280' }}>Pending Bank Payout</CardTitle>
            <h2 style={{ fontSize: '28px', color: '#0D47A1', marginTop: '8px' }}>{formatINR(mockFinance.pendingPayout)}</h2>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Scheduled Payout Date: {mockFinance.payoutDate}</p>
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle style={{ fontSize: '14px', color: '#6b7280' }}>This Week's Gross Sales</CardTitle>
            <h2 style={{ fontSize: '28px', color: '#1f2937', marginTop: '8px' }}>{formatINR(mockFinance.weeklyRevenue)}</h2>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12px', color: '#22C55E' }}>+18.4% compared to previous week</p>
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle style={{ fontSize: '14px', color: '#6b7280' }}>Platform Commission Rate</CardTitle>
            <h2 style={{ fontSize: '28px', color: '#1f2937', marginTop: '8px' }}>{mockFinance.commissionRate}%</h2>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Includes payment gateway fees & delivery support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
