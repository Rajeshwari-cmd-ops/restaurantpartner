export type NavItemId =
  | 'dashboard'
  | 'orders'
  | 'kitchen'
  | 'delivery'
  | 'riders'
  | 'menu'
  | 'categories'
  | 'offers'
  | 'inventory'
  | 'customers'
  | 'reviews'
  | 'promotions'
  | 'finance'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'support'
  | 'settings';

export interface NavItem {
  id: NavItemId;
  label: string;
  path: string;
  iconName: string;
  badge?: number | string;
  badgeVariant?: 'primary' | 'warning' | 'error' | 'success';
}

export interface Outlet {
  id: string;
  name: string;
  city: string;
  address: string;
  isPrimary?: boolean;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  totalRatings: number;
  isOnline: boolean;
  activeOutletId: string;
  outlets: Outlet[];
  currency: string;
  managerName: string;
  phone: string;
  email: string;
  fssaiLicense: string;
  address: string;
}

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'rider_accepted'
  | 'rider_arrived'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isVeg: boolean;
  notes?: string;
}

/** A single workflow event recorded in the per-order history */
export interface WorkflowEvent {
  status: OrderStatus;
  timestamp: string;       // ISO string
  actor?: string;          // 'Manager', rider name, etc.
  note?: string;
}

/** Global activity log entry shown on Dashboard timeline */
export interface ActivityEvent {
  id: string;
  type: 'accept' | 'cooking' | 'ready' | 'assign' | 'pickup' | 'delivery' | 'cancel' | 'new_order' | 'inventory';
  message: string;
  orderId?: string;
  orderNumber?: string;
  riderName?: string;
  timestamp: string;       // ISO string
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  estimatedPrepTime: number; // minutes
  deliveryType: 'delivery' | 'pickup' | 'dine_in';
  // Workflow tracking
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  assignedRiderCode?: string;
  dispatchId?: string;
  timeline: WorkflowEvent[];  // full per-order event history
}

/** Shared rider profile used by both RidersPage and DeliveryPage */
export interface SharedRider {
  id: string;
  name: string;
  phone: string;
  riderCode: string;
  fleetType: 'Forge Express' | 'Express Fleet' | 'Partner Fleet';
  vehicle: 'Electric Scooter' | 'Motorcycle' | 'Scooter';
  vehicleModel: string;
  vehicleRegNo: string;
  distanceKm: number;
  battery: number;
  liveStatus: 'available' | 'picking_up' | 'on_delivery' | 'on_break' | 'off_duty';
  currentAssignment: string;
  liveEtaOrDist: string;
  lastDelivery: string;
  shiftTiming: string;
  attendanceStatus: string;
  clockInTime: string;
  hoursLoggedToday: number;
  deliveriesToday: number;
  deliveriesMonth: number;
  onTimeRatingPercent: number;
  customerRating: number;
  earningsToday: number;
  incentivesToday: number;
  payoutStatus: 'Settled' | 'Pending';
  docStatus: 'verified' | 'action_required' | 'pending';
  docIssues?: string;
}

/** Dispatch order used in DeliveryPage */
export interface SharedDispatchOrder {
  id: string;
  orderId: string;             // links back to Order.id
  orderNumber: string;
  channel: 'Online Delivery' | 'Direct Web' | 'Magicpin';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  totalAmount: number;
  assignmentStatus: 'unassigned' | 'assigned' | 'at_store' | 'in_transit' | 'delivered';
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderCode?: string;
  fleetProvider?: 'Forge Express' | 'Express Fleet' | 'Partner Fleet';
  pickupOtp: string;
  etaMinutes: number;
  distanceKm: number;
  dispatchTime: string;
  stagedMinutes: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  spiciness?: 'mild' | 'medium' | 'spicy';
  inStock: boolean;
  rating: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  code?: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';
  lastUpdated: string;
  lastReceived?: string;
  lastUsed?: string;
  supplierName?: string;
  unitCost?: number;
  expiryDate?: string;
  lotNumber?: string;
  storageLocation?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  orderNumber: string;
  comment: string;
  date: string;
  replied: boolean;
  replyText?: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'scheduled' | 'expired';
  ordersUsed: number;
  revenueGenerated: number;
  budget: number;
  performanceRoi: string;
  targetAudience?: string;
}

export interface FinanceSummary {
  todayRevenue: number;
  pendingPayout: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  commissionRate: number;
  totalOrdersCount: number;
  payoutDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'inventory' | 'finance' | 'system';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}
