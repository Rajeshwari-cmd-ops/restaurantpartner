import React, { useState } from 'react';
import {
  Bike,
  PackageCheck,
  Navigation,
  MapPin,
  CheckCircle2,
  PhoneCall,
  X,
  Copy,
  UserCheck,
  Zap,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { useWorkflow } from '../context/WorkflowContext';
import type { SharedDispatchOrder } from '../types';

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

  card: '#FFFFFF',
  subtle: '#F8FAFC',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
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

export interface DispatchOrder {
  id: string;
  orderNumber: string;
  channel: 'Online Delivery' | 'Direct Web' | 'Magicpin';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  totalAmount: number;
  assignmentStatus: 'unassigned' | 'assigned' | 'at_store' | 'in_transit' | 'delivered';
  driverName?: string;
  driverPhone?: string;
  driverCode?: string;
  fleetProvider?: 'Forge Express' | 'Express Fleet' | 'Partner Fleet';
  pickupOtp: string;
  etaMinutes: number;
  distanceKm: number;
  dispatchTime: string;
  stagedMinutes: number;
}

export interface FleetRider {
  id: string;
  name: string;
  phone: string;
  code: string;
  fleet: 'Forge Express' | 'Express Fleet' | 'Partner Fleet';
  vehicle: 'EV Bike' | 'Motorcycle' | 'Scooter';
  distanceKm: number;
  distanceFormatted: string;
  battery: number;
  status: 'available' | 'at_outlet' | 'returning' | 'busy' | 'on_delivery';
}

export const DeliveryPage: React.FC = () => {
  const {
    dispatchOrders,
    riders,
    assignRider,
    handoverOrder,
    markDelivered,
  } = useWorkflow();

  const [selectedOrder, setSelectedOrder] = useState<SharedDispatchOrder | null>(null);
  const [changingRiderForOrder, setChangingRiderForOrder] = useState<SharedDispatchOrder | null>(null);

  // Map context riders to the FleetRider shape the UI already renders
  const availableFleet = riders
    .filter(r => r.liveStatus === 'available')
    .map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      code: r.riderCode,
      fleet: r.fleetType,
      vehicle: r.vehicle === 'Electric Scooter' ? 'EV Bike' : r.vehicle,
      distanceKm: r.distanceKm,
      distanceFormatted: `${r.distanceKm} km`,
      battery: r.battery,
      status: 'available' as const,
    }));

  // Assign rider: calls context action (updates riders + dispatch atomically)
  const handleAssignRiderToOrder = (dispatchOrderId: string, rider: typeof availableFleet[0]) => {
    const dispatch = dispatchOrders.find(d => d.id === dispatchOrderId);
    if (!dispatch) return;
    const fullRider = riders.find(r => r.id === rider.id);
    if (!fullRider) return;
    assignRider(dispatch.orderId, fullRider);
    if (changingRiderForOrder?.id === dispatchOrderId) setChangingRiderForOrder(null);
  };

  // Auto-assign all unassigned orders
  const handleAutoAssignAll = () => {
    const unassigned = dispatchOrders.filter(o => o.assignmentStatus === 'unassigned');
    let freeRiderIdx = 0;
    unassigned.forEach(dispatch => {
      const fullRider = riders.filter(r => r.liveStatus === 'available')[freeRiderIdx];
      if (fullRider) {
        assignRider(dispatch.orderId, fullRider);
        freeRiderIdx++;
      }
    });
  };

  // Handover OTP: out for delivery
  const handleHandoverOTP = (dispatch: SharedDispatchOrder) => {
    handoverOrder(dispatch.orderId);
    setSelectedOrder(null);
  };

  // Mark delivered from detail drawer
  const handleMarkDelivered = (dispatch: SharedDispatchOrder) => {
    markDelivered(dispatch.orderId);
    setSelectedOrder(null);
  };

  const readyForPickupOrders = dispatchOrders.filter(o => o.assignmentStatus === 'unassigned');
  const activeDeliveriesList = dispatchOrders.filter(o => ['assigned', 'at_store', 'in_transit'].includes(o.assignmentStatus));

  // Compute unique dynamic rider suggestion for each ready order
  const getSuggestedRiderForOrderIndex = (index: number) => {
    if (availableFleet.length === 0) return null;
    return availableFleet[index % availableFleet.length] || availableFleet[0];
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32, position: 'relative' }}>

      {/* ═══════════════════════════════════════════════════
          1. TOP WORKFLOW SPLIT:
          • LEFT (68% WIDTH): READY FOR PICKUP (PRIMARY WORKSPACE - DYNAMIC BEST MATCH RIDERS)
          • RIGHT (30% WIDTH): FLEET DISPATCH OVERVIEW & AUTO ASSIGN
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '68% 30%',
        gap: '2%', alignItems: 'start',
      }}>

        {/* ── LEFT WORKSPACE (68% WIDTH): READY FOR PICKUP ── */}
        <div style={cardStyle({ borderRadius: 28 })}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PackageCheck size={18} color={T.brand} />
              <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>
                Ready for Pickup ({readyForPickupOrders.length})
              </span>
            </div>

            {readyForPickupOrders.length > 0 && (
              <span style={{
                fontSize: 10.5, fontWeight: 800, color: T.red, background: T.redBg,
                border: `1px solid ${T.redBorder}`, padding: '2px 8px', borderRadius: 9999,
              }}>
                Action Needed
              </span>
            )}
          </div>

          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {readyForPickupOrders.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: T.muted }}>
                <CheckCircle2 size={32} color={T.green} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 2 }}>
                  All Staged Orders Paired!
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  No orders currently waiting for driver assignment.
                </div>
              </div>
            ) : (
              readyForPickupOrders.map((order, orderIndex) => {
                const bestMatchRider = getSuggestedRiderForOrderIndex(orderIndex);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      background: T.card, borderRadius: 24,
                      border: `1px solid ${T.line}`,
                      boxShadow: T.shadowCard, padding: '16px 18px',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', flexDirection: 'column', gap: 12,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowHover; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowCard; }}
                  >
                    {/* Top Row: Order # + Channel + Total + Staged Timer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.brand, letterSpacing: '-0.02em' }}>
                          {order.orderNumber}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: T.body, background: T.subtle,
                          border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 9999,
                        }}>
                          {order.channel}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: T.amber, background: T.amberBg,
                          border: `1px solid ${T.amberBorder}`, padding: '2px 8px', borderRadius: 9999,
                        }}>
                          ⏱ Staged {order.stagedMinutes}m ago
                        </span>
                      </div>

                      <span style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    {/* Customer Info & Items Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: T.body, fontWeight: 700 }}>
                        👤 {order.customerName} · <span style={{ color: T.muted, fontWeight: 500 }}>{order.distanceKm} km</span>
                      </span>
                      <span style={{ color: T.muted, fontSize: 11.5, fontWeight: 500 }}>
                        📦 {order.itemsSummary}
                      </span>
                    </div>

                    {/* REALISTIC BEST MATCH RIDER PAIRING BAR */}
                    <div style={{
                      background: T.subtle, borderRadius: 18, padding: '12px 14px',
                      border: `1px solid ${T.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      {bestMatchRider ? (
                        <>
                          <div>
                            <div style={{ fontSize: 10.5, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Best Match
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                              <Bike size={14} color={T.green} />
                              <span>{bestMatchRider.name}</span>
                              <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>• {bestMatchRider.distanceFormatted}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleAssignRiderToOrder(order.id, bestMatchRider)}
                              style={{
                                height: 38, padding: '0 16px', fontSize: 12, fontWeight: 800, color: '#fff',
                                background: T.brand, border: 'none', borderRadius: 9999, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                boxShadow: '0 2px 8px rgba(255,107,44,0.22)',
                              }}
                            >
                              <UserCheck size={14} /> Assign
                            </button>
                            <button
                              onClick={() => setChangingRiderForOrder(order)}
                              style={{
                                height: 38, padding: '0 16px', fontSize: 12, fontWeight: 700, color: T.body,
                                background: T.card, border: `1px solid ${T.line}`, borderRadius: 9999, cursor: 'pointer',
                              }}
                            >
                              Change Rider
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11.5, color: T.red, fontWeight: 700 }}>
                          ⚠️ No riders currently available in fleet pool
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (30% WIDTH): FLEET DISPATCH OVERVIEW & QUICK ACTIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle({ padding: '16px 18px', borderRadius: 28 })}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 10 }}>
              Fleet Dispatch Overview
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Ready Staged Orders:</span>
                <span style={{ fontWeight: 800, color: T.brand }}>{readyForPickupOrders.length} Unassigned</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Available Fleet Pool:</span>
                <span style={{ fontWeight: 800, color: T.green }}>{availableFleet.length} Drivers Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Active Deliveries:</span>
                <span style={{ fontWeight: 800, color: T.blue }}>{activeDeliveriesList.length} Live</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: T.muted, fontWeight: 600 }}>Avg Dispatch SLA:</span>
                <span style={{ fontWeight: 800, color: T.ink }}>3.2 min</span>
              </div>
            </div>

            <button
              onClick={handleAutoAssignAll}
              style={{
                width: '100%', height: 42, marginTop: 14, padding: '0 18px',
                background: T.grad, color: '#fff', border: 'none',
                borderRadius: 9999, fontSize: 13, fontWeight: 800,
                boxShadow: T.glow, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Zap size={14} fill="#fff" /> Auto-Assign All Orders ({readyForPickupOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. BOTTOM WORKSPACE: ACTIVE DELIVERIES (COMPACT OPERATIONAL TABLE)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ borderRadius: 28 })}>
        <div style={{
          padding: '14px 18px', background: T.card,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${T.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={16} color={T.blue} />
            <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>
              Active Deliveries ({activeDeliveriesList.length})
            </span>
          </div>

          <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>
            Click row for delivery details &amp; handover OTP
          </span>
        </div>

        {/* Compact Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>Order &amp; Channel</th>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>Assigned Driver &amp; Fleet</th>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>Status &amp; ETA</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeDeliveriesList.map((order, idx) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    borderBottom: idx === activeDeliveriesList.length - 1 ? 'none' : `1px solid ${T.lineSoft}`,
                    cursor: 'pointer', transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.subtle; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 13, color: T.brand }}>{order.orderNumber}</strong>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.body, background: T.subtle, border: `1px solid ${T.line}`, padding: '1px 5px', borderRadius: 4 }}>
                        {order.channel}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', color: T.ink, fontWeight: 600 }}>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>{order.distanceKm} km away</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Bike size={13} color={T.blue} />
                      <span style={{ fontWeight: 700, color: T.ink }}>{order.riderName || '—'}</span>
                      <span style={{ fontSize: 10, color: T.muted }}>({order.riderCode || '—'})</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>{order.fleetProvider || '—'}</div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: T.blue, background: T.blueBg,
                        border: `1px solid ${T.blueBorder}`, padding: '2px 6px', borderRadius: 4,
                      }}>
                        {order.assignmentStatus.toUpperCase().replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: T.green }}>
                        ⏱ {order.etaMinutes}m ETA
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => console.log(`Calling rider ${order.riderPhone}`)}
                        style={{
                          padding: '5px 9px', fontSize: 11, fontWeight: 700,
                          background: T.subtle, color: T.body, border: `1px solid ${T.line}`,
                          borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <PhoneCall size={11} color={T.blue} /> Call
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: '5px 9px', fontSize: 11, fontWeight: 700,
                          background: T.brandSoft, color: T.brand, border: `1px solid rgba(255,107,44,0.2)`,
                          borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <PackageCheck size={11} /> Details &amp; OTP
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SLIDE-IN CHANGE RIDER DRAWER (SELECT FROM ALL AVAILABLE RIDERS)
      ═══════════════════════════════════════════════════ */}
      {changingRiderForOrder && (
        <>
          <div
            onClick={() => setChangingRiderForOrder(null)}
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
              width: 440, maxWidth: '92vw', background: '#ffffff',
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
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>Select Fleet Rider</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>
                  Order {changingRiderForOrder.orderNumber} · {changingRiderForOrder.customerName} ({changingRiderForOrder.distanceKm} km)
                </div>
              </div>

              <button
                onClick={() => setChangingRiderForOrder(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: T.subtle,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Rider List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Available Fleet Drivers ({availableFleet.length})
              </div>

              {availableFleet.map(rider => (
                <div
                  key={rider.id}
                  style={{
                    background: T.subtle, borderRadius: 12,
                    border: `1px solid ${T.line}`, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: T.greenBg,
                      color: T.green, border: `1px solid ${T.greenBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>
                      {rider.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{rider.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        {rider.code} · {rider.fleet} · {rider.vehicle}
                      </div>
                      <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700, marginTop: 2 }}>
                        📍 {rider.distanceFormatted} from outlet · 🔋 {rider.battery}%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignRiderToOrder(changingRiderForOrder.id, rider)}
                    style={{
                      padding: '6px 12px', fontSize: 11.5, fontWeight: 800, color: '#fff',
                      background: T.brand, border: 'none', borderRadius: 8, cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(255,107,44,0.2)',
                    }}
                  >
                    Select Rider
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          SLIDE-IN DELIVERY DETAILS DRAWER (FULL ADDRESS & OTP)
      ═══════════════════════════════════════════════════ */}
      {selectedOrder && (
        <>
          <div
            onClick={() => setSelectedOrder(null)}
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
                  <span style={{ fontSize: 18, fontWeight: 800, color: T.brand }}>{selectedOrder.orderNumber}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.blue, background: T.blueBg, padding: '2px 6px', borderRadius: 4 }}>
                    {selectedOrder.channel}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>
                  Dispatched at {selectedOrder.dispatchTime} · {selectedOrder.distanceKm} km
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
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

              {/* OTP BADGE */}
              <div style={{
                background: T.brandSoft, padding: '14px', borderRadius: 12,
                border: `1px solid rgba(255,107,44,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Security Handover OTP
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: T.brand, letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums' }}>
                    {selectedOrder.pickupOtp}
                  </div>
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(selectedOrder.pickupOtp)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '6px 10px', background: T.card, color: T.brand,
                    border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Copy size={12} /> Copy OTP
                </button>
              </div>

              {/* Customer Address */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Customer Delivery Destination
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 4 }}>
                  {selectedOrder.customerName}
                </div>
                <div style={{ fontSize: 11.5, color: T.body, display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.4 }}>
                  <MapPin size={14} color={T.brand} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{selectedOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Ordered Items & Bill Total
                </div>
                <div style={{ fontSize: 12, color: T.ink, fontWeight: 600, marginBottom: 6 }}>
                  {selectedOrder.itemsSummary}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.brand }}>
                  Total Bill: {formatINR(selectedOrder.totalAmount)} (Paid Online)
                </div>
              </div>

              {/* Driver Profile */}
              {selectedOrder.riderName && (
                <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                    Assigned Fleet Driver
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: T.blueBg,
                        color: T.blue, border: `1px solid ${T.blueBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
                      }}>
                        {selectedOrder.riderName[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink }}>{selectedOrder.riderName}</div>
                        <div style={{ fontSize: 10.5, color: T.muted }}>Code: {selectedOrder.riderCode} · {selectedOrder.fleetProvider}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => console.log(`Calling driver ${selectedOrder.riderPhone}`)}
                      style={{
                        padding: '4px 8px', fontSize: 11, fontWeight: 700, color: T.blue,
                        background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      <PhoneCall size={11} /> Call
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{
              padding: '14px 20px', background: T.card, borderTop: `1px solid ${T.line}`,
              display: 'flex', gap: 8, flexWrap: 'wrap',
            }}>
              <button
                onClick={() => handleHandoverOTP(selectedOrder)}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 11.5, fontWeight: 800,
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  boxShadow: '0 2px 8px rgba(255,107,44,0.25)',
                }}
              >
                <CheckCircle2 size={14} /> Verify &amp; Dispatch OTP (Out for Delivery)
              </button>
              <button
                onClick={() => handleMarkDelivered(selectedOrder)}
                style={{
                  padding: '8px 12px', fontSize: 11.5, fontWeight: 800,
                  background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`,
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <CheckCircle2 size={14} /> Mark Delivered
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
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
