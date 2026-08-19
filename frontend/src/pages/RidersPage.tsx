import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  PhoneCall,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { useOrders } from '../context/OrderContext';
import type { SharedRider as RiderProfile } from '../types';

// Design Tokens (Calm Enterprise SaaS Palette)
const T = {
  brand: '#FF7A30',
  brandSoft: '#FFF4ED',
  grad: '#FF7A30',
  glow: '0 4px 14px rgba(255, 122, 48, 0.22)',

  green: '#10B981',
  greenBg: '#ECFDF5',
  greenBorder: '#A7F3D0',

  amber: '#F59E0B',
  amberBg: '#FFFBEB',
  amberBorder: '#FDE68A',

  red: '#EF4444',
  redBg: '#FEF2F2',
  redBorder: '#FCA5A5',

  blue: '#3B82F6',
  blueBg: '#EFF6FF',
  blueBorder: '#BFDBFE',

  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  card: '#FFFFFF',
  subtle: '#F8FAFC',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  light: '#94A3B8',
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',

  shadowCard: '0 2px 8px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02)',
  shadowHover: '0 8px 20px rgba(15, 23, 42, 0.06)',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: T.card,
  border: `1px solid ${T.line}`,
  borderRadius: 28,
  boxShadow: T.shadowCard,
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  ...extra,
});

// (RiderProfile type is imported as an alias for SharedRider from ../types)

// (Unused mock initialRiders removed in favor of WorkflowContext)

export const RidersPage: React.FC = () => {
  const navigate = useNavigate();
  const { riders, updateRiderStatus } = useOrders();
  const [selectedRider, setSelectedRider] = useState<RiderProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleStatusChange = (riderId: string, newStatus: RiderProfile['liveStatus']) => {
    updateRiderStatus(riderId, newStatus);
  };

  let filteredRiders = riders;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredRiders = filteredRiders.filter(
      r => r.name.toLowerCase().includes(q) || r.riderCode.toLowerCase().includes(q) || r.phone.includes(q)
    );
  }
  if (statusFilter !== 'all') {
    filteredRiders = filteredRiders.filter(r => r.liveStatus === statusFilter);
  }

  const renderStatusBadge = (status: RiderProfile['liveStatus']) => {
    switch (status) {
      case 'available':
        return <span style={{ fontSize: 10.5, fontWeight: 800, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: '2px 8px', borderRadius: 999 }}>● Available</span>;
      case 'picking_up':
        return <span style={{ fontSize: 10.5, fontWeight: 800, color: T.amber, background: T.amberBg, border: `1px solid ${T.amberBorder}`, padding: '2px 8px', borderRadius: 999 }}>● Picking Up</span>;
      case 'on_delivery':
        return <span style={{ fontSize: 10.5, fontWeight: 800, color: T.blue, background: T.blueBg, border: `1px solid ${T.blueBorder}`, padding: '2px 8px', borderRadius: 999 }}>● On Delivery</span>;
      case 'on_break':
        return <span style={{ fontSize: 10.5, fontWeight: 800, color: T.purple, background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, padding: '2px 8px', borderRadius: 999 }}>☕ On Break</span>;
        return <span style={{ fontSize: 10.5, fontWeight: 800, color: T.purple, background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, padding: '2px 8px', borderRadius: 9999 }}>☕ On Break</span>;
      case 'off_duty':
        return <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, background: T.subtle, border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 9999 }}>💤 Off Duty</span>;
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. COMPACT ROSTER STATUS BAR (CURVED RADIUS 28PX)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '12px 18px', borderRadius: 28 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

          {/* Left: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: T.grad, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.glow, flexShrink: 0,
            }}>
              <Bike size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Fleet Operations &amp; Live Rider Roster
              </h1>
            </div>
          </div>

          {/* Metrics */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: T.subtle, padding: '6px 16px', borderRadius: 9999,
            border: `1px solid ${T.line}`, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase' }}>Available</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.green }}>
                {riders.filter(r => r.liveStatus === 'available').length} Drivers
              </span>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase' }}>Active En Route</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.blue }}>
                {riders.filter(r => r.liveStatus === 'on_delivery' || r.liveStatus === 'picking_up').length} En Route
              </span>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase' }}>On Break / Off Duty</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.muted }}>
                {riders.filter(r => r.liveStatus === 'on_break' || r.liveStatus === 'off_duty').length} Riders
              </span>
            </div>
          </div>

          {/* Search & Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: T.subtle, border: `1px solid ${T.line}`,
              borderRadius: 9999, padding: '5px 14px', width: 210,
            }}>
              <Search size={14} color={T.muted} />
              <input
                type="text"
                placeholder="Search rider name/code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: '100%' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                height: 38, padding: '0 16px', fontSize: 12, fontWeight: 700,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, color: T.body, cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="all">All Live Statuses</option>
              <option value="available">Available Only</option>
              <option value="on_delivery">On Delivery</option>
              <option value="picking_up">Picking Up</option>
              <option value="on_break">On Break</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. LIVE FLEET OPERATIONS GRID
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: 16,
      }}>
        {filteredRiders.map((rider) => (
          <div
            key={rider.id}
            onClick={() => setSelectedRider(rider)}
            style={{
              background: T.card, borderRadius: 28,
              border: `1px solid ${T.line}`, boxShadow: T.shadowCard,
              padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowHover; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowCard; }}
          >
            {/* Header: Avatar + Rider Name + Live Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: T.brandSoft,
                  color: T.brand, border: `1px solid rgba(255,107,44,0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {rider.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {rider.name}
                    <span style={{ fontSize: 10, color: T.muted, background: T.subtle, padding: '2px 7px', borderRadius: 9999, border: `1px solid ${T.line}` }}>
                      {rider.riderCode}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {rider.fleetType} · {rider.vehicleModel}
                  </div>
                </div>
              </div>

              {renderStatusBadge(rider.liveStatus)}
            </div>

            {/* Current Assignment & Live Telemetry Box */}
            <div style={{
              background: T.subtle, borderRadius: 18, padding: '12px 14px',
              border: `1px solid ${T.lineSoft}`, display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Current Assignment:</span>
                <span style={{ fontWeight: 800, color: rider.currentAssignment.startsWith('None') ? T.muted : T.brand }}>
                  {rider.currentAssignment}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Live Telemetry:</span>
                <span style={{ fontWeight: 700, color: T.ink }}>
                  {rider.liveEtaOrDist}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: T.muted }}>
                <span>Last Completed:</span>
                <span>{rider.lastDelivery}</span>
              </div>
            </div>

            {/* Status-Based Operational Action Bar */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 2 }} onClick={e => e.stopPropagation()}>
              {rider.liveStatus === 'available' && (
                <button
                  onClick={() => navigate('/delivery')}
                  style={{
                    flex: 1, height: 38, padding: '0 14px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 9999, cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(255,107,44,0.2)',
                  }}
                >
                  Assign Order
                </button>
              )}

              {(rider.liveStatus === 'picking_up' || rider.liveStatus === 'on_delivery') && (
                <button
                  onClick={() => console.log(`Tracking GPS for ${rider.name}`)}
                  style={{
                    flex: 1, height: 38, padding: '0 14px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.blue, border: 'none', borderRadius: 9999, cursor: 'pointer',
                  }}
                >
                  Track GPS
                </button>
              )}

              {rider.liveStatus === 'on_break' && (
                <button
                  onClick={() => handleStatusChange(rider.id, 'available')}
                  style={{
                    flex: 1, height: 38, padding: '0 14px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.green, border: 'none', borderRadius: 9999, cursor: 'pointer',
                  }}
                >
                  End Break &amp; Resume
                </button>
              )}

              {rider.liveStatus === 'off_duty' && (
                <button
                  onClick={() => handleStatusChange(rider.id, 'available')}
                  style={{
                    flex: 1, height: 38, padding: '0 14px', fontSize: 12, fontWeight: 800, color: T.brand,
                    background: T.brandSoft, border: `1px solid rgba(255,107,44,0.25)`, borderRadius: 9999, cursor: 'pointer',
                  }}
                >
                  Mark On Duty
                </button>
              )}

              <button
                onClick={() => console.log(`Calling ${rider.name}`)}
                style={{
                  height: 38, padding: '0 14px', fontSize: 12, fontWeight: 700, color: T.body,
                  background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 9999, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <PhoneCall size={13} color={T.blue} /> Call
              </button>

              <button
                onClick={() => setSelectedRider(rider)}
                style={{
                  height: 38, padding: '0 14px', fontSize: 12, fontWeight: 700, color: T.muted,
                  background: T.card, border: `1px solid ${T.line}`, borderRadius: 9999, cursor: 'pointer',
                }}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          SLIDE-IN RIDER DETAILS DRAWER (PERFORMANCE, COMPLIANCE & HISTORY)
      ═══════════════════════════════════════════════════ */}
      {selectedRider && (
        <>
          <div
            onClick={() => setSelectedRider(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)',
              zIndex: 400,
            }}
          />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 450, maxWidth: '92vw', background: '#ffffff',
              zIndex: 401, display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.18)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{selectedRider.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, background: T.subtle, padding: '2px 6px', borderRadius: 4 }}>
                    {selectedRider.riderCode}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>
                  {selectedRider.fleetType} · {selectedRider.vehicleModel} ({selectedRider.vehicleRegNo})
                </div>
              </div>

              <button
                onClick={() => setSelectedRider(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: T.subtle,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Live Operational Status */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Live Assignment &amp; Telemetry
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: T.brand, marginBottom: 4 }}>
                  Assignment: {selectedRider.currentAssignment}
                </div>
                <div style={{ fontSize: 11.5, color: T.body }}>
                  Telemetry: {selectedRider.liveEtaOrDist}
                </div>
              </div>

              {/* Performance Metrics */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Performance &amp; Quality Metrics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>On-Time Rating</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.green }}>{selectedRider.onTimeRatingPercent}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Customer Rating</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.amber }}>★ {selectedRider.customerRating} / 5.0</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Deliveries Today</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{selectedRider.deliveriesToday} orders</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Deliveries Month</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{selectedRider.deliveriesMonth} orders</div>
                  </div>
                </div>
              </div>

              {/* Earnings & Incentives */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Earnings &amp; Shift Payouts
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>Today's Base Earnings:</span>
                  <span style={{ fontWeight: 800, color: T.ink }}>{formatINR(selectedRider.earningsToday)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: T.muted }}>Incentives &amp; Bonus:</span>
                  <span style={{ fontWeight: 800, color: T.green }}>+{formatINR(selectedRider.incentivesToday)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 6, borderTop: `1px dashed ${T.line}` }}>
                  <span style={{ fontWeight: 700, color: T.ink }}>Total Today:</span>
                  <span style={{ fontWeight: 900, color: T.brand }}>{formatINR(selectedRider.earningsToday + selectedRider.incentivesToday)}</span>
                </div>
              </div>

              {/* Compliance & Verification */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Compliance &amp; Documents
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: selectedRider.docStatus === 'verified' ? T.green : T.amber }}>
                  <CheckCircle2 size={14} />
                  <span>{selectedRider.docStatus === 'verified' ? 'All Credentials & DL Verified' : selectedRider.docIssues}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: '14px 20px', background: T.card, borderTop: `1px solid ${T.line}`,
              display: 'flex', gap: 8,
            }}>
              <button
                onClick={() => console.log(`Calling ${selectedRider.name}`)}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 11.5, fontWeight: 800,
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <PhoneCall size={14} /> Call Driver ({selectedRider.phone})
              </button>
              <button
                onClick={() => setSelectedRider(null)}
                style={{
                  padding: '8px 14px', fontSize: 11.5, fontWeight: 700,
                  background: T.subtle, color: T.body, border: `1px solid ${T.line}`,
                  borderRadius: 8, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
