import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Download,
  CheckCircle2,
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
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',

  shadowCard: '0 2px 8px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02)',
  shadowHover: '0 8px 24px rgba(15, 23, 42, 0.09)',
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

// Mock Analytics Data Structures
const dailyTrendData = [
  { day: 'Mon', revenue: 58200, orders: 126, heightPct: 62 },
  { day: 'Tue', revenue: 64100, orders: 138, heightPct: 70 },
  { day: 'Wed', revenue: 61800, orders: 132, heightPct: 66 },
  { day: 'Thu', revenue: 69400, orders: 148, heightPct: 78 },
  { day: 'Fri', revenue: 84500, orders: 182, heightPct: 92 },
  { day: 'Sat', revenue: 92400, orders: 204, heightPct: 100 },
  { day: 'Sun', revenue: 88500, orders: 195, heightPct: 95 },
];

const hourlyDistributionData = [
  { hour: '11 AM', orders: 18, pct: 25 },
  { hour: '12 PM', orders: 42, pct: 55 },
  { hour: '1 PM (Lunch)', orders: 98, pct: 100, peak: true },
  { hour: '2 PM (Lunch)', orders: 84, pct: 86, peak: true },
  { hour: '3 PM', orders: 32, pct: 38 },
  { hour: '4 PM', orders: 22, pct: 28 },
  { hour: '5 PM', orders: 28, pct: 32 },
  { hour: '6 PM', orders: 45, pct: 50 },
  { hour: '7 PM', orders: 68, pct: 72 },
  { hour: '8 PM (Dinner)', orders: 112, pct: 100, peak: true },
  { hour: '9 PM (Dinner)', orders: 105, pct: 94, peak: true },
  { hour: '10 PM', orders: 54, pct: 58 },
];

const topSellingDishesData = [
  { rank: 1, name: 'Fresh Malai Paneer Tikka', category: 'Dairy / Starters', ordersCount: 480, revenue: 168000, sharePct: 34.8 },
  { rank: 2, name: 'Chicken Dum Biryani (Full)', category: 'Combos & Biryani', ordersCount: 410, revenue: 143500, sharePct: 29.7 },
  { rank: 3, name: 'Dal Makhani Slow Cooked', category: 'Main Course', ordersCount: 390, revenue: 97500, sharePct: 20.2 },
  { rank: 4, name: 'Garlic Butter Naan', category: 'Breads & Tandoor', ordersCount: 1200, revenue: 48000, sharePct: 9.9 },
  { rank: 5, name: 'Sweet Mango Lassi', category: 'Beverages', ordersCount: 350, revenue: 26250, sharePct: 5.4 },
];

export const ReportsPage: React.FC = () => {
  const { addToast } = useToast();
  const [dateRange, setDateRange] = useState<string>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'dishes' | 'hourly' | 'delivery'>('overview');

  // Handle Export Actions
  const handleExportPdf = () => {
    addToast('PDF Report Generated', 'Downloading Restaurant Executive Analytics PDF...', 'success');
  };

  const handleExportCsv = () => {
    addToast('CSV Export Ready', 'Exported 1,048 sales transaction rows to CSV.', 'info');
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. EXECUTIVE ANALYTICS KPI DASHBOARD (4 CARDS)
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {/* KPI 1: Gross Sales Revenue */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Gross Sales Revenue
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {formatINR(482450)}
              </div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginTop: 2 }}>
                ↑ +14.2% vs previous period
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <DollarSign size={16} />
            </div>
          </div>
        </div>

        {/* KPI 2: Total Orders Volume */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Orders Volume
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                1,048 Orders
              </div>
              <div style={{ fontSize: 11, color: T.brand, fontWeight: 700, marginTop: 2 }}>
                Avg Order Value: {formatINR(460)}
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShoppingBag size={16} />
            </div>
          </div>
        </div>

        {/* KPI 3: Avg Preparation Speed */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avg Kitchen Prep Time
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                12.4 Mins
              </div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginTop: 2 }}>
                ✓ -1.5m efficiency gain
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Clock size={16} />
            </div>
          </div>
        </div>

        {/* KPI 4: On-Time Delivery Guarantee */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                On-Time Delivery Rate
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.green, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                97.8%
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 2 }}>
                32m Avg Fulfillment Speed
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.purpleBg, color: T.purple,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. DATE FILTER PRESETS & EXPORT ACTION TOOLBAR
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '10px 18px', borderRadius: 28 })}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Module Sub-Tabs */}
          <div style={{ display: 'flex', gap: 4, background: T.subtle, padding: 4, borderRadius: 9999, flexWrap: 'wrap', border: `1px solid ${T.line}` }}>
            {[
              { id: 'overview', label: 'Executive Overview' },
              { id: 'dishes', label: 'Top Selling Dishes' },
              { id: 'hourly', label: 'Sales by Hour' },
              { id: 'delivery', label: 'Delivery Performance' },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    height: 36, padding: '0 16px', fontSize: 12, fontWeight: 700, borderRadius: 9999,
                    border: 'none', cursor: 'pointer',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? T.brand : T.muted,
                    boxShadow: isActive ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Date Filter Pills & Exports */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={dateRange}
              onChange={e => {
                setDateRange(e.target.value);
                addToast('Analytics Updated', `Loaded dataset for selected range`, 'info');
              }}
              style={{
                height: 36, padding: '0 14px', fontSize: 11.5, fontWeight: 700,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, color: T.body, cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="today">Date Range: Today</option>
              <option value="yesterday">Date Range: Yesterday</option>
              <option value="7days">Date Range: Last 7 Days</option>
              <option value="month">Date Range: This Month (July 2026)</option>
            </select>

            <button
              onClick={handleExportCsv}
              style={{
                height: 36, padding: '0 14px', background: T.subtle, color: T.body,
                border: `1px solid ${T.line}`, borderRadius: 9999,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={handleExportPdf}
              style={{
                height: 36, padding: '0 16px', background: T.grad, color: '#fff',
                border: 'none', borderRadius: 9999, fontSize: 12, fontWeight: 800,
                boxShadow: T.glow, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Download size={14} /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. INTERACTIVE VISUAL REVENUE & ORDER TREND CHART
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '20px 24px', borderRadius: 28 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>
              Daily Revenue &amp; Orders Trend (Weekly Comparison)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>
              Peak revenue recorded on Saturday (`{formatINR(92400)}`) with 204 completed orders
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, fontWeight: 700 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.brand }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: T.brand }} /> Daily Revenue (₹)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: T.blue }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: T.blue }} /> Orders Volume
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          height: 180, gap: 14, paddingTop: 10, borderBottom: `1px solid ${T.line}`,
        }}>
          {dailyTrendData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums' }}>
                {formatINR(d.revenue)}
              </div>
              <div style={{
                width: '100%', maxWidth: 44, height: `${d.heightPct}%`,
                background: 'linear-gradient(180deg, #FF7A30 0%, #E05A10 100%)',
                borderRadius: '8px 8px 4px 4px',
                boxShadow: '0 4px 10px rgba(255,122,48,0.25)',
                transition: 'height 0.3s ease',
              }} />
              <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>
                {d.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          4. HOURLY DEMAND HEATMAP & TOP SELLING ITEMS GRID
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 16,
      }}>
        {/* Left Column: Top Selling Dishes Matrix */}
        <div style={cardStyle({ padding: '20px 22px', borderRadius: 28 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: T.ink, margin: 0 }}>Top Selling Menu Dishes</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>Highest grossing items by total sales volume</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topSellingDishesData.map(dish => (
              <div
                key={dish.rank}
                style={{
                  background: T.subtle, padding: '12px 14px', borderRadius: 18,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: dish.rank === 1 ? T.amberBg : T.subtle,
                    color: dish.rank === 1 ? T.amber : T.ink,
                    border: `1px solid ${dish.rank === 1 ? T.amberBorder : T.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900,
                  }}>
                    #{dish.rank}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>{dish.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{dish.category} · {dish.ordersCount} Orders</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.brand, fontVariantNumeric: 'tabular-nums' }}>
                    {formatINR(dish.revenue)}
                  </div>
                  <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                    {dish.sharePct}% Revenue Share
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hourly Sales Distribution (Peak Hours) */}
        <div style={cardStyle({ padding: '20px 22px', borderRadius: 28 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: T.ink, margin: 0 }}>Sales by Hour &amp; Peak Heatmap</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>Peak lunch (1 PM - 3 PM) and dinner rush (8 PM - 10 PM)</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hourlyDistributionData.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 90, fontWeight: 700, color: h.peak ? T.brand : T.ink }}>
                  {h.hour}
                </span>

                <div style={{ flex: 1, height: 8, background: T.lineSoft, borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${h.pct}%`, height: '100%',
                    background: h.peak ? 'linear-gradient(90deg, #FF7A30 0%, #E05A10 100%)' : T.blue,
                    borderRadius: 9999, transition: 'width 0.3s ease',
                  }} />
                </div>

                <span style={{ width: 65, textAlign: 'right', fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {h.orders} ord
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          5. CATEGORY SHARE & PAYMENT METHOD BREAKDOWN
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {/* Category Revenue Distribution */}
        <div style={cardStyle({ padding: '18px 20px', borderRadius: 28 })}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 12 }}>
            Category Revenue Split
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { category: 'Main Course & Curries', pct: 45, color: T.brand, val: '₹2,17,100' },
              { category: 'Starters & Tandoor', pct: 25, color: T.amber, val: '₹1,20,610' },
              { category: 'Biryani & Combos', pct: 18, color: T.green, val: '₹86,840' },
              { category: 'Breads, Drinks & Desserts', pct: 12, color: T.purple, val: '₹57,900' },
            ].map((cat, idx) => (
              <div key={idx} style={{ background: T.subtle, padding: '10px 14px', borderRadius: 16, border: `1px solid ${T.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
                  <span>{cat.category}</span>
                  <span style={{ color: cat.color }}>{cat.pct}% ({cat.val})</span>
                </div>
                <div style={{ width: '100%', height: 6, background: T.lineSoft, borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Insights */}
        <div style={cardStyle({ padding: '18px 20px', borderRadius: 28 })}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 12 }}>
            Payment Method Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { method: 'UPI / QR Payment (GPay/PhonePe)', pct: 68, color: T.green, orders: '712 Orders' },
              { method: 'Credit & Debit Cards', pct: 22, color: T.blue, orders: '230 Orders' },
              { method: 'Cash on Delivery (COD)', pct: 10, color: T.amber, orders: '106 Orders' },
            ].map((pm, idx) => (
              <div key={idx} style={{ background: T.subtle, padding: '10px 14px', borderRadius: 16, border: `1px solid ${T.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
                  <span>{pm.method}</span>
                  <span style={{ color: pm.color }}>{pm.pct}% ({pm.orders})</span>
                </div>
                <div style={{ width: '100%', height: 6, background: T.lineSoft, borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: `${pm.pct}%`, height: '100%', background: pm.color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
