import React, { useState } from 'react';
import {
  Users,
  Search,
  PhoneCall,
  Crown,
  DollarSign,
  MapPin,
  X,
  Heart,
  MoreVertical,
  Award,
  CreditCard,
  Bike,
  Star,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { formatINR } from '../utils/formatters';

// Design Tokens (Enterprise SaaS Palette)
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
  shadowHover: '0 6px 18px rgba(15, 23, 42, 0.08)',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: T.card,
  border: `1px solid ${T.line}`,
  borderRadius: 24,
  boxShadow: T.shadowCard,
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  ...extra,
});

export interface DetailedOrder {
  orderId: string;
  date: string;
  amount: number;
  items: string;
  status: 'Delivered' | 'Ongoing' | 'Cancelled' | 'Refunded';
  paymentMode: string;
  paymentStatus: 'Paid' | 'Refunded' | 'Pending';
  deliveryType: 'Delivery' | 'Pickup' | 'Dine-In';
  riderName?: string;
  riderPhone?: string;
  riderCode?: string;
  fleetProvider?: string;
}

export interface CustomerAddress {
  label: string;
  fullAddress: string;
  isPrimary?: boolean;
}

export interface CustomerReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  primaryAddress: string;
  addresses: CustomerAddress[];
  tier: 'VIP Gold' | 'VIP Regular' | 'Regular' | 'New Customer';
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  favoriteDishes: string[];
  lastOrderDate: string;
  joinedDate: string;
  loyaltyPoints: number;
  status: 'Active' | 'Inactive';
  customerNotes: string;
  foodPreferences: string[];
  pastOrders: DetailedOrder[];
  reviews: CustomerReview[];
}

const mockCustomerRecords: CustomerRecord[] = [
  {
    id: 'c-101',
    name: 'Priya Sharma',
    avatar: 'PS',
    phone: '+91 98765 43210',
    email: 'priya.sharma@example.com',
    primaryAddress: 'Flat 402, NeoTown Apts, Electronic City Phase 1, Bengaluru',
    addresses: [
      { label: 'Home (Primary)', fullAddress: 'Flat 402, NeoTown Apts, Electronic City Phase 1, Bengaluru', isPrimary: true },
      { label: 'Work', fullAddress: 'Wipro Campus, Tower 3, Doddakannelli, Sarjapur Road, Bengaluru' },
    ],
    tier: 'VIP Gold',
    totalOrders: 28,
    totalSpent: 14560,
    avgOrderValue: 520,
    favoriteDishes: ['Chicken Dum Biryani', 'Garlic Butter Naan', 'Mango Lassi Thick'],
    lastOrderDate: 'Today, 1:15 PM',
    joinedDate: 'Jan 2024',
    loyaltyPoints: 1450,
    status: 'Active',
    customerNotes: 'Prefers extra spicy biryani. Request less oil in gravies. Always call on arrival.',
    foodPreferences: ['Non-Veg Lover', 'Extra Spicy', 'Less Oil'],
    pastOrders: [
      {
        orderId: '#FIC-8891',
        date: 'Today, 1:15 PM',
        amount: 680,
        items: '2x Chicken Dum Biryani, 1x Mango Lassi Thick',
        status: 'Ongoing',
        paymentMode: 'UPI (GPay)',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Suresh Kumar',
        riderPhone: '+91 98765 12345',
        riderCode: '#RD-402',
        fleetProvider: 'Forge Express',
      },
      {
        orderId: '#FIC-8840',
        date: '2 days ago',
        amount: 540,
        items: '1x Paneer Butter Masala, 2x Garlic Butter Naan',
        status: 'Delivered',
        paymentMode: 'UPI (PhonePe)',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Ramesh Gowda',
        riderPhone: '+91 98450 99887',
        riderCode: '#RD-308',
        fleetProvider: 'Partner Fleet',
      },
      {
        orderId: '#FIC-8790',
        date: '5 days ago',
        amount: 720,
        items: '2x Chicken Dum Biryani, 2x Garlic Naan',
        status: 'Delivered',
        paymentMode: 'Credit Card',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Vikram Singh',
        riderPhone: '+91 97112 33445',
        riderCode: '#RD-215',
        fleetProvider: 'Forge Express',
      },
      {
        orderId: '#FIC-8620',
        date: '12 days ago',
        amount: 450,
        items: '1x Butter Chicken, 2x Roti',
        status: 'Refunded',
        paymentMode: 'UPI (Paytm)',
        paymentStatus: 'Refunded',
        deliveryType: 'Delivery',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        rating: 5,
        comment: 'Biryani was piping hot and delicious as always! Fast delivery by Suresh.',
        date: 'Today, 1:45 PM',
        orderId: '#FIC-8891',
      },
      {
        id: 'rev-2',
        rating: 4.5,
        comment: 'Great gravy richness and soft garlic naan.',
        date: '2 days ago',
        orderId: '#FIC-8840',
      },
    ],
  },
  {
    id: 'c-102',
    name: 'Rahul Verma',
    avatar: 'RV',
    phone: '+91 98123 45678',
    email: 'rahul.v@example.com',
    primaryAddress: 'Villa 12, Green Glen Layout, Bellandur, Bengaluru',
    addresses: [
      { label: 'Home (Primary)', fullAddress: 'Villa 12, Green Glen Layout, Bellandur, Bengaluru', isPrimary: true },
    ],
    tier: 'VIP Regular',
    totalOrders: 19,
    totalSpent: 9120,
    avgOrderValue: 480,
    favoriteDishes: ['Paneer Butter Masala', 'Garlic Butter Naan'],
    lastOrderDate: 'Yesterday, 8:30 PM',
    joinedDate: 'Feb 2024',
    loyaltyPoints: 910,
    status: 'Active',
    customerNotes: 'Strictly Vegetarian. Request jain preparation when specified.',
    foodPreferences: ['Pure Veg', 'Mild Spice', 'Jain Options'],
    pastOrders: [
      {
        orderId: '#FIC-8872',
        date: 'Yesterday, 8:30 PM',
        amount: 480,
        items: '1x Paneer Butter Masala, 3x Butter Roti',
        status: 'Delivered',
        paymentMode: 'UPI (GPay)',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Anil Kumar',
        riderPhone: '+91 99001 22334',
        riderCode: '#RD-104',
        fleetProvider: 'Express Fleet',
      },
      {
        orderId: '#FIC-8812',
        date: '4 days ago',
        amount: 520,
        items: '1x Dal Makhani, 2x Garlic Naan',
        status: 'Delivered',
        paymentMode: 'Cash on Delivery',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Suresh Kumar',
        riderPhone: '+91 98765 12345',
        riderCode: '#RD-402',
        fleetProvider: 'Forge Express',
      },
    ],
    reviews: [
      {
        id: 'rev-3',
        rating: 5,
        comment: 'Great flavor and good portion size. Packaging was neat.',
        date: 'Yesterday',
        orderId: '#FIC-8872',
      },
    ],
  },
  {
    id: 'c-103',
    name: 'Ananya Reddy',
    avatar: 'AR',
    phone: '+91 97654 32109',
    email: 'ananya.reddy@example.com',
    primaryAddress: 'Tower B - 1204, Prestige Lakeside, Marathahalli, Bengaluru',
    addresses: [
      { label: 'Home (Primary)', fullAddress: 'Tower B - 1204, Prestige Lakeside, Marathahalli, Bengaluru', isPrimary: true },
    ],
    tier: 'Regular',
    totalOrders: 9,
    totalSpent: 4140,
    avgOrderValue: 460,
    favoriteDishes: ['Dal Makhani Slow Cooked', 'Gulab Jamun'],
    lastOrderDate: '3 days ago',
    joinedDate: 'Mar 2024',
    loyaltyPoints: 410,
    status: 'Active',
    customerNotes: 'Prefers contactless delivery at security gate.',
    foodPreferences: ['Contactless Delivery', 'Medium Spice'],
    pastOrders: [
      {
        orderId: '#FIC-8825',
        date: '3 days ago',
        amount: 460,
        items: '1x Dal Makhani, 2x Naan, 1x Gulab Jamun',
        status: 'Delivered',
        paymentMode: 'UPI (PhonePe)',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Ramesh Gowda',
        riderPhone: '+91 98450 99887',
        riderCode: '#RD-308',
        fleetProvider: 'Forge Express',
      },
      {
        orderId: '#FIC-8710',
        date: '10 days ago',
        amount: 390,
        items: '1x Paneer Tikka, 2x Roti',
        status: 'Cancelled',
        paymentMode: 'UPI (GPay)',
        paymentStatus: 'Refunded',
        deliveryType: 'Delivery',
      },
    ],
    reviews: [
      {
        id: 'rev-4',
        rating: 4.5,
        comment: 'Dal makhani was rich and creamy.',
        date: '3 days ago',
        orderId: '#FIC-8825',
      },
    ],
  },
  {
    id: 'c-104',
    name: 'Vikram Malhotra',
    avatar: 'VM',
    phone: '+91 99887 76655',
    email: 'vikram.m@example.com',
    primaryAddress: 'Plot 45, HSR Layout Sector 3, Bengaluru',
    addresses: [
      { label: 'Home (Primary)', fullAddress: 'Plot 45, HSR Layout Sector 3, Bengaluru', isPrimary: true },
    ],
    tier: 'Regular',
    totalOrders: 12,
    totalSpent: 5760,
    avgOrderValue: 480,
    favoriteDishes: ['Mutton Rogan Josh', 'Garlic Naan'],
    lastOrderDate: '24 days ago',
    joinedDate: 'Dec 2023',
    loyaltyPoints: 570,
    status: 'Inactive',
    customerNotes: 'Non-veg specialist lover. Prefers weekend evening deliveries.',
    foodPreferences: ['High Meat Spices', 'Weekend Regular'],
    pastOrders: [
      {
        orderId: '#FIC-8510',
        date: '24 days ago',
        amount: 920,
        items: '2x Mutton Rogan Josh, 4x Garlic Naan',
        status: 'Delivered',
        paymentMode: 'Credit Card',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Suresh Kumar',
        riderPhone: '+91 98765 12345',
        riderCode: '#RD-402',
        fleetProvider: 'Forge Express',
      },
    ],
    reviews: [
      {
        id: 'rev-5',
        rating: 4.0,
        comment: 'Good food, but delivery took longer than expected.',
        date: '24 days ago',
        orderId: '#FIC-8510',
      },
    ],
  },
  {
    id: 'c-105',
    name: 'Sneha Kulkarni',
    avatar: 'SK',
    phone: '+91 96543 21098',
    email: 'sneha.k@example.com',
    primaryAddress: 'Apt 201, Shobha Iris, Devarabesanahalli, Bengaluru',
    addresses: [
      { label: 'Home (Primary)', fullAddress: 'Apt 201, Shobha Iris, Devarabesanahalli, Bengaluru', isPrimary: true },
    ],
    tier: 'New Customer',
    totalOrders: 2,
    totalSpent: 860,
    avgOrderValue: 430,
    favoriteDishes: ['Paneer Tikka', 'Garlic Butter Naan'],
    lastOrderDate: 'Today, 12:40 PM',
    joinedDate: 'This Month',
    loyaltyPoints: 85,
    status: 'Active',
    customerNotes: 'New guest. Appreciates extra cutlery.',
    foodPreferences: ['Cutlery Needed'],
    pastOrders: [
      {
        orderId: '#FIC-8888',
        date: 'Today, 12:40 PM',
        amount: 430,
        items: '1x Paneer Tikka, 2x Garlic Naan',
        status: 'Delivered',
        paymentMode: 'UPI (GPay)',
        paymentStatus: 'Paid',
        deliveryType: 'Delivery',
        riderName: 'Vikram Singh',
        riderPhone: '+91 97112 33445',
        riderCode: '#RD-215',
        fleetProvider: 'Partner Fleet',
      },
    ],
    reviews: [
      {
        id: 'rev-6',
        rating: 5,
        comment: 'First time ordering, amazing experience!',
        date: 'Today',
        orderId: '#FIC-8888',
      },
    ],
  },
];

export const CustomersPage: React.FC = () => {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>(mockCustomerRecords);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('spent');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'orders' | 'details' | 'reviews'>('orders');

  // Filter pipeline
  let filtered = customers;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.primaryAddress.toLowerCase().includes(q) ||
        c.favoriteDishes.some(d => d.toLowerCase().includes(q))
    );
  }

  // Quick Filter Pills
  if (quickFilter === 'vip') {
    filtered = filtered.filter(c => c.tier.includes('VIP'));
  } else if (quickFilter === 'high_spent') {
    filtered = filtered.filter(c => c.totalSpent >= 5000);
  } else if (quickFilter === 'new') {
    filtered = filtered.filter(c => c.tier === 'New Customer');
  } else if (quickFilter === 'inactive') {
    filtered = filtered.filter(c => c.status === 'Inactive');
  }

  // Sort Pipeline
  if (sortBy === 'orders') {
    filtered = [...filtered].sort((a, b) => b.totalOrders - a.totalOrders);
  } else if (sortBy === 'recent') {
    filtered = [...filtered].sort((a, b) => a.lastOrderDate.localeCompare(b.lastOrderDate));
  } else {
    filtered = [...filtered].sort((a, b) => b.totalSpent - a.totalSpent);
  }

  const totalCustomerCount = 1248;
  const totalValuationSpent = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgOrderValueAvg = Math.round(
    customers.reduce((acc, c) => acc + c.avgOrderValue, 0) / (customers.length || 1)
  );

  const handleAddLoyaltyBonus = (customer: CustomerRecord, bonusPts: number = 100) => {
    const updated = {
      ...customer,
      loyaltyPoints: customer.loyaltyPoints + bonusPts,
    };
    setCustomers(prev => prev.map(c => (c.id === customer.id ? updated : c)));
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(updated);
    }
    addToast('Loyalty Reward Granted', `Added +${bonusPts} pts to ${customer.name}'s account.`, 'success');
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>

      {/* ── 1. COMPACT ENTERPRISE KPI SUMMARY BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {/* KPI 1: Total Customers */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Customers
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {totalCustomerCount.toLocaleString()}
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ↑ +12.4% active profiles
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Users size={14} />
            </div>
          </div>
        </div>

        {/* KPI 2: VIP Customers */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                VIP Regulars
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                184 Guests
              </div>
              <div style={{ fontSize: 10.5, color: T.amber, fontWeight: 700 }}>
                ★ 14.7% of customer base
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.amberBg, color: T.amber,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Crown size={14} />
            </div>
          </div>
        </div>

        {/* KPI 3: Average Order Value */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Average Order Value
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatINR(avgOrderValueAvg)}
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ↑ +₹45 vs outlet avg
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <DollarSign size={14} />
            </div>
          </div>
        </div>

        {/* KPI 4: Total Spent */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Spent (Tracked)
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatINR(totalValuationSpent)}
              </div>
              <div style={{ fontSize: 10.5, color: T.blue, fontWeight: 600 }}>
                ● High repeat loyalty
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Heart size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK FILTER STRIP & SEARCH TOOLBAR ── */}
      <div style={cardStyle({ padding: '8px 14px', borderRadius: 24 })}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All Customers' },
              { id: 'vip', label: '👑 VIP Regulars' },
              { id: 'high_spent', label: '🔥 High Spent (>₹5,000)' },
              { id: 'new', label: '✨ New Customers' },
              { id: 'inactive', label: '⚠️ Inactive' },
            ].map(chip => {
              const isActive = quickFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setQuickFilter(chip.id)}
                  style={{
                    height: 26, padding: '0 14px', fontSize: 11.5, fontWeight: isActive ? 700 : 600,
                    borderRadius: 9999, border: `1px solid ${isActive ? T.brand : T.line}`,
                    background: isActive ? T.brandSoft : 'transparent',
                    color: isActive ? T.brand : T.muted,
                    cursor: 'pointer', transition: 'all 0.12s ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.subtle, border: `1px solid ${T.line}`,
              borderRadius: 9999, padding: '4px 14px', width: 220,
            }}>
              <Search size={13} color={T.muted} />
              <input
                type="text"
                placeholder="Search name, phone, dish..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 11.5, outline: 'none', width: '100%' }}
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                height: 30, padding: '0 14px', fontSize: 11.5, fontWeight: 600,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, color: T.body, cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="spent">Sort: Highest Total Spent</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="recent">Sort: Recent Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. HIGH-DENSITY COMPACT CUSTOMERS TABLE ── */}
      <div style={cardStyle({ borderRadius: 24, overflow: 'hidden' })}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Customer Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Phone</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Address</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Total Orders</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Total Spent</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Last Order</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Favorite Dishes</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, idx) => (
                <tr
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setActiveDrawerTab('orders');
                  }}
                  style={{
                    borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${T.lineSoft}`,
                    cursor: 'pointer', transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.subtle; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  {/* Name + Tier badge */}
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: customer.tier.includes('VIP') ? 'linear-gradient(135deg, #FF7A30 0%, #E05A10 100%)' : T.lineSoft,
                        color: customer.tier.includes('VIP') ? '#fff' : T.ink,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, flexShrink: 0,
                      }}>
                        {customer.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: T.ink, fontSize: 12.5 }}>{customer.name}</div>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                          color: customer.tier.includes('VIP') ? T.amber : T.muted,
                          background: customer.tier.includes('VIP') ? T.amberBg : T.subtle,
                        }}>
                          {customer.tier}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td style={{ padding: '8px 12px', fontSize: 11.5, color: T.body, fontWeight: 600 }}>
                    {customer.phone}
                  </td>

                  {/* Address */}
                  <td style={{ padding: '8px 12px', fontSize: 11, color: T.muted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.primaryAddress}>
                    {customer.primaryAddress}
                  </td>

                  {/* Total Orders */}
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                    {customer.totalOrders} orders
                  </td>

                  {/* Total Spent */}
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(customer.totalSpent)}
                    </div>
                    <div style={{ fontSize: 10, color: T.muted }}>
                      Avg: {formatINR(customer.avgOrderValue)}
                    </div>
                  </td>

                  {/* Last Order */}
                  <td style={{ padding: '8px 12px', fontSize: 11.5, color: T.body }}>
                    {customer.lastOrderDate}
                  </td>

                  {/* Favorite Dishes */}
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {customer.favoriteDishes.slice(0, 2).map((dish, i) => (
                        <span key={i} style={{
                          fontSize: 10, fontWeight: 600, color: T.body, background: T.subtle,
                          border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 9999,
                        }}>
                          {dish}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                      color: customer.status === 'Active' ? T.green : T.amber,
                      background: customer.status === 'Active' ? T.greenBg : T.amberBg,
                    }}>
                      ● {customer.status}
                    </span>
                  </td>

                  {/* Quick Actions */}
                  <td style={{ padding: '8px 12px', textAlign: 'right', position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <button
                        onClick={() => addToast('Calling Customer', `Calling ${customer.name} (${customer.phone})...`, 'info')}
                        title="Call Customer"
                        style={{
                          height: 26, padding: '0 10px', fontSize: 11, fontWeight: 600, color: T.body,
                          background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 9999, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <PhoneCall size={11} /> Call
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === customer.id ? null : customer.id)}
                          style={{
                            width: 26, height: 26, borderRadius: 9999, background: 'transparent',
                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: T.muted, cursor: 'pointer',
                          }}
                        >
                          <MoreVertical size={13} />
                        </button>

                        {activeMenuId === customer.id && (
                          <div style={{
                            position: 'absolute', right: 0, top: 28, width: 170,
                            background: '#ffffff', border: `1px solid ${T.line}`,
                            borderRadius: 16, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                            zIndex: 100, padding: 4, display: 'flex', flexDirection: 'column', gap: 1,
                          }}>
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setActiveDrawerTab('orders');
                                setActiveMenuId(null);
                              }}
                              style={{
                                padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.ink,
                                background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              📋 View Full Profile
                            </button>

                            <button
                              onClick={() => {
                                handleAddLoyaltyBonus(customer, 100);
                                setActiveMenuId(null);
                              }}
                              style={{
                                padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.amber,
                                background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              🎁 Grant +100 Loyalty Pts
                            </button>

                            <button
                              onClick={() => {
                                addToast('Promo Coupon Sent', `Sent promo coupon to ${customer.name}`, 'info');
                                setActiveMenuId(null);
                              }}
                              style={{
                                padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.brand,
                                background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              🏷️ Send Coupon
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. COMPLETE CUSTOMER DETAILS DRAWER ── */}
      {selectedCustomer && (
        <>
          <div onClick={() => setSelectedCustomer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 480, maxWidth: '92vw', background: '#ffffff',
              zIndex: 401, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 20px rgba(15, 23, 42, 0.12)',
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '14px 18px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: selectedCustomer.tier.includes('VIP') ? 'linear-gradient(135deg, #FF7A30 0%, #E05A10 100%)' : T.lineSoft,
                  color: selectedCustomer.tier.includes('VIP') ? '#fff' : T.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>
                  {selectedCustomer.avatar}
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{selectedCustomer.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {selectedCustomer.tier} · Joined {selectedCustomer.joinedDate} · {selectedCustomer.loyaltyPoints} Loyalty Pts
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Segmented Drawer Navigation Tabs */}
            <div style={{ display: 'flex', background: T.subtle, padding: '4px 18px', borderBottom: `1px solid ${T.line}`, gap: 4 }}>
              {[
                { id: 'orders', label: `Order History (${selectedCustomer.pastOrders.length})` },
                { id: 'details', label: 'Addresses & Notes' },
                { id: 'reviews', label: `Reviews (${selectedCustomer.reviews.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDrawerTab(tab.id as any)}
                  style={{
                    height: 28, padding: '0 10px', fontSize: 11.5, fontWeight: activeDrawerTab === tab.id ? 700 : 500,
                    borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: activeDrawerTab === tab.id ? '#ffffff' : 'transparent',
                    color: activeDrawerTab === tab.id ? T.brand : T.muted,
                    boxShadow: activeDrawerTab === tab.id ? '0 1px 2px rgba(15,23,42,0.05)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Quick Summary Strip */}
              <div style={{ background: T.subtle, padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.line}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: T.muted }}>Total Spent</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.brand }}>{formatINR(selectedCustomer.totalSpent)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: T.muted }}>Total Orders</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{selectedCustomer.totalOrders}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: T.muted }}>Avg Order Value</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.green }}>{formatINR(selectedCustomer.avgOrderValue)}</div>
                  </div>
                </div>
              </div>

              {/* DRAWER TAB 1: COMPLETE ORDER HISTORY */}
              {activeDrawerTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
                    Past &amp; Active Orders
                  </div>

                  {selectedCustomer.pastOrders.map((ord, idx) => {
                    const statusColor =
                      ord.status === 'Delivered' ? T.green
                      : ord.status === 'Ongoing' ? T.blue
                      : ord.status === 'Refunded' ? T.purple
                      : T.red;

                    const statusBg =
                      ord.status === 'Delivered' ? T.greenBg
                      : ord.status === 'Ongoing' ? T.blueBg
                      : ord.status === 'Refunded' ? T.purpleBg
                      : T.redBg;

                    return (
                      <div key={idx} style={{
                        background: '#ffffff', padding: '10px 12px', borderRadius: 8,
                        border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 6,
                      }}>
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, color: T.brand, fontSize: 12.5 }}>{ord.orderId}</span>
                            <span style={{
                              fontSize: 9.5, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                              color: statusColor, background: statusBg,
                            }}>
                              ● {ord.status}
                            </span>
                          </div>
                          <span style={{ fontWeight: 800, color: T.ink, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                            {formatINR(ord.amount)}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div style={{ fontSize: 11.5, color: T.body, fontWeight: 500 }}>
                          {ord.items}
                        </div>

                        {/* Payment Details */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontSize: 10.5, color: T.muted, background: T.subtle, padding: '4px 8px', borderRadius: 4,
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CreditCard size={11} color={T.muted} /> {ord.paymentMode} ({ord.paymentStatus})
                          </span>
                          <span>{ord.date}</span>
                        </div>

                        {/* Delivery & Rider Details if Available */}
                        {ord.riderName && (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 10.5, color: T.body, background: T.blueBg,
                            border: `1px solid ${T.blueBorder}`, padding: '4px 8px', borderRadius: 4,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Bike size={12} color={T.blue} />
                              <span>Rider: <strong>{ord.riderName}</strong> ({ord.riderCode || 'Rider'})</span>
                            </div>
                            <span style={{ color: T.muted }}>{ord.fleetProvider || 'Delivery'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DRAWER TAB 2: ADDRESSES & NOTES */}
              {activeDrawerTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Customer Notes / Preferences */}
                  <div style={{ background: T.subtle, padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Customer Notes &amp; Kitchen Instructions
                    </div>
                    <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.4 }}>
                      {selectedCustomer.customerNotes || 'No specific kitchen notes recorded.'}
                    </div>

                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {selectedCustomer.foodPreferences.map((pref, i) => (
                        <span key={i} style={{ fontSize: 10, fontWeight: 700, color: T.brand, background: T.brandSoft, padding: '2px 6px', borderRadius: 4 }}>
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Saved Delivery Addresses */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                      Saved Delivery Addresses ({selectedCustomer.addresses.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selectedCustomer.addresses.map((addr, idx) => (
                        <div key={idx} style={{
                          background: '#ffffff', padding: '8px 10px', borderRadius: 6,
                          border: `1px solid ${T.line}`, fontSize: 11.5,
                        }}>
                          <div style={{ fontWeight: 700, color: T.ink, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <MapPin size={12} color={T.brand} />
                            {addr.label}
                          </div>
                          <div style={{ color: T.body }}>{addr.fullAddress}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Dishes */}
                  <div style={{ background: T.subtle, padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Favorite Ordered Dishes
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {selectedCustomer.favoriteDishes.map((dish, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, color: T.ink, background: '#fff', border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 4 }}>
                          🍛 {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DRAWER TAB 3: REVIEWS */}
              {activeDrawerTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
                    Submitted Ratings &amp; Reviews
                  </div>

                  {selectedCustomer.reviews.length === 0 ? (
                    <div style={{ fontSize: 11.5, color: T.muted, textAlign: 'center', padding: 20 }}>
                      No reviews submitted yet by this customer.
                    </div>
                  ) : (
                    selectedCustomer.reviews.map((rev) => (
                      <div key={rev.id} style={{
                        background: '#ffffff', padding: '10px 12px', borderRadius: 8,
                        border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 4,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.amber, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={12} fill={T.amber} /> {rev.rating} ★ Rating
                          </span>
                          <span style={{ fontSize: 10.5, color: T.muted }}>{rev.date} ({rev.orderId})</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: T.body, fontStyle: 'italic' }}>
                          "{rev.comment}"
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

            {/* Drawer Actions */}
            <div style={{
              padding: '10px 18px', background: T.card, borderTop: `1px solid ${T.line}`,
              display: 'flex', gap: 6,
            }}>
              <button
                onClick={() => handleAddLoyaltyBonus(selectedCustomer, 100)}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}`,
                  borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <Award size={13} /> +100 Pts
              </button>
              <button
                onClick={() => addToast('Calling Customer', `Calling ${selectedCustomer.phone}...`, 'info')}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <PhoneCall size={13} /> Call Customer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
