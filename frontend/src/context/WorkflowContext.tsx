import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  Order, OrderStatus, OrderItem, InventoryItem, Customer, ActivityEvent,
  SharedRider, SharedDispatchOrder, WorkflowEvent,
} from '../types';
import { mockOrders } from '../mock/orders';
import { mockInventory } from '../mock/inventory';
import { mockCustomers } from '../mock/customers';
import { mockRiders } from '../mock/riders';
import { orderEngine, playNewOrderChime } from '../services/orderEngine';
import { apiService } from '../services/api';
import { useLocalStorage } from '../utils/storage';
import { formatINR } from '../utils/formatters';

// ─── Pre-seeded dispatch orders for the already-in-flight deliveries ──────────
const SEED_DISPATCH: SharedDispatchOrder[] = [
  {
    id: 'do-101', orderId: 'ord-1001', orderNumber: '#FIC-8891',
    channel: 'Online Delivery', customerName: 'Aarav Mehta', customerPhone: '+91 98201 11223',
    deliveryAddress: 'Flat 402, NeoTown Apartments, Tower 4, Electronic City Ph 1, Bengaluru',
    itemsSummary: '2× Paneer Butter Masala, 4× Butter Naan, 1× Jeera Rice',
    totalAmount: 1040, assignmentStatus: 'unassigned',
    pickupOtp: '4891', etaMinutes: 18, distanceKm: 2.4,
    dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stagedMinutes: 0,
  },
  {
    id: 'do-103', orderId: 'ord-1003', orderNumber: '#FIC-8889',
    channel: 'Direct Web', customerName: 'Rohan Gupta', customerPhone: '+91 97112 88776',
    deliveryAddress: 'SJR Equinox, Plot 51, Electronic City Phase 1, Bengaluru',
    itemsSummary: '1× Dal Makhani, 2× Garlic Naan, 1× Gulab Jamun',
    totalAmount: 520, assignmentStatus: 'unassigned',
    pickupOtp: '8889', etaMinutes: 8, distanceKm: 1.5,
    dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stagedMinutes: 2,
  },
];

// ─── Seed activity log (recent events) ───────────────────────────────────────
const SEED_ACTIVITY: ActivityEvent[] = [
  { id: 'act-1', type: 'accept', message: 'Order #FIC-8890 accepted & sent to Kitchen', orderNumber: '#FIC-8890', timestamp: new Date(Date.now() - 14 * 60000).toISOString() },
  { id: 'act-2', type: 'cooking', message: 'Kitchen prep started for #FIC-8890 (Priya Sharma)', orderNumber: '#FIC-8890', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'act-3', type: 'ready', message: '#FIC-8889 packed & staged — Ready for Pickup', orderNumber: '#FIC-8889', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
];

// ─── Context Shape ────────────────────────────────────────────────────────────
export interface WorkflowContextType {
  // Data
  orders: Order[];
  inventory: InventoryItem[];
  customers: Customer[];
  riders: SharedRider[];
  dispatchOrders: SharedDispatchOrder[];
  activityLog: ActivityEvent[];
  isOnline: boolean;

  // Setters (for compat with existing pages)
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setIsOnline: (online: boolean) => void;

  // ── Workflow actions ──────────────────────────────────────────────
  /** New → Preparing: auto-creates KOT, logs event */
  acceptOrder: (orderId: string) => void;
  /** Reject order: New → Cancelled */
  rejectOrder: (orderId: string, reason?: string) => void;
  /** Explicitly start cooking (Preparing → stays preparing, logs event) */
  startCooking: (orderId: string) => void;
  /** Kitchen marks ready: Preparing → Ready + auto-creates DispatchOrder (delivery orders) */
  markReady: (orderId: string) => void;
  /** Assign rider: Ready → Assigned; rider → picking_up */
  assignRider: (orderId: string, rider: SharedRider) => void;
  /** Rider accepted on app: Assigned → rider_accepted */
  riderAccept: (orderId: string) => void;
  /** Rider at restaurant: → rider_arrived */
  riderArrived: (orderId: string) => void;
  /** OTP verified & handed over: → out_for_delivery; rider → on_delivery */
  handoverOrder: (orderId: string) => void;
  /** Mark out-for-delivery (alias for handoverOrder for pickup/dine_in) */
  startDelivery: (orderId: string) => void;
  /** Mark delivered: → delivered; rider → available; customer stats++ */
  markDelivered: (orderId: string) => void;
  /** Cancel from any state */
  cancelOrder: (orderId: string, reason?: string) => void;
  /** Manual rider status change (RidersPage) */
  updateRiderStatus: (riderId: string, status: SharedRider['liveStatus']) => void;
  /** Create new order (POS / walk-in) */
  createNewOrder: (partial: Partial<Order> & { items: OrderItem[] }) => void;
  /** Trigger instant mock order */
  triggerInstantMockOrder: () => void;
  /** Update inventory item stock */
  updateInventoryStock: (itemId: string, newStock: number) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────
let actIdCounter = 100;
const newActId = () => `act-${++actIdCounter}-${Date.now()}`;

const nowISO = () => new Date().toISOString();
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function makeOtp(orderNumber: string): string {
  const digits = orderNumber.replace(/\D/g, '');
  return digits.slice(-4) || '0000';
}

function makeDispatchFromOrder(order: Order): SharedDispatchOrder {
  return {
    id: `do-${Date.now()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    channel: 'Direct Web',
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryAddress: 'Customer Address (provided at checkout)',
    itemsSummary: order.items.map(i => `${i.quantity}× ${i.name}`).join(', '),
    totalAmount: order.totalAmount,
    assignmentStatus: 'unassigned',
    pickupOtp: makeOtp(order.orderNumber),
    etaMinutes: 18,
    distanceKm: +(Math.random() * 4 + 0.5).toFixed(1),
    dispatchTime: nowTime(),
    stagedMinutes: 0,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useLocalStorage<boolean>('fic_restaurant_online', true);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [riders, setRiders] = useState<SharedRider[]>(mockRiders);
  const [dispatchOrders, setDispatchOrders] = useState<SharedDispatchOrder[]>(SEED_DISPATCH);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>(SEED_ACTIVITY);

  // Keep a stable ref to riders/orders for use inside callbacks without stale closures
  const ordersRef = useRef(orders);
  const ridersRef = useRef(riders);
  const dispatchRef = useRef(dispatchOrders);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  useEffect(() => { ridersRef.current = riders; }, [riders]);
  useEffect(() => { dispatchRef.current = dispatchOrders; }, [dispatchOrders]);

  // Initial Backend API Sync on startup
  useEffect(() => {
    let isMounted = true;
    async function syncBackendData() {
      const health = await apiService.checkHealth();
      if (health && (health as any).status === 'online') {
        const [backendOrders, backendInventory, backendRiders] = await Promise.all([
          apiService.getOrders(),
          apiService.getInventory(),
          apiService.getRiders(),
        ]);
        if (isMounted) {
          if (Array.isArray(backendOrders) && backendOrders.length > 0) setOrders(backendOrders);
          if (Array.isArray(backendInventory) && backendInventory.length > 0) setInventory(backendInventory);
          if (Array.isArray(backendRiders) && backendRiders.length > 0) setRiders(backendRiders);
        }
      }
    }
    syncBackendData();
    return () => { isMounted = false; };
  }, []);

  // ── Log helper ──────────────────────────────────────────────────────────────
  const logActivity = useCallback((event: Omit<ActivityEvent, 'id'>) => {
    setActivityLog(prev => [{ ...event, id: newActId() }, ...prev].slice(0, 30));
  }, []);

  // ── Order timeline helper ───────────────────────────────────────────────────
  const pushOrderEvent = useCallback((
    orderId: string, status: OrderStatus, actor?: string, note?: string
  ) => {
    const ev: WorkflowEvent = { status, timestamp: nowISO(), actor, note };
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, timeline: [...(o.timeline || []), ev] } : o
    ));
  }, []);

  // ── Mock order engine ───────────────────────────────────────────────────────
  useEffect(() => {
    orderEngine.setOnlineStatus(isOnline);
    const unsubscribe = orderEngine.subscribe((newOrder, updatedInventory) => {
      const orderWithTimeline: Order = {
        ...newOrder,
        timeline: [{ status: 'new', timestamp: nowISO(), note: 'Incoming order' }],
      };
      setOrders(prev => [orderWithTimeline, ...prev]);
      setInventory(updatedInventory);
      setCustomers(prev => {
        const idx = prev.findIndex(c => c.name === newOrder.customerName);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], totalOrders: updated[idx].totalOrders + 1, totalSpent: updated[idx].totalSpent + newOrder.totalAmount };
          return updated;
        }
        return prev;
      });
      logActivity({ type: 'new_order', message: `New order ${newOrder.orderNumber} received from ${newOrder.customerName} (${formatINR(newOrder.totalAmount)})`, orderNumber: newOrder.orderNumber, timestamp: nowISO() });
    });
    return () => { unsubscribe(); orderEngine.stopEngine(); };
  }, [isOnline, logActivity]);

  // ─── WORKFLOW ACTIONS ──────────────────────────────────────────────────────

  const acceptOrder = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'preparing', 'Manager', 'Accepted & KOT sent to Kitchen');
    apiService.updateOrderStatus(orderId, 'preparing').catch(() => {});
    logActivity({ type: 'accept', message: `Order ${order.orderNumber} accepted — KOT sent to Kitchen (${order.customerName})`, orderNumber: order.orderNumber, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const rejectOrder = useCallback((orderId: string, reason = 'Kitchen Busy') => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'cancelled', 'Manager', reason);
    apiService.updateOrderStatus(orderId, 'cancelled').catch(() => {});
    logActivity({ type: 'cancel', message: `Order ${order.orderNumber} rejected — ${reason}`, orderNumber: order.orderNumber, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const startCooking = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'preparing', 'Kitchen', 'Cooking started');
    apiService.updateOrderStatus(orderId, 'preparing').catch(() => {});
    // Deduct inventory for cooking ingredients (simplified: find items by name match)
    setInventory(prev => prev.map(item => {
      const match = order.items.find(i => item.name.toLowerCase().includes(i.name.split(' ')[0].toLowerCase()));
      if (match) {
        const deduct = Math.min(match.quantity * 0.3, item.currentStock);
        const newStock = Math.max(0, item.currentStock - deduct);
        const newStatus = newStock <= 0 ? 'out_of_stock' : newStock <= item.minThreshold ? 'low_stock' : 'in_stock';
        apiService.updateInventoryStock(item.id, newStock).catch(() => {});
        return { ...item, currentStock: +newStock.toFixed(2), status: newStatus, lastUpdated: new Date().toLocaleDateString() };
      }
      return item;
    }));
    logActivity({ type: 'cooking', message: `Kitchen prep started for ${order.orderNumber} (${order.customerName})`, orderNumber: order.orderNumber, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const markReady = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'ready', 'Kitchen', 'Packed & staged at counter');
    apiService.updateOrderStatus(orderId, 'ready').catch(() => {});
    logActivity({ type: 'ready', message: `${order.orderNumber} ready — staged at counter (${order.customerName})`, orderNumber: order.orderNumber, timestamp: nowISO() });
    // Auto-create dispatch entry for delivery orders
    if (order.deliveryType === 'delivery') {
      const existing = dispatchRef.current.find(d => d.orderId === orderId);
      if (!existing) {
        const dispatch = makeDispatchFromOrder(order);
        setDispatchOrders(prev => [dispatch, ...prev]);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, dispatchId: dispatch.id } : o));
      }
    }
  }, [pushOrderEvent, logActivity]);

  const assignRider = useCallback((orderId: string, rider: SharedRider) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;

    // Update order
    const ev: WorkflowEvent = { status: 'assigned', timestamp: nowISO(), actor: rider.name, note: `Rider ${rider.riderCode} assigned` };
    setOrders(prev => prev.map(o =>
      o.id === orderId ? {
        ...o, status: 'assigned',
        assignedRiderId: rider.id, assignedRiderName: rider.name,
        assignedRiderPhone: rider.phone, assignedRiderCode: rider.riderCode,
        timeline: [...(o.timeline || []), ev],
      } : o
    ));

    // Update dispatch order
    setDispatchOrders(prev => prev.map(d =>
      d.orderId === orderId ? {
        ...d, assignmentStatus: 'assigned',
        riderId: rider.id, riderName: rider.name, riderPhone: rider.phone,
        riderCode: rider.riderCode, fleetProvider: rider.fleetType,
      } : d
    ));

    // Rider → picking_up
    setRiders(prev => prev.map(r =>
      r.id === rider.id ? { ...r, liveStatus: 'picking_up', currentAssignment: `${order.orderNumber} (${order.customerName})`, liveEtaOrDist: `⏱ Heading to outlet` } : r
    ));

    logActivity({ type: 'assign', message: `${rider.name} (${rider.riderCode}) assigned to ${order.orderNumber}`, orderNumber: order.orderNumber, riderName: rider.name, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const riderAccept = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'rider_accepted', order.assignedRiderName, 'Rider accepted order on app');
    setRiders(prev => prev.map(r => r.id === order.assignedRiderId ? { ...r, liveStatus: 'picking_up' } : r));
    logActivity({ type: 'pickup', message: `${order.assignedRiderName || 'Rider'} accepted ${order.orderNumber} — heading to restaurant`, orderNumber: order.orderNumber, riderName: order.assignedRiderName, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const riderArrived = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'rider_arrived', order.assignedRiderName, 'Rider arrived at restaurant');
    setDispatchOrders(prev => prev.map(d => d.orderId === orderId ? { ...d, assignmentStatus: 'at_store' } : d));
    logActivity({ type: 'pickup', message: `${order.assignedRiderName || 'Rider'} arrived at restaurant for ${order.orderNumber}`, orderNumber: order.orderNumber, riderName: order.assignedRiderName, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const handoverOrder = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    const ev: WorkflowEvent = { status: 'out_for_delivery', timestamp: nowISO(), actor: order.assignedRiderName, note: 'OTP verified, order handed over' };
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'out_for_delivery', timeline: [...(o.timeline || []), ev] } : o
    ));
    setDispatchOrders(prev => prev.map(d => d.orderId === orderId ? { ...d, assignmentStatus: 'in_transit' } : d));
    setRiders(prev => prev.map(r =>
      r.id === order.assignedRiderId ? { ...r, liveStatus: 'on_delivery', currentAssignment: `${order.orderNumber} — Out for delivery`, liveEtaOrDist: `⏱ En route to customer` } : r
    ));
    logActivity({ type: 'delivery', message: `${order.orderNumber} handed over to ${order.assignedRiderName || 'rider'} — Out for delivery`, orderNumber: order.orderNumber, riderName: order.assignedRiderName, timestamp: nowISO() });
  }, [logActivity]);

  const startDelivery = useCallback((orderId: string) => {
    handoverOrder(orderId);
  }, [handoverOrder]);

  const markDelivered = useCallback((orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    const ev: WorkflowEvent = { status: 'delivered', timestamp: nowISO(), note: 'Delivered successfully' };
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'delivered', timeline: [...(o.timeline || []), ev] } : o
    ));
    setDispatchOrders(prev => prev.map(d => d.orderId === orderId ? { ...d, assignmentStatus: 'delivered' } : d));

    // Rider → available
    if (order.assignedRiderId) {
      setRiders(prev => prev.map(r =>
        r.id === order.assignedRiderId ? {
          ...r, liveStatus: 'available',
          currentAssignment: 'None (Idle at Outlet)',
          liveEtaOrDist: '📍 Returning to outlet',
          deliveriesToday: r.deliveriesToday + 1,
          earningsToday: r.earningsToday + Math.round(order.totalAmount * 0.08),
          lastDelivery: `${order.orderNumber} (Completed just now)`,
        } : r
      ));
    }

    // Customer stats++
    setCustomers(prev => {
      const idx = prev.findIndex(c =>
        c.name === order.customerName || c.phone === order.customerPhone
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          totalOrders: updated[idx].totalOrders + 1,
          totalSpent: updated[idx].totalSpent + order.totalAmount,
        };
        return updated;
      }
      return prev;
    });

    logActivity({ type: 'delivery', message: `${order.orderNumber} delivered to ${order.customerName} — ${formatINR(order.totalAmount)}`, orderNumber: order.orderNumber, riderName: order.assignedRiderName, timestamp: nowISO() });
  }, [logActivity]);

  const cancelOrder = useCallback((orderId: string, reason = 'Cancelled') => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;
    pushOrderEvent(orderId, 'cancelled', 'Manager', reason);
    // Free up rider if assigned
    if (order.assignedRiderId) {
      setRiders(prev => prev.map(r =>
        r.id === order.assignedRiderId ? { ...r, liveStatus: 'available', currentAssignment: 'None (Idle at Outlet)' } : r
      ));
    }
    // Remove from dispatch queue
    setDispatchOrders(prev => prev.filter(d => d.orderId !== orderId));
    logActivity({ type: 'cancel', message: `${order.orderNumber} cancelled — ${reason}`, orderNumber: order.orderNumber, timestamp: nowISO() });
  }, [pushOrderEvent, logActivity]);

  const updateRiderStatus = useCallback((riderId: string, status: SharedRider['liveStatus']) => {
    setRiders(prev => prev.map(r => {
      if (r.id !== riderId) return r;
      const updates: Partial<SharedRider> = { liveStatus: status };
      if (status === 'available') {
        updates.currentAssignment = 'None (Idle at Outlet)';
        updates.liveEtaOrDist = '📍 At outlet';
      }
      return { ...r, ...updates };
    }));
  }, []);

  const createNewOrder = useCallback((partial: Partial<Order> & { items: OrderItem[] }) => {
    const orderNumber = `#FIC-${Math.floor(8900 + Math.random() * 90)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: partial.customerName || 'Walk-in Guest',
      customerPhone: partial.customerPhone || '+91 98000 00000',
      deliveryType: partial.deliveryType || 'delivery',
      status: 'new',
      paymentStatus: 'paid',
      estimatedPrepTime: 15,
      items: partial.items,
      totalAmount: partial.totalAmount || partial.items.reduce((s, i) => s + i.price * i.quantity, 0),
      createdAt: nowISO(),
      timeline: [{ status: 'new', timestamp: nowISO(), note: 'Counter / Walk-in order' }],
    };
    setOrders(prev => [newOrder, ...prev]);
    playNewOrderChime();
    logActivity({ type: 'new_order', message: `New Counter order ${orderNumber} created — ${newOrder.customerName} (${formatINR(newOrder.totalAmount)})`, orderNumber, timestamp: nowISO() });
  }, [logActivity]);

  const triggerInstantMockOrder = useCallback(() => {
    orderEngine.generateRandomOrder();
  }, []);

  const updateInventoryStock = useCallback((itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newStatus = newStock <= 0 ? 'out_of_stock' : newStock <= item.minThreshold ? 'low_stock' : 'in_stock';
      return { ...item, currentStock: newStock, status: newStatus, lastUpdated: new Date().toLocaleDateString() };
    }));
  }, []);

  return (
    <WorkflowContext.Provider value={{
      orders, inventory, customers, riders, dispatchOrders, activityLog, isOnline,
      setOrders, setInventory, setIsOnline,
      acceptOrder, rejectOrder, startCooking, markReady,
      assignRider, riderAccept, riderArrived, handoverOrder, startDelivery,
      markDelivered, cancelOrder, updateRiderStatus,
      createNewOrder, triggerInstantMockOrder, updateInventoryStock,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
};

// ─── Backward-compat alias so existing useOrders() calls still compile ────────
export const useOrders = () => {
  const ctx = useWorkflow();
  return {
    ...ctx,
    // Legacy updateOrderStatus maps to the correct workflow action
    updateOrderStatus: (orderId: string, status: OrderStatus) => {
      switch (status) {
        case 'preparing': return ctx.acceptOrder(orderId);
        case 'ready':     return ctx.markReady(orderId);
        case 'out_for_delivery': return ctx.startDelivery(orderId);
        case 'delivered': return ctx.markDelivered(orderId);
        case 'cancelled': return ctx.cancelOrder(orderId);
        default: break;
      }
    },
  };
};
