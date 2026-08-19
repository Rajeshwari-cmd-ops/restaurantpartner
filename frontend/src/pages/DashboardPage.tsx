import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Clock,
  Flame,
  PackageCheck,
  Bike,
  AlertTriangle,
  Plus,
  ChefHat,
  Activity,
  Check,
  Ban,
  Layers,
  TrendingUp,
  RefreshCw,
  Phone,
  ArrowRight,
  X,
  Minus,
} from 'lucide-react';
import { formatINR, formatRelativeTime } from '../utils/formatters';
import type { Order, OrderStatus } from '../types';
import { OrderDetailsDrawer, StatusChip, DeliveryTypeChip } from '../components/orders/OrderDetailsDrawer';
import { useOrders } from '../context/OrderContext';

// Design Tokens (Enterprise Palette - Flat Brand Orange #FF7A30)
const T = {
  brand: '#FF7A30',
  brandAlt: '#E5661E',
  brandSoft: '#FFF4ED',
  grad: '#FF7A30',
  glow: '0 4px 14px rgba(255, 122, 48, 0.25)',

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

  shadowCard: '0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px rgba(15, 23, 42, 0.03)',
  shadowMd: '0 6px 20px rgba(15, 23, 42, 0.06)',
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

const hr: React.CSSProperties = { height: 1, background: T.line, flexShrink: 0 };

function IconBadge({ icon, color, bg, borderColor, size = 30 }: {
  icon: React.ReactNode; color: string; bg: string; borderColor?: string; size?: number;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: bg, color,
      border: borderColor ? `1px solid ${borderColor}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
  );
}

function ActionBtn({ onClick, children, variant = 'default', size = 'md' }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'purple' | 'icon' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: T.subtle, color: T.body, border: `1px solid ${T.line}` },
    primary: { background: T.grad, color: '#fff', border: '1px solid transparent', boxShadow: '0 2px 8px rgba(255,122,48,0.25)' },
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
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        height: size === 'sm' ? 32 : 38, boxSizing: 'border-box',
        padding: variant === 'icon' ? '0 10px' : size === 'sm' ? '0 12px' : '0 18px',
        fontSize: size === 'sm' ? 12 : 13, fontWeight: 700, borderRadius: 9999,
        cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1,
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    orders, inventory, riders, activityLog,
    isOnline, setIsOnline,
    acceptOrder, rejectOrder, markReady, createNewOrder, updateInventoryStock,
  } = useOrders();

  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Order & Quick 86 Modal & Reject Modal States
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showQuick86Modal, setShowQuick86Modal] = useState(false);
  const [selectedRejectOrderId, setSelectedRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Kitchen Busy / High Volume');
  const [newCustomerName, setNewCustomerName] = useState('Aarav Mehta');
  const [newCustomerPhone, setNewCustomerPhone] = useState('+91 98201 11223');
  const [newOrderType, setNewOrderType] = useState<'delivery' | 'pickup' | 'dine_in'>('delivery');
  const [selectedDishQty, setSelectedDishQty] = useState<Record<string, number>>({
    'Paneer Butter Masala': 1,
    'Chicken Dum Biryani': 1,
    'Garlic Butter Naan': 2,
    'Mango Lassi Thick': 0,
  });

  const handleCreateNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dishCatalog: Record<string, { price: number; isVeg: boolean }> = {
      'Paneer Butter Masala': { price: 340, isVeg: true },
      'Chicken Dum Biryani': { price: 380, isVeg: false },
      'Garlic Butter Naan': { price: 75, isVeg: true },
      'Mango Lassi Thick': { price: 120, isVeg: true },
    };

    const itemsList = Object.entries(selectedDishQty)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity], idx) => ({
        id: `itm-${idx + 1}`,
        name,
        quantity,
        price: dishCatalog[name]?.price || 250,
        isVeg: dishCatalog[name]?.isVeg ?? true,
      }));

    if (itemsList.length === 0) return;

    const subtotal = itemsList.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalAmount = subtotal + Math.round(subtotal * 0.05);

    createNewOrder({
      customerName: newCustomerName || 'Walk-in Guest',
      customerPhone: newCustomerPhone || '+91 98000 11223',
      deliveryType: newOrderType,
      items: itemsList,
      totalAmount,
    });
    setShowNewOrderModal(false);
  };

  const dispatchRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);

  // Sync indicator only (no API calls — data is managed by WorkflowContext)
  useEffect(() => {
    let isMounted = true;
    const timer = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        if (isMounted) {
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setIsSyncing(false);
        }
      }, 500);
    }, 15000);
    return () => { isMounted = false; clearInterval(timer); };
  }, []);

  const outletCtx = useOutletContext<{ searchTerm?: string }>();
  const globalSearchTerm = (outletCtx?.searchTerm || '').trim().toLowerCase();

  const stockAlerts  = inventory.filter(i => i.status !== 'in_stock');
  const newOrders    = orders.filter(o => o.status === 'new');
  const cooking      = orders.filter(o => o.status === 'preparing');
  const ready        = orders.filter(o => o.status === 'ready');

  // Dashboard shows top 6 active orders (filtered by global header search)
  const activeOrders = orders
    .filter(o => ['new', 'preparing', 'ready'].includes(o.status))
    .filter(o => {
      if (!globalSearchTerm) return true;
      return (
        o.orderNumber.toLowerCase().includes(globalSearchTerm) ||
        o.id.toLowerCase().includes(globalSearchTerm) ||
        o.customerName.toLowerCase().includes(globalSearchTerm) ||
        o.customerPhone.toLowerCase().includes(globalSearchTerm)
      );
    })
    .slice(0, 6);

  // Use live riders from context for dispatch widget
  const liveRiders = riders.slice(0, 3).map(r => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    status: r.liveStatus === 'on_delivery' ? 'on_delivery' : r.liveStatus === 'picking_up' ? 'arriving' : 'available',
    order: r.currentAssignment,
    eta: r.liveEtaOrDist,
  }));

  // Activity timeline — live from context (last 3 events)
  const liveActivity = activityLog.slice(0, 3);

  // Helper for the reject handler
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'preparing') acceptOrder(orderId);
    else if (newStatus === 'ready') markReady(orderId);
    else if (newStatus === 'cancelled') rejectOrder(orderId);
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — COMPACT OPERATIONS STATUS BAR (WITH CLICKABLE SYNCHRONIZED KPIS)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ background: T.card, padding: '12px 18px' })}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>

          {/* Left: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: T.subtle, color: T.ink, border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{
                fontSize: 16, fontWeight: 800, color: T.ink,
                letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
              }}>
                Operations Control Center
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, color: T.muted, background: T.subtle,
                padding: '4px 9px', borderRadius: 6, border: `1px solid ${T.line}`,
                lineHeight: 1,
              }}>
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} color={T.muted} />
                Live Sync: {lastSyncTime}
              </span>
            </div>
          </div>

          {/* Center: Refined Enterprise Operations Status Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: T.subtle, padding: '8px 16px', borderRadius: 20,
            border: `1px solid ${T.line}`, flexWrap: 'wrap',
            height: 42, boxSizing: 'border-box',
          }}>
            {/* 1. Store KPI */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title="Click to toggle store online/offline status"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 90, minWidth: 90, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isOnline ? T.green : T.red, display: 'inline-block',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, letterSpacing: '0.02em' }}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 2. Action Needed KPI */}
            <button
              onClick={() => navigate('/orders')}
              title="Click to navigate to Orders management"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 145, minWidth: 145, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Action Needed:</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: newOrders.length > 0 ? T.red : T.ink,
                background: T.card,
                padding: '2px 8px', borderRadius: 6, fontVariantNumeric: 'tabular-nums',
                border: `1px solid ${T.line}`,
              }}>
                {newOrders.length}
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 3. Kitchen KPI */}
            <button
              onClick={() => navigate('/orders')}
              title="Click to navigate to Orders management"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 110, minWidth: 110, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <Flame size={14} color={T.muted} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Kitchen:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                {cooking.length}
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 4. Dispatch KPI */}
            <button
              onClick={() => navigate('/orders')}
              title="Click to navigate to Orders management"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 115, minWidth: 115, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <PackageCheck size={14} color={T.muted} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Dispatch:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                {ready.length}
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 5. Riders KPI */}
            <button
              onClick={() => dispatchRef.current?.scrollIntoView({ behavior: 'smooth' })}
              title="Click to view Rider Fleet"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 155, minWidth: 155, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <Bike size={14} color={T.muted} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Riders:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                2 / 4 Free
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 6. Stock KPI */}
            <button
              onClick={() => inventoryRef.current?.scrollIntoView({ behavior: 'smooth' })}
              title="Click to view Stock Alerts"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 135, minWidth: 135, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              <AlertTriangle size={14} color={stockAlerts.length > 0 ? T.amber : T.muted} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Stock:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: stockAlerts.length > 0 ? T.amber : T.ink, fontVariantNumeric: 'tabular-nums' }}>
                {stockAlerts.length} Alerts
              </span>
            </button>

            <span style={{ width: 1, height: 20, background: T.line, flexShrink: 0 }} />

            {/* 7. Revenue KPI */}
            <div
              title="Today's Revenue breakdown"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: 155, minWidth: 155, flexShrink: 0,
                background: 'transparent', border: 'none', cursor: 'default', padding: 0
              }}
            >
              <TrendingUp size={14} color={T.muted} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Revenue:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                ₹28,450
              </span>
            </div>
          </div>

          {/* Right: Operational Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={() => setShowNewOrderModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: T.brand, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(255, 122, 48, 0.2)',
              }}
            >
              <Plus size={14} strokeWidth={2.5} /> New Order
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — MAIN COCKPIT: LIVE ORDER STREAM & KITCHEN PERFORMANCE
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '68% 30%',
        gap: '2%', alignItems: 'start',
      }}>

        {/* ── LEFT: LIVE ORDER STREAM ── */}
        <div style={cardStyle()}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBadge icon={<Flame size={15} strokeWidth={2.2} />} color={T.ink} bg={T.subtle} borderColor={T.line} size={28} />
              <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Live Order Stream</span>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>({activeOrders.length} active orders)</span>
            </div>
            <button
              onClick={() => navigate('/orders')}
              style={{
                fontSize: 12, fontWeight: 700, color: T.ink, background: T.subtle,
                border: `1px solid ${T.line}`, padding: '5px 12px', borderRadius: 8,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              View All Orders <ArrowRight size={13} />
            </button>
          </div>

          {/* Table Headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 120px 95px 85px 160px',
            padding: '10px 18px', background: T.subtle, borderBottom: `1px solid ${T.line}`,
            fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            <div>Order ID</div>
            <div>Customer</div>
            <div>Status</div>
            <div>Timer</div>
            <div>Amount</div>
            <div style={{ textAlign: 'right' }}>Primary Action</div>
          </div>

          {/* Order Rows */}
          {activeOrders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
              No active orders right now
            </div>
          ) : (
            activeOrders.map((order, i) => (
              <React.Fragment key={order.id}>
                <div
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    display: 'grid', gridTemplateColumns: '110px 1fr 120px 95px 85px 160px',
                    padding: '12px 18px', alignItems: 'center',
                    cursor: 'pointer', transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Order ID */}
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: T.brand, wordBreak: 'break-word' }}>{order.orderNumber || `#${order.id}`}</div>
                    <div style={{ marginTop: 2 }}>
                      <DeliveryTypeChip type={order.deliveryType} />
                    </div>
                  </div>

                  {/* Customer */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{order.customerName}</div>
                    <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <Phone size={10} />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <StatusChip status={order.status} />
                  </div>

                  {/* Timer */}
                  <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={T.muted} />
                    <span>{formatRelativeTime(order.createdAt)}</span>
                  </div>

                  {/* Amount */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(order.totalAmount)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.green, marginTop: 1 }}>
                      ✓ PAID
                    </div>
                  </div>

                  {/* Primary Action */}
                  <div style={{ textAlign: 'right' }}>
                    {order.status === 'new' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <ActionBtn onClick={() => acceptOrder(order.id)} variant="primary" size="sm">
                          Accept Order
                        </ActionBtn>
                        <ActionBtn onClick={() => setSelectedRejectOrderId(order.id)} variant="default" size="sm">
                          Reject
                        </ActionBtn>
                      </div>
                    )}
                    {order.status === 'preparing' && (
                      <ActionBtn onClick={() => markReady(order.id)} variant="default" size="sm">
                        Mark Ready
                      </ActionBtn>
                    )}
                    {order.status === 'ready' && (
                      <ActionBtn onClick={() => handleUpdateStatus(order.id, 'delivered')} variant="default" size="sm">
                        Handover
                      </ActionBtn>
                    )}
                  </div>
                </div>
                {i < activeOrders.length - 1 && <div style={hr} />}
              </React.Fragment>
            ))
          )}
        </div>

        {/* ── RIGHT: KITCHEN PERFORMANCE ── */}
        <div style={cardStyle()}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBadge icon={<ChefHat size={15} strokeWidth={2.2} />} color={T.ink} bg={T.subtle} borderColor={T.line} size={28} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>Kitchen Performance</span>
            </div>
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Avg Prep Time', value: '14 min', valueColor: T.ink, tag: 'Target < 20m', tagColor: T.muted },
              { label: 'Longest Waiting Order', value: '27 min', valueColor: T.red, tag: 'SLA Warning', tagColor: T.red },
              { label: 'On-Time Dispatch Rate', value: '96.4%', valueColor: T.ink, tag: '+2.1% vs Yesterday', tagColor: T.muted },
              { label: 'Kitchen Capacity Used', value: '68%', valueColor: T.ink, tag: 'Optimal Flow', tagColor: T.muted },
            ].map(({ label, value, valueColor, tag, tagColor }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: T.subtle, borderRadius: 12,
                border: `1px solid ${T.line}`,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.body, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: 10, color: tagColor, fontWeight: 600, marginTop: 2 }}>{tag}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: valueColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — OPERATIONAL MODULES BELOW MAIN WORKSPACE
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 16, alignItems: 'start',
      }}>

        {/* ── MODULE 1: DISPATCH QUEUE (PRIMARY CARD) ── */}
        <div ref={dispatchRef} style={cardStyle()}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconBadge icon={<Bike size={16} strokeWidth={2.4} />} color={T.ink} bg={T.subtle} borderColor={T.line} size={32} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Dispatch Queue & Rider Fleet</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, color: T.body, background: T.subtle,
                    padding: '2px 7px', borderRadius: 6, border: `1px solid ${T.line}`,
                  }}>
                    PRIMARY HUB
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 1 }}>
                  Live delivery tracking · 2/4 Riders Free
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/riders')}
              style={{
                fontSize: 11.5, fontWeight: 700, color: T.ink, background: T.subtle,
                border: `1px solid ${T.line}`, padding: '4px 10px', borderRadius: 7,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Fleet →
            </button>
          </div>

          <div style={{ padding: '6px 0' }}>
            {liveRiders.map((r, i) => {
              const statusColor = r.status === 'on_delivery' ? T.blue : r.status === 'arriving' ? T.amber : T.green;
              const statusLabel = r.status === 'on_delivery' ? 'On Delivery' : r.status === 'arriving' ? 'Arriving' : 'Available';
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 18px 11px 16px',
                    borderBottom: i < liveRiders.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                    transition: 'background 0.12s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: T.subtle, color: T.ink,
                      border: `1px solid ${T.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>
                      {r.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <Phone size={10} />
                        <span>{r.phone.slice(-10)}</span>
                        <span style={{ color: T.line, margin: '0 2px' }}>·</span>
                        <span style={{ fontWeight: 600, color: T.body }}>{r.order}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: T.body,
                      background: T.subtle, border: `1px solid ${T.line}`,
                      padding: '3px 8px', borderRadius: 6, letterSpacing: '0.02em',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                      {statusLabel}
                    </span>
                    <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 600 }}>{r.eta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MODULE 2: INVENTORY ALERTS ── */}
        <div ref={inventoryRef} style={cardStyle()}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBadge icon={<AlertTriangle size={15} strokeWidth={2.2} />} color={T.ink} bg={T.subtle} borderColor={T.line} size={28} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>Inventory Alerts</span>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              style={{ fontSize: 11, fontWeight: 700, color: T.ink, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Inventory →
            </button>
          </div>

          <div style={{ padding: '6px 0' }}>
            {stockAlerts.slice(0, 3).map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 16px',
                borderBottom: i < stockAlerts.slice(0, 3).length - 1 ? `1px solid ${T.lineSoft}` : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    Current: <strong style={{ color: T.red }}>{item.currentStock} {item.unit}</strong> (Min: {item.minThreshold} {item.unit})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 5 }}>
                  <ActionBtn onClick={() => updateInventoryStock(item.id, item.currentStock + 10)} variant="default">
                    Restock
                  </ActionBtn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MODULE 3: RECENT ACTIVITY TIMELINE ── */}
        <div style={cardStyle()}>
          <div style={{
            padding: '14px 18px', background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${T.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBadge icon={<Activity size={15} strokeWidth={2.2} />} color={T.ink} bg={T.subtle} borderColor={T.line} size={28} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>Recent Activity Timeline</span>
            </div>
          </div>

          <div style={{ padding: '4px 0' }}>
            {liveActivity.length === 0 ? (
              <div style={{ padding: '20px 16px', color: T.muted, fontSize: 12, textAlign: 'center' }}>No activity yet</div>
            ) : liveActivity.map((ev, i, arr) => {
              const isAccept = ev.type === 'accept';
              const isReady  = ev.type === 'ready';
              const isAssign = ev.type === 'assign';
              const isDeli   = ev.type === 'delivery';
              const isCancel = ev.type === 'cancel';
              const tag      = isAccept ? 'ACCEPT' : isReady ? 'READY' : isAssign ? 'ASSIGN' : isDeli ? 'DELIVERY' : isCancel ? 'CANCEL' : 'EVENT';
              const evIcon   = isAccept ? <Check size={12} /> : isReady ? <Flame size={12} /> : isAssign ? <Bike size={12} /> : isDeli ? <Check size={12} /> : <Activity size={12} />;
              const relTime  = (() => { const d = Date.now() - new Date(ev.timestamp).getTime(); const m = Math.round(d / 60000); return m < 1 ? 'Just now' : `${m}m ago`; })();
              return (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '9px 14px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                    transition: 'background 0.12s ease', cursor: 'default',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: T.subtle, color: T.ink, border: `1px solid ${T.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>{evIcon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 }}>
                      <div style={{ fontSize: 12, color: T.ink, fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.005em' }}>{ev.message}</div>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: T.body, background: T.subtle, border: `1px solid ${T.line}`, padding: '1px 5px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.04em' }}>{tag}</span>
                    </div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{relTime}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CREATE NEW ORDER MODAL (COUNTER / WALK-IN)
      ═══════════════════════════════════════════════════ */}
      {showNewOrderModal && (
        <>
          <div
            onClick={() => setShowNewOrderModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 480, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} color={T.brand} /> Create Counter / Walk-in Order
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Order Type Pills */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Order Fulfillment Type</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {(['delivery', 'pickup', 'dine_in'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewOrderType(type)}
                      style={{
                        flex: 1, padding: '7px', fontSize: 11.5, fontWeight: 700, borderRadius: 8,
                        border: `1px solid ${newOrderType === type ? T.brand : T.line}`,
                        background: newOrderType === type ? T.brandSoft : T.subtle,
                        color: newOrderType === type ? T.brand : T.body, cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Guest Name</label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: 12.5, fontWeight: 700,
                      borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Phone Number</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={e => setNewCustomerPhone(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: 12.5, fontWeight: 700,
                      borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Select Items */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Select Menu Items
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {[
                    { name: 'Paneer Butter Masala', price: 340 },
                    { name: 'Chicken Dum Biryani', price: 380 },
                    { name: 'Garlic Butter Naan', price: 75 },
                    { name: 'Mango Lassi Thick', price: 120 },
                  ].map(dish => {
                    const currentQty = selectedDishQty[dish.name] || 0;
                    return (
                      <div key={dish.name} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 10px', background: T.subtle, borderRadius: 8, border: `1px solid ${T.line}`,
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>{dish.name}</div>
                          <div style={{ fontSize: 10.5, color: T.brand, fontWeight: 700 }}>{formatINR(dish.price)}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDishQty({ ...selectedDishQty, [dish.name]: Math.max(0, currentQty - 1) })}
                            style={{
                              width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.line}`,
                              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 800, width: 20, textAlign: 'center' }}>{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedDishQty({ ...selectedDishQty, [dish.name]: currentQty + 1 })}
                            style={{
                              width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.line}`,
                              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Total */}
              <div style={{ background: T.subtle, padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>Total (Incl 5% GST):</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: T.brand }}>
                  {formatINR(
                    Math.round(
                      (selectedDishQty['Paneer Butter Masala'] * 340 +
                        selectedDishQty['Chicken Dum Biryani'] * 380 +
                        selectedDishQty['Garlic Butter Naan'] * 75 +
                        selectedDishQty['Mango Lassi Thick'] * 120) * 1.05
                    )
                  )}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '9px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.grad, border: 'none', borderRadius: 8, cursor: 'pointer',
                    boxShadow: T.glow,
                  }}
                >
                  Create &amp; Dispatch Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  style={{
                    padding: '9px 14px', fontSize: 12, fontWeight: 700, color: T.body,
                    background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          QUICK 86 ITEM MODAL
      ═══════════════════════════════════════════════════ */}
      {showQuick86Modal && (
        <>
          <div
            onClick={() => setShowQuick86Modal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ban size={16} color={T.red} /> Quick 86 Item Controls
              </h3>
              <button onClick={() => setShowQuick86Modal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: T.muted, margin: '0 0 12px' }}>
              Instantly toggle stock availability across all online delivery channels and dine-in.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventory.map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: T.subtle, borderRadius: 8, border: `1px solid ${T.line}`,
                }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink }}>{item.name}</div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Current Qty: {item.currentStock} {item.unit}</div>
                  </div>

                  <button
                    onClick={() => {
                      const nextStock = item.status === 'out_of_stock' ? 10 : 0;
                      updateInventoryStock(item.id, nextStock);
                    }}
                    style={{
                      padding: '4px 10px', fontSize: 10.5, fontWeight: 800, borderRadius: 6,
                      color: item.status === 'out_of_stock' ? T.red : T.green,
                      background: item.status === 'out_of_stock' ? T.redBg : T.greenBg,
                      border: `1px solid ${item.status === 'out_of_stock' ? T.redBorder : T.greenBorder}`,
                      cursor: 'pointer',
                    }}
                  >
                    {item.status === 'out_of_stock' ? 'OUT OF STOCK' : 'IN STOCK'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <button
                onClick={() => setShowQuick86Modal(false)}
                style={{
                  padding: '8px 14px', fontSize: 11.5, fontWeight: 700, color: T.body,
                  background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          REJECT ORDER MODAL
      ═══════════════════════════════════════════════════ */}
      {selectedRejectOrderId && (
        <>
          <div
            onClick={() => setSelectedRejectOrderId(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: T.red, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ban size={16} color={T.red} /> Reject Order
              </h3>
              <button onClick={() => setSelectedRejectOrderId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: T.body, margin: '0 0 12px' }}>
              Please select a cancellation reason to notify customer and partner platform:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                'Kitchen Busy / High Volume',
                'Required Ingredient Out of Stock (86\'d)',
                'Restaurant Closing Soon',
                'Delivery Address Outside Service Radius',
              ].map(reason => (
                <label key={reason} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderRadius: 8, border: `1px solid ${rejectReason === reason ? T.redBorder : T.line}`,
                  background: rejectReason === reason ? T.redBg : T.subtle, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: T.ink,
                }}>
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    style={{ accentColor: T.red }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  if (selectedRejectOrderId) {
                    rejectOrder(selectedRejectOrderId, rejectReason);
                    setSelectedRejectOrderId(null);
                  }
                }}
                style={{
                  flex: 1, padding: '9px', fontSize: 12, fontWeight: 800, color: '#fff',
                  background: T.red, border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setSelectedRejectOrderId(null)}
                style={{
                  padding: '9px 14px', fontSize: 12, fontWeight: 700, color: T.body,
                  background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* SLIDE-IN ORDER DETAILS DRAWER */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAction={(actionName, orderId, targetStatus) => {
            if (actionName.startsWith('Assign Rider') || actionName.startsWith('Assign Partner')) {
              navigate('/delivery');
            } else if (orderId && targetStatus) {
              handleUpdateStatus(orderId, targetStatus);
            }
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

