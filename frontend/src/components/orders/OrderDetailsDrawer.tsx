import React from 'react';
import {
  Clock,
  Bike,
  Printer,
  AlertCircle,
  Check,
  X,
  MapPin,
  CreditCard,
  User,
  UserCheck,
  CheckCircle2,
  FileText,
  PhoneCall,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';
import { formatINR, formatRelativeTime } from '../../utils/formatters';
import type { Order, OrderStatus } from '../../types';

// Design Tokens (Enterprise SaaS Palette)
const T = {
  brand: '#FF7A30',
  brandSoft: '#FFF4ED',
  grad: '#FF7A30',
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
};

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    new:       { label: 'Action Needed', color: T.red,    bg: T.redBg,    border: T.redBorder },
    preparing: { label: 'In Cooking',   color: T.amber,  bg: T.amberBg,  border: T.amberBorder },
    ready:     { label: 'Ready',        color: T.green,  bg: T.greenBg,  border: T.greenBorder },
    delivered: { label: 'Completed',    color: T.muted,  bg: T.subtle,   border: T.line },
    cancelled: { label: 'Cancelled',    color: T.red,    bg: T.redBg,    border: T.redBorder },
  };
  const t = map[status] ?? { label: status, color: T.muted, bg: T.subtle, border: T.line };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.02em',
      color: t.color, background: t.bg,
      border: `1px solid ${t.border}`,
      padding: '2px 8px', borderRadius: 999,
      whiteSpace: 'nowrap', lineHeight: 1.2,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: t.color,
        display: 'inline-block', flexShrink: 0,
      }} />
      {t.label}
    </span>
  );
}

export function DeliveryTypeChip({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    delivery: { label: 'DELIVERY', color: T.blue,   bg: T.blueBg },
    pickup:   { label: 'PICKUP',   color: T.purple, bg: T.purpleBg },
    dine_in:  { label: 'DINE-IN',  color: T.green,  bg: T.greenBg },
  };
  const t = map[type] ?? { label: type.toUpperCase(), color: T.muted, bg: T.subtle };
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em',
      color: t.color, background: t.bg,
      padding: '2px 6px', borderRadius: 4,
      whiteSpace: 'nowrap',
    }}>
      {t.label}
    </span>
  );
}

function ActionBtn({ onClick, children, variant = 'default' }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'purple' | 'icon' | 'warning' | 'danger';
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: T.subtle, color: T.body, border: `1px solid ${T.line}` },
    primary: { background: T.grad, color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(255,107,44,0.25)' },
    success: { background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` },
    purple:  { background: T.purpleBg, color: T.purple, border: `1px solid ${T.purpleBorder}` },
    warning: { background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` },
    danger:  { background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` },
    icon:    { background: T.subtle, color: T.body, border: `1px solid ${T.line}` },
  };
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: variant === 'icon' ? '5px 8px' : '5px 11px',
        fontSize: 11.5, fontWeight: 700, borderRadius: 7,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        ...styles[variant],
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.opacity = '0.92';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.opacity = '1';
      }}
    >
      {children}
    </button>
  );
}

export interface OrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
  onAction: (actionName: string, orderId?: string, targetStatus?: OrderStatus) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  onClose,
  onAction,
}) => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const packingFee = 25;
  const deliveryFee = order.deliveryType === 'delivery' ? 45 : 0;
  const grandTotal = subtotal + gst + packingFee + deliveryFee;

  const stages = [
    { key: 'placed', label: 'Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Cooking' },
    { key: 'ready', label: 'Ready' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'new': return 0;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const activeIdx = getStageIndex(order.status);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 400,
        }}
      />

      {/* Slide-In Drawer Shell */}
      <div
        className="animate-slide-in-right"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 450, maxWidth: '92vw',
          background: '#ffffff',
          zIndex: 401,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.18)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: T.card,
          borderBottom: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: T.brand, letterSpacing: '-0.02em' }}>
                {order.orderNumber}
              </span>
              <StatusChip status={order.status} />
              <DeliveryTypeChip type={order.deliveryType} />
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} color={T.muted} />
              Placed {formatRelativeTime(order.createdAt)} · Target SLA: {order.estimatedPrepTime} min
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: T.subtle, border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.muted, cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1. Customer & Address */}
          <div style={{
            background: T.subtle, padding: '12px 14px', borderRadius: 10,
            border: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: T.ink }}>
                <User size={14} color={T.brand} />
                {order.customerName}
              </div>
              <button
                onClick={() => onAction(`Call Customer (${order.customerPhone})`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, color: T.blue, background: T.blueBg,
                  border: `1px solid ${T.blueBorder}`, padding: '2px 8px', borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <PhoneCall size={11} /> {order.customerPhone.slice(-10)}
              </button>
            </div>

            {order.deliveryType === 'delivery' && (
              <div style={{ fontSize: 11.5, color: T.body, display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6, lineHeight: 1.4 }}>
                <MapPin size={13} color={T.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Flat 402, Green Acres Apt, Phase 1, Electronic City, Bengaluru - 560100</span>
              </div>
            )}
            {order.deliveryType === 'dine_in' && (
              <div style={{ fontSize: 11.5, color: T.green, fontWeight: 600, marginTop: 4 }}>
                📍 Dine-in Location: Table 7 (Main Dining Section)
              </div>
            )}
          </div>

          {/* 2. Order Timeline Stepper */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Order Lifecycle Stage
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: T.subtle, padding: '10px 14px', borderRadius: 10,
              border: `1px solid ${T.line}`,
            }}>
              {stages.map((st, i) => {
                const isCompleted = i <= activeIdx;
                const isCurrent = i === activeIdx;
                return (
                  <React.Fragment key={st.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: isCompleted ? (isCurrent ? T.brand : T.green) : T.line,
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                      }}>
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : i + 1}
                      </div>
                      <span style={{
                        fontSize: 9.5, fontWeight: isCurrent ? 800 : 500,
                        color: isCurrent ? T.brand : (isCompleted ? T.ink : T.muted),
                      }}>
                        {st.label}
                      </span>
                    </div>
                    {i < stages.length - 1 && (
                      <ChevronRight size={12} color={i < activeIdx ? T.green : T.light} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Per-Order Audit Log Events */}
            {order.timeline && order.timeline.length > 0 && (
              <div style={{
                marginTop: 8, background: T.card, border: `1px solid ${T.line}`,
                borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Workflow History Log ({order.timeline.length})
                </div>
                {order.timeline.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                        padding: '1px 5px', borderRadius: 4,
                        background: ev.status === 'delivered' ? T.greenBg : ev.status === 'cancelled' ? T.redBg : T.brandSoft,
                        color: ev.status === 'delivered' ? T.green : ev.status === 'cancelled' ? T.red : T.brand,
                      }}>
                        {ev.status.replace('_', ' ')}
                      </span>
                      {ev.actor && <span style={{ fontWeight: 600, color: T.ink }}>by {ev.actor}</span>}
                      {ev.note && <span style={{ color: T.muted, fontStyle: 'italic' }}>({ev.note})</span>}
                    </div>
                    <span style={{ fontSize: 10, color: T.muted }}>
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Ordered Items List */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Ordered Items ({order.items.length})
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden',
            }}>
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 14px', background: T.card,
                    borderBottom: idx < order.items.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color: T.ink, background: '#F1F5F9',
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        {item.quantity}×
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>

                  {item.notes && (
                    <div style={{
                      fontSize: 10.5, color: T.amber, background: T.amberBg,
                      border: `1px solid ${T.amberBorder}`, padding: '2px 8px', borderRadius: 5,
                      display: 'inline-block', marginTop: 4, fontWeight: 600,
                    }}>
                      ✎ Special Request: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Bill Summary */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Bill Breakdown & Payment
            </div>
            <div style={{
              background: T.subtle, padding: '12px 14px', borderRadius: 10,
              border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.muted }}>
                <span>Item Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.muted }}>
                <span>Taxes & GST (5%)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.muted }}>
                <span>Packaging Fee</span>
                <span>{formatINR(packingFee)}</span>
              </div>
              {order.deliveryType === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T.muted }}>
                  <span>Delivery Charge</span>
                  <span>{formatINR(deliveryFee)}</span>
                </div>
              )}
              <div style={{ height: 1, background: T.line, margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: T.ink }}>
                <span>Total Amount Paid</span>
                <span style={{ color: T.brand }}>{formatINR(grandTotal)}</span>
              </div>

              <div style={{
                marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${T.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.body, fontWeight: 600 }}>
                  <CreditCard size={13} color={T.blue} />
                  UPI Payment (GPay)
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 800, color: T.green, background: T.greenBg,
                  border: `1px solid ${T.greenBorder}`, padding: '1px 6px', borderRadius: 4,
                }}>
                  ✓ PAID
                </span>
              </div>
            </div>
          </div>

          {/* 5. Assigned Rider */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Assigned Rider &amp; Dispatch Status
            </div>

            {order.assignedRiderId ? (
              /* Rider is assigned */
              <div style={{
                background: T.subtle, padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: T.blueBg,
                    color: T.blue, border: `1px solid ${T.blueBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bike size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>
                      {order.assignedRiderName}
                    </div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>
                      {order.assignedRiderCode ? `${order.assignedRiderCode} · ` : ''}
                      {order.assignedRiderPhone ?? 'No phone on file'}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  color: order.status === 'out_for_delivery' ? T.green : T.blue,
                  background: order.status === 'out_for_delivery' ? T.greenBg : T.blueBg,
                  border: `1px solid ${order.status === 'out_for_delivery' ? T.greenBorder : T.blueBorder}`,
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  {order.status === 'out_for_delivery' ? '🚴 Out for Delivery'
                    : order.status === 'rider_arrived' ? '📍 At Restaurant'
                    : order.status === 'rider_accepted' ? '🛵 Heading to Pick Up'
                    : '✓ Assigned'}
                </span>
              </div>
            ) : (
              /* No rider assigned yet — always clickable to go to Delivery page */
              <div
                onClick={() => onAction('Assign Rider', order.id)}
                style={{
                  background: T.subtle, padding: '10px 14px', borderRadius: 10,
                  border: `1px dashed ${T.amber}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = T.amberBg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = T.subtle;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: T.amberBg, color: T.amber,
                    border: `1px solid ${T.amberBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bike size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>Not Assigned</div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>
                      Tap to go to the Delivery page and assign a rider →
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: T.amber,
                  background: T.amberBg, border: `1px solid ${T.amberBorder}`,
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  Assign Now →
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Actions Footer */}
        <div style={{
          padding: '14px 20px', background: T.card,
          borderTop: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          {order.status === 'new' && (<>
            <ActionBtn onClick={() => onAction(`Accept Order ${order.orderNumber}`, order.id, 'preparing')} variant="primary">
              <Check size={14} /> Accept Order
            </ActionBtn>
            <ActionBtn onClick={() => onAction(`Reject Order ${order.orderNumber}`, order.id, 'cancelled')} variant="danger">
              <AlertCircle size={14} /> Reject
            </ActionBtn>
            <ActionBtn onClick={() => onAction(`Print KOT ${order.orderNumber}`)} variant="icon">
              <Printer size={14} />
            </ActionBtn>
          </>)}

          {order.status === 'preparing' && (<>
            <ActionBtn onClick={() => onAction(`Mark Ready ${order.orderNumber}`, order.id, 'ready')} variant="success">
              <CheckCircle2 size={14} /> Mark Ready
            </ActionBtn>
            <ActionBtn onClick={() => onAction(`Assign Rider for ${order.orderNumber}`)} variant="default">
              <UserCheck size={14} /> Assign Rider
            </ActionBtn>
            <ActionBtn onClick={() => onAction(`Print KOT ${order.orderNumber}`)} variant="icon">
              <Printer size={14} />
            </ActionBtn>
          </>)}

          {order.status === 'ready' && (<>
            <ActionBtn onClick={() => onAction(`Handover ${order.orderNumber}`, order.id, 'delivered')} variant="purple">
              <PackageCheck size={14} /> Handover
            </ActionBtn>
            <ActionBtn onClick={() => onAction(`Print Receipt ${order.orderNumber}`)} variant="icon">
              <FileText size={14} />
            </ActionBtn>
          </>)}

          {['delivered', 'cancelled'].includes(order.status) && (
            <ActionBtn onClick={() => onAction(`Print Receipt ${order.orderNumber}`)} variant="default">
              <FileText size={14} /> Print Receipt
            </ActionBtn>
          )}

          <ActionBtn onClick={onClose} variant="default">
            Close
          </ActionBtn>
        </div>
      </div>
    </>
  );
};
