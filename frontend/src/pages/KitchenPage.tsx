import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  PackageCheck,
  User,
  Printer,
  Zap,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useOrders } from '../context/OrderContext';

// Design Tokens (Enterprise SaaS Palette)
const T = {
  brand: '#FF7A30',
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

  card: '#FFFFFF',
  subtle: '#F8FAFC',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  light: '#94A3B8',
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',

  shadowCard: '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
  shadowHover: '0 10px 28px rgba(15, 23, 42, 0.09)',
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

export interface KOTTicketItem {
  id: string;
  name: string;
  quantity: number;
  isVeg: boolean;
  notes?: string;
  completed: boolean;
}

export interface KOTTicket {
  id: string;
  orderId?: string;           // links to global Order.id
  orderNumber: string;
  tableOrChannel: string;
  customerName: string;
  station: 'Tandoor & Bread' | 'Curry & Biryani' | 'Appetizers & Starters' | 'Beverages';
  chefName: string;
  priority: 'high' | 'normal';
  prepTimeMinutes: number;
  elapsedMinutes: number;
  items: KOTTicketItem[];
  status: 'cooking' | 'ready' | 'delivered';
}

const initialKOTs: KOTTicket[] = [
  {
    id: 'kot-101',
    orderId: 'ord-1001',
    orderNumber: '#FIC-8891',
    tableOrChannel: 'Online Delivery',
    customerName: 'Aarav Mehta',
    station: 'Curry & Biryani',
    chefName: 'Chef Ramesh',
    priority: 'high',
    prepTimeMinutes: 15,
    elapsedMinutes: 8,
    status: 'ready', // Staged at top
    items: [
      { id: 'ki-1', name: 'Paneer Butter Masala', quantity: 2, isVeg: true, notes: 'Extra butter, medium spicy', completed: true },
      { id: 'ki-2', name: 'Butter Naan', quantity: 4, isVeg: true, notes: 'Make extra crisp', completed: true },
      { id: 'ki-3', name: 'Jeera Rice', quantity: 1, isVeg: true, completed: true },
    ],
  },
  {
    id: 'kot-102',
    orderId: 'ord-1002',
    orderNumber: '#FIC-8890',
    tableOrChannel: 'Direct Web Order',
    customerName: 'Priya Sharma',
    station: 'Curry & Biryani',
    chefName: 'Chef Vikram',
    priority: 'normal',
    prepTimeMinutes: 20,
    elapsedMinutes: 14,
    status: 'ready', // Staged at top
    items: [
      { id: 'ki-4', name: 'Chicken Dum Biryani (Full)', quantity: 2, isVeg: false, notes: 'With extra Mirchi Ka Salan', completed: true },
      { id: 'ki-5', name: 'Mango Lassi', quantity: 1, isVeg: true, completed: true },
    ],
  },
  {
    id: 'kot-103',
    orderId: 'ord-1003',
    orderNumber: '#FIC-8889',
    tableOrChannel: 'Counter Pickup',
    customerName: 'Rohan Gupta',
    station: 'Tandoor & Bread',
    chefName: 'Chef Suresh',
    priority: 'high',
    prepTimeMinutes: 12,
    elapsedMinutes: 11,
    status: 'cooking',
    items: [
      { id: 'ki-6', name: 'Dal Makhani Slow Cooked', quantity: 1, isVeg: true, completed: true },
      { id: 'ki-7', name: 'Garlic Naan', quantity: 2, isVeg: true, completed: true },
      { id: 'ki-8', name: 'Gulab Jamun (2 pcs)', quantity: 1, isVeg: true, completed: false },
    ],
  },
  {
    id: 'kot-104',
    orderNumber: '#FIC-8888',
    tableOrChannel: 'Dine-In Table 4',
    customerName: 'Kavita Singh',
    station: 'Appetizers & Starters',
    chefName: 'Chef Ramesh',
    priority: 'normal',
    prepTimeMinutes: 10,
    elapsedMinutes: 4,
    status: 'cooking',
    items: [
      { id: 'ki-9', name: 'Masala Dosa', quantity: 2, isVeg: true, notes: 'Filter Coffee with less sugar', completed: false },
      { id: 'ki-10', name: 'Filter Coffee', quantity: 2, isVeg: true, completed: false },
    ],
  },
  {
    id: 'kot-105',
    orderNumber: '#FIC-8887',
    tableOrChannel: 'Dine-In Table 7',
    customerName: 'Sanjay Kumar',
    station: 'Tandoor & Bread',
    chefName: 'Chef Suresh',
    priority: 'normal',
    prepTimeMinutes: 15,
    elapsedMinutes: 6,
    status: 'cooking',
    items: [
      { id: 'ki-11', name: 'Tandoori Roti', quantity: 6, isVeg: true, completed: true },
      { id: 'ki-12', name: 'Kadai Paneer', quantity: 1, isVeg: true, notes: 'No capsicum', completed: false },
    ],
  },
  {
    id: 'kot-106',
    orderNumber: '#FIC-8886',
    tableOrChannel: 'Magicpin Delivery',
    customerName: 'Deepak Patel',
    station: 'Curry & Biryani',
    chefName: 'Chef Vikram',
    priority: 'high',
    prepTimeMinutes: 18,
    elapsedMinutes: 16,
    status: 'cooking',
    items: [
      { id: 'ki-13', name: 'Mutton Rogan Josh', quantity: 1, isVeg: false, notes: 'Extra gravy', completed: false },
      { id: 'ki-14', name: 'Butter Roti', quantity: 4, isVeg: true, completed: false },
    ],
  },
  {
    id: 'kot-107',
    orderNumber: '#FIC-8885',
    tableOrChannel: 'Counter Pickup',
    customerName: 'Meera Reddy',
    station: 'Beverages',
    chefName: 'Chef Anita',
    priority: 'normal',
    prepTimeMinutes: 8,
    elapsedMinutes: 2,
    status: 'cooking',
    items: [
      { id: 'ki-15', name: 'Sweet Lassi', quantity: 2, isVeg: true, completed: false },
      { id: 'ki-16', name: 'Rasmalai (2 pcs)', quantity: 1, isVeg: true, completed: false },
    ],
  },
  {
    id: 'kot-108',
    orderNumber: '#FIC-8884',
    tableOrChannel: 'Online Delivery',
    customerName: 'Anil Kapoor',
    station: 'Curry & Biryani',
    chefName: 'Chef Ramesh',
    priority: 'normal',
    prepTimeMinutes: 15,
    elapsedMinutes: 9,
    status: 'cooking',
    items: [
      { id: 'ki-17', name: 'Butter Chicken (Half)', quantity: 1, isVeg: false, completed: true },
      { id: 'ki-18', name: 'Garlic Naan', quantity: 3, isVeg: true, completed: false },
    ],
  },
];

export const KitchenPage: React.FC = () => {
  const { orders, markReady: globalMarkReady } = useOrders();
  const [kots, setKots] = useState<KOTTicket[]>(initialKOTs);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    setIsSyncing(true);
    const latestOrders = orders.filter(o => ['new', 'preparing'].includes(o.status));

    const generatedKots: KOTTicket[] = latestOrders.map(o => ({
      id: `kot-${o.id}`,
      orderNumber: o.orderNumber,
      tableOrChannel: `${o.deliveryType.toUpperCase()} (${o.customerName})`,
      customerName: o.customerName,
      station: o.items.some(i => i.name.includes('Naan') || i.name.includes('Roti')) ? 'Tandoor & Bread' : 'Curry & Biryani',
      chefName: 'Chef Ramesh',
      priority: o.totalAmount > 600 ? 'high' : 'normal',
      prepTimeMinutes: o.estimatedPrepTime || 15,
      elapsedMinutes: 2,
      status: o.status === 'preparing' ? 'cooking' : 'cooking',
      items: o.items.map((item, idx) => ({
        id: `ki-${idx + 1}`,
        name: item.name,
        quantity: item.quantity,
        isVeg: item.isVeg,
        completed: false,
      })),
    }));

    setKots(prev => {
      const existingIds = new Set(prev.map(k => k.id));
      const newItems = generatedKots.filter(k => !existingIds.has(k.id));
      return [...newItems, ...prev];
    });

    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsSyncing(false);
  }, [orders]);

  const handleToggleItemDone = (kotId: string, itemId: string) => {
    setKots((prev) =>
      prev.map((kot) => {
        if (kot.id === kotId) {
          const updatedItems = kot.items.map((it) =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          );
          return { ...kot, items: updatedItems };
        }
        return kot;
      })
    );
  };

  const handleAssignChef = (kotId: string, chefName: string) => {
    setKots((prev) =>
      prev.map((kot) => (kot.id === kotId ? { ...kot, chefName } : kot))
    );
    addToast('Chef Assigned', `${chefName} assigned to Ticket ${kotId.toUpperCase()}`, 'info');
  };

  const handleMarkKotReady = (kotId: string, _orderNumber: string, orderId?: string) => {
    setKots((prev) =>
      prev.map((kot) => (kot.id === kotId ? { ...kot, status: 'ready' } : kot))
    );
    // Propagate to global workflow context if we have the orderId
    if (orderId) globalMarkReady(orderId);
  };

  const handlePrintKOTSlip = (orderNumber: string) => {
    addToast('Printing KOT Slip', `Thermal KOT printed for Order ${orderNumber}`, 'info');
  };

  const activeKots = kots.filter((k) => k.status === 'cooking');
  const readyKots = kots.filter((k) => k.status === 'ready');
  const rushKots = activeKots.filter((k) => k.priority === 'high');

  let filteredKots = activeKots;
  if (selectedStation !== 'all') {
    filteredKots = filteredKots.filter((k) => k.station === selectedStation);
  }
  if (priorityFilter !== 'all') {
    filteredKots = filteredKots.filter((k) => k.priority === priorityFilter);
  }

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. COMPACT KITCHEN STATUS BAR (CURVED RADIUS 28PX)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '12px 18px', borderRadius: 28 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

          {/* Left: Title & Sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: T.grad, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.glow, flexShrink: 0,
            }}>
              <ChefHat size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  Kitchen Display Center
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, color: T.muted, background: T.subtle,
                  padding: '2px 8px', borderRadius: 9999, border: `1px solid ${T.line}`,
                }}>
                  <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} color={T.brand} />
                  {lastSyncTime}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Compact Metrics Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: T.subtle, padding: '6px 16px', borderRadius: 9999,
            border: `1px solid ${T.line}`, flexWrap: 'wrap',
          }}>
            {/* 1. Active KOTs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} color={T.brand} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active KOTs</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums' }}>
                  {activeKots.length}
                </span>
              </div>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            {/* 2. Rush Orders */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color={T.red} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rush Orders</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.red, fontVariantNumeric: 'tabular-nums' }}>
                  {rushKots.length}
                </span>
              </div>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            {/* 3. Avg Prep Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} color={T.amber} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Prep Time</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                  14m <span style={{ fontSize: 10, color: T.green, fontWeight: 700 }}>(-2m)</span>
                </span>
              </div>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            {/* 4. Ready for Pickup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackageCheck size={13} color={T.green} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ready for Pickup</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums' }}>
                  {readyKots.length}
                </span>
              </div>
            </div>

            <span style={{ width: 1, height: 18, background: T.line }} />

            {/* 5. Printer Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={13} color={T.green} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Printer Status</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: T.green }}>
                  ● Online
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => addToast('Kitchen Alert Sent', 'All station chefs nudged for active orders', 'warning')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', background: T.amberBg, color: T.amber,
                border: `1px solid ${T.amberBorder}`, borderRadius: 9999,
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Volume2 size={13} /> Nudge Cooks
            </button>
            <button
              onClick={() => handlePrintKOTSlip('BATCH_ALL')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', background: T.subtle, color: T.body,
                border: `1px solid ${T.line}`, borderRadius: 9999,
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Printer size={13} /> Batch KOT Print
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. STAGED READY FOR PICKUP QUEUE (MOVED TO TOP FOR EASY CONVENIENCE & QUICK DISPATCH)
      ═══════════════════════════════════════════════════ */}
      {readyKots.length > 0 && (
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 28, background: '#FAFFFC', borderColor: T.greenBorder })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PackageCheck size={17} color={T.green} /> Staged Ready-for-Pickup KOTs ({readyKots.length})
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: '2px 8px', borderRadius: 9999 }}>
              Counter Staging Gate 1
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {readyKots.map((rk) => (
              <div
                key={rk.id}
                style={{
                  padding: '14px 16px', background: T.greenBg, borderRadius: 20,
                  border: `1px solid ${T.greenBorder}`, display: 'flex', flexDirection: 'column', gap: 6,
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 13.5, color: T.green }}>{rk.orderNumber}</strong>
                  <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: '#fff', padding: '1px 6px', borderRadius: 9999 }}>
                    STAGED
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.body, fontWeight: 600 }}>
                  {rk.customerName} · {rk.tableOrChannel}
                </div>
                <button
                  onClick={() => {
                    setKots((prev) => prev.filter((k) => k.id !== rk.id));
                    addToast('Dispatched', `Order ${rk.orderNumber} handed over to delivery rider`, 'info');
                  }}
                  style={{
                    padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff',
                    background: T.green, border: 'none', borderRadius: 9999, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 2,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <PackageCheck size={13} /> Handover Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          3. COMPACT STATION & PRIORITY FILTERS (CURVED RADIUS 28PX)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '10px 16px', background: T.card, borderRadius: 28 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

          {/* Station Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
              STATIONS:
            </span>
            {[
              { id: 'all', label: 'All Stations', count: activeKots.length },
              { id: 'Curry & Biryani', label: 'Curry & Biryani', count: activeKots.filter(k => k.station === 'Curry & Biryani').length },
              { id: 'Tandoor & Bread', label: 'Tandoor & Bread', count: activeKots.filter(k => k.station === 'Tandoor & Bread').length },
              { id: 'Appetizers & Starters', label: 'Appetizers', count: activeKots.filter(k => k.station === 'Appetizers & Starters').length },
              { id: 'Beverages', label: 'Beverages', count: activeKots.filter(k => k.station === 'Beverages').length },
            ].map(st => {
              const isActive = selectedStation === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  style={{
                    height: 36, padding: '0 16px', fontSize: 12.5, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${isActive ? T.brand : T.line}`,
                    background: isActive ? T.brandSoft : T.subtle,
                    color: isActive ? T.brand : T.body,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.12s ease',
                  }}
                >
                  {st.label}
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, padding: '1px 7px', borderRadius: 9999,
                    background: isActive ? T.brand : T.line, color: isActive ? '#fff' : T.muted,
                  }}>
                    {st.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Priority Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
              PRIORITY:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'high', label: '🔴 Rush Only' },
              { id: 'normal', label: '⚪ Normal' },
            ].map(pr => {
              const isActive = priorityFilter === pr.id;
              return (
                <button
                  key={pr.id}
                  onClick={() => setPriorityFilter(pr.id)}
                  style={{
                    height: 36, padding: '0 14px', fontSize: 12, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${isActive ? T.brand : T.line}`,
                    background: isActive ? T.brandSoft : T.subtle,
                    color: isActive ? T.brand : T.body,
                    cursor: 'pointer', transition: 'all 0.12s ease',
                  }}
                >
                  {pr.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          4. UNIFORM EQUAL-SIZE KOT CARDS (HEIGHT: 320PX & CURVED RADIUS 28PX)
      ═══════════════════════════════════════════════════ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} color={T.brand} />
            <span style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>
              Active Cooking Tickets ({filteredKots.length})
            </span>
          </div>
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>
            Check off items as cooks finish preparation · Click Mark Ready when complete
          </span>
        </div>

        {filteredKots.length === 0 ? (
          <div style={cardStyle({ padding: 36, textAlign: 'center', color: T.muted, borderRadius: 28 })}>
            <CheckCircle2 size={36} color={T.green} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 2 }}>
              All KOT Tickets Completed!
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              No active cooking tickets match selected station or priority filter.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: 16,
          }}>
            {filteredKots.map((kot) => {
              const allDone = kot.items.every((it) => it.completed);
              const remainingMin = kot.prepTimeMinutes - kot.elapsedMinutes;
              const isUrgent = remainingMin <= 3 || kot.priority === 'high';

              return (
                <div
                  key={kot.id}
                  style={{
                    background: T.card,
                    borderRadius: 28, // CURVED MORE (28px)
                    height: 320, // EQUAL HEIGHT FOR ALL CARDS
                    border: `1px solid ${isUrgent ? T.redBorder : T.line}`,
                    boxShadow: isUrgent ? '0 4px 16px rgba(239, 68, 68, 0.08)' : T.shadowCard,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = T.shadowHover;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = isUrgent ? '0 4px 16px rgba(239, 68, 68, 0.08)' : T.shadowCard;
                  }}
                >
                  {/* KOT Card Header */}
                  <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${T.lineSoft}`, flexShrink: 0 }}>
                    {/* Top Row: Order # + Channel Badge + Priority + Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: T.brand, letterSpacing: '-0.02em' }}>
                          {kot.orderNumber}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: T.body, background: T.subtle,
                          border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 9999,
                          whiteSpace: 'nowrap',
                        }}>
                          {kot.tableOrChannel}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {kot.priority === 'high' ? (
                          <span style={{
                            fontSize: 9.5, fontWeight: 800, color: T.red, background: T.redBg,
                            border: `1px solid ${T.redBorder}`, padding: '2px 8px', borderRadius: 9999,
                            letterSpacing: '0.04em', whiteSpace: 'nowrap',
                          }}>
                            RUSH
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 9.5, fontWeight: 700, color: T.muted, background: T.subtle,
                            padding: '2px 8px', borderRadius: 9999, whiteSpace: 'nowrap',
                          }}>
                            NORMAL
                          </span>
                        )}

                        <span style={{
                          fontSize: 10.5, fontWeight: 800,
                          color: remainingMin <= 3 ? T.red : T.green,
                          background: remainingMin <= 3 ? T.redBg : T.greenBg,
                          border: `1px solid ${remainingMin <= 3 ? T.redBorder : T.greenBorder}`,
                          padding: '2px 8px', borderRadius: 9999,
                          whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
                        }}>
                          ⏱ {remainingMin > 0 ? `${remainingMin}m left` : 'OVERDUE'}
                        </span>
                      </div>
                    </div>

                    {/* Station & Chef Assignment Bar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 11, color: T.muted, background: T.subtle,
                      padding: '6px 12px', borderRadius: 9999, border: `1px solid ${T.lineSoft}`,
                    }}>
                      <span>Station: <strong style={{ color: T.ink }}>{kot.station}</strong></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={11} color={T.muted} />
                        <select
                          value={kot.chefName}
                          onChange={(e) => handleAssignChef(kot.id, e.target.value)}
                          style={{
                            border: 'none', background: 'transparent',
                            fontSize: 11, fontWeight: 700, color: T.ink,
                            cursor: 'pointer', outline: 'none', padding: 0,
                          }}
                        >
                          <option value="Chef Ramesh">Chef Ramesh</option>
                          <option value="Chef Vikram">Chef Vikram</option>
                          <option value="Chef Suresh">Chef Suresh</option>
                          <option value="Chef Anita">Chef Anita</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* KOT Items Checklist */}
                  <div style={{
                    padding: '10px 16px', flex: 1, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    {kot.items.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => handleToggleItemDone(kot.id, it.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '8px 12px',
                          background: it.completed ? T.subtle : '#ffffff',
                          borderRadius: 14,
                          border: `1px solid ${it.completed ? T.lineSoft : T.line}`,
                          cursor: 'pointer', transition: 'all 0.12s ease',
                          opacity: it.completed ? 0.65 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={it.completed}
                          onChange={() => {}}
                          style={{ cursor: 'pointer', accentColor: T.brand, width: 15, height: 15, marginTop: 1, flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: 12.5, fontWeight: it.completed ? 500 : 700,
                              color: it.completed ? T.light : T.ink,
                              textDecoration: it.completed ? 'line-through' : 'none',
                            }}>
                              <strong style={{ color: it.completed ? T.light : T.brand, fontSize: 13, marginRight: 4 }}>
                                {it.quantity}×
                              </strong>
                              {it.name}
                            </span>
                            <span style={{
                              width: 7, height: 7, borderRadius: '50%',
                              background: it.isVeg ? T.green : T.red,
                              display: 'inline-block', flexShrink: 0, marginLeft: 6,
                            }} title={it.isVeg ? 'Vegetarian' : 'Non-Veg'} />
                          </div>

                          {it.notes && (
                            <div style={{
                              fontSize: 11, color: T.amber, fontWeight: 600,
                              marginTop: 2, fontStyle: 'italic',
                            }}>
                              ✎ {it.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* KOT Action Bar */}
                  <div style={{
                    padding: '12px 18px', background: T.card,
                    borderTop: `1px solid ${T.lineSoft}`,
                    display: 'flex', gap: 8, flexShrink: 0,
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintKOTSlip(kot.orderNumber);
                      }}
                      title="Print KOT Slip"
                      style={{
                        width: 42, height: 42, padding: 0, background: T.subtle, color: T.body,
                        border: `1px solid ${T.line}`, borderRadius: 9999,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkKotReady(kot.id, kot.orderNumber, kot.orderId);
                      }}
                      style={{
                        flex: 1, height: 42, padding: '0 16px',
                        fontSize: 13, fontWeight: 800, borderRadius: 9999,
                        border: 'none', cursor: 'pointer',
                        background: allDone ? T.greenBg : T.grad,
                        color: allDone ? T.green : '#fff',
                        borderWidth: allDone ? 1 : 0,
                        borderStyle: 'solid',
                        borderColor: allDone ? T.greenBorder : 'transparent',
                        boxShadow: allDone ? 'none' : '0 3px 10px rgba(255,122,48,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CheckCircle2 size={16} strokeWidth={2.5} />
                      {allDone ? 'Mark Ready for Pickup' : 'Mark Ready'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
