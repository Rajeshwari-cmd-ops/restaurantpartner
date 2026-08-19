import React, { useState } from 'react';
import {
  TrendingUp,
  PlusCircle,
  Search,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit3,
  X,
  Zap,
  Calendar,
  ShoppingBag,
  Gift,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { formatINR } from '../utils/formatters';
import { mockPromotions } from '../mock/promotions';
import type { Promotion } from '../types';

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

export const PromotionsPage: React.FC = () => {
  const { addToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal & Drawer States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Promotion | null>(null);
  const [selectedOrdersOffer, setSelectedOrdersOffer] = useState<Promotion | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'flat'>('percentage');
  const [formVal, setFormVal] = useState<number>(20);
  const [formMinOrder, setFormMinOrder] = useState<number>(499);
  const [formStartDate, setFormStartDate] = useState('2026-08-01');
  const [formEndDate, setFormEndDate] = useState('2026-08-31');

  // Simple KPI Calculations
  const runningCount = promotions.filter(p => p.status === 'active').length;
  const ordersWithOffer = promotions.reduce((acc, p) => acc + p.ordersUsed, 0);
  const salesFromOffers = promotions.reduce((acc, p) => acc + p.revenueGenerated, 0);
  const totalDiscountGiven = promotions.reduce((acc, p) => {
    const estDiscount = p.discountType === 'percentage' 
      ? Math.round(p.revenueGenerated * (p.discountValue / 100))
      : p.ordersUsed * p.discountValue;
    return acc + estDiscount;
  }, 0);

  // Filter Pipeline
  let filtered = promotions;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (quickFilter !== 'all') {
    filtered = filtered.filter(p => p.status === quickFilter);
  }

  // Action: Toggle Pause / Resume
  const handleToggleStatus = (id: string) => {
    setPromotions(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus = p.status === 'active' ? 'paused' : 'active';
          addToast(
            nextStatus === 'active' ? 'Offer Resumed' : 'Offer Paused',
            `Offer ${p.code} is now ${nextStatus === 'active' ? 'running live' : 'paused'}.`,
            nextStatus === 'active' ? 'success' : 'info'
          );
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Action: End Offer
  const handleEndOffer = (id: string) => {
    setPromotions(prev =>
      prev.map(p => {
        if (p.id === id) {
          addToast('Offer Ended', `Offer ${p.code} has been marked as ended.`, 'warning');
          return { ...p, status: 'expired' };
        }
        return p;
      })
    );
    setActiveMenuId(null);
  };

  // Action: Duplicate Offer
  const handleDuplicateOffer = (promo: Promotion) => {
    const duplicate: Promotion = {
      ...promo,
      id: `promo-${Date.now()}`,
      name: `${promo.name} (Copy)`,
      code: `${promo.code}_COPY`,
      ordersUsed: 0,
      revenueGenerated: 0,
      status: 'scheduled',
      performanceRoi: 'Scheduled',
    };
    setPromotions(prev => [duplicate, ...prev]);
    addToast('Offer Duplicated', `Created copy: ${duplicate.code}`, 'success');
    setActiveMenuId(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (promo: Promotion) => {
    setEditingOffer(promo);
    setFormName(promo.name);
    setFormCode(promo.code);
    setFormDesc(promo.description);
    setFormType(promo.discountType);
    setFormVal(promo.discountValue);
    setFormMinOrder(promo.minOrderValue);
    setFormStartDate(promo.startDate);
    setFormEndDate(promo.endDate);
    setShowCreateModal(true);
    setActiveMenuId(null);
  };

  // Save Modal Submit
  const handleSaveOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      setPromotions(prev =>
        prev.map(p =>
          p.id === editingOffer.id
            ? {
                ...p,
                name: formName,
                code: formCode.toUpperCase(),
                description: formDesc,
                discountType: formType,
                discountValue: formVal,
                minOrderValue: formMinOrder,
                startDate: formStartDate,
                endDate: formEndDate,
              }
            : p
        )
      );
      addToast('Offer Updated', `Updated offer ${formCode.toUpperCase()}`, 'success');
    } else {
      const newPromo: Promotion = {
        id: `promo-${Date.now()}`,
        name: formName || 'Special Restaurant Offer',
        code: (formCode || 'OFFER10').toUpperCase(),
        description: formDesc || `Flat ${formType === 'percentage' ? `${formVal}%` : `₹${formVal}`} OFF`,
        discountType: formType,
        discountValue: formVal,
        minOrderValue: formMinOrder,
        startDate: formStartDate,
        endDate: formEndDate,
        status: 'active',
        ordersUsed: 0,
        revenueGenerated: 0,
        budget: 100000,
        performanceRoi: 'Active',
      };
      setPromotions(prev => [newPromo, ...prev]);
      addToast('Offer Created', `New offer code ${newPromo.code} is now live!`, 'success');
    }
    setShowCreateModal(false);
    setEditingOffer(null);
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>

      {/* ── 1. SIMPLE RESTAURANT KPI SUMMARY BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {/* KPI 1: Running Offers */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Running Offers
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {runningCount} Active
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ● Live for customers
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Zap size={14} />
            </div>
          </div>
        </div>

        {/* KPI 2: Orders with Offer */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Orders with Offer
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {ordersWithOffer.toLocaleString()} Orders
              </div>
              <div style={{ fontSize: 10.5, color: T.blue, fontWeight: 600 }}>
                Total discount usage
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShoppingBag size={14} />
            </div>
          </div>
        </div>

        {/* KPI 3: Sales from Offers */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sales from Offers
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatINR(salesFromOffers)}
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ↑ Gross sales driven
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <TrendingUp size={14} />
            </div>
          </div>
        </div>

        {/* KPI 4: Total Discount Given */}
        <div style={cardStyle({ padding: '10px 14px', borderRadius: 22 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Discount Given
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatINR(totalDiscountGiven)}
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                Saved by customers
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.amberBg, color: T.amber,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Gift size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER STRIP & ADD NEW OFFER TOOLBAR ── */}
      <div style={cardStyle({ padding: '8px 14px', borderRadius: 24 })}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All Offers' },
              { id: 'active', label: '● Running' },
              { id: 'paused', label: '⏸ Paused' },
              { id: 'scheduled', label: '📅 Scheduled' },
              { id: 'expired', label: '🏁 Ended' },
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

          {/* Controls: Search & Primary Action */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.subtle, border: `1px solid ${T.line}`,
              borderRadius: 9999, padding: '4px 14px', width: 220,
            }}>
              <Search size={13} color={T.muted} />
              <input
                type="text"
                placeholder="Search offer name or code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 11.5, outline: 'none', width: '100%' }}
              />
            </div>

            <button
              onClick={() => {
                setEditingOffer(null);
                setFormName('');
                setFormCode('');
                setFormDesc('');
                setShowCreateModal(true);
              }}
              style={{
                height: 30, padding: '0 14px', background: T.brand, color: '#fff',
                border: 'none', borderRadius: 9999, fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                boxShadow: T.glow,
              }}
            >
              <PlusCircle size={13} /> Add New Offer
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. SIMPLE OFFER CARDS GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 12,
      }}>
        {filtered.map(promo => {
          const isPct = promo.discountType === 'percentage';
          const estDiscountAmt = isPct 
            ? Math.round(promo.revenueGenerated * (promo.discountValue / 100))
            : promo.ordersUsed * promo.discountValue;

          const statusLabel =
            promo.status === 'active' ? 'Running'
            : promo.status === 'paused' ? 'Paused'
            : promo.status === 'scheduled' ? 'Scheduled'
            : 'Ended';

          const statusColor =
            promo.status === 'active' ? T.green
            : promo.status === 'paused' ? T.amber
            : promo.status === 'scheduled' ? T.blue
            : T.muted;

          const statusBg =
            promo.status === 'active' ? T.greenBg
            : promo.status === 'paused' ? T.amberBg
            : promo.status === 'scheduled' ? T.blueBg
            : T.subtle;

          return (
            <div
              key={promo.id}
              style={cardStyle({
                padding: '16px 18px', borderRadius: 24,
                display: 'flex', flexDirection: 'column', gap: 12,
                position: 'relative',
              })}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = T.shadowHover;
                e.currentTarget.style.borderColor = T.brandSoft;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = T.shadowCard;
                e.currentTarget.style.borderColor = T.line;
              }}
            >
              {/* Card Header: Title + Promo Code + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em' }}>
                    {promo.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: T.brand, background: T.brandSoft,
                      padding: '2px 10px', borderRadius: 9999, letterSpacing: '0.04em', fontFamily: 'monospace',
                    }}>
                      {promo.code}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                    color: statusColor, background: statusBg,
                  }}>
                    ● {statusLabel}
                  </span>

                  {/* Context Menu Button */}
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === promo.id ? null : promo.id)}
                      style={{
                        width: 26, height: 26, borderRadius: 9999, background: 'transparent',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: T.muted, cursor: 'pointer',
                      }}
                    >
                      <MoreVertical size={13} />
                    </button>

                    {activeMenuId === promo.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: 28, width: 150,
                        background: '#ffffff', border: `1px solid ${T.line}`,
                        borderRadius: 16, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                        zIndex: 100, padding: 4, display: 'flex', flexDirection: 'column', gap: 1,
                      }}>
                        <button
                          onClick={() => handleOpenEdit(promo)}
                          style={{
                            padding: '6px 10px', fontSize: 11, fontWeight: 600, color: T.ink,
                            background: 'none', border: 'none', borderRadius: 9999, cursor: 'pointer',
                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <Edit3 size={12} /> Edit Offer
                        </button>

                        <button
                          onClick={() => handleDuplicateOffer(promo)}
                          style={{
                            padding: '6px 10px', fontSize: 11, fontWeight: 600, color: T.blue,
                            background: 'none', border: 'none', borderRadius: 9999, cursor: 'pointer',
                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <Copy size={12} /> Duplicate
                        </button>

                        <button
                          onClick={() => handleEndOffer(promo.id)}
                          style={{
                            padding: '6px 10px', fontSize: 11, fontWeight: 600, color: T.red,
                            background: 'none', border: 'none', borderRadius: 9999, cursor: 'pointer',
                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <Trash2 size={12} /> End Offer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Offer Details Box */}
              <div style={{
                background: T.subtle, padding: '10px 12px', borderRadius: 16,
                border: `1px solid ${T.line}`, fontSize: 11.5, color: T.body,
              }}>
                <div style={{ fontWeight: 700, color: T.ink, marginBottom: 2 }}>
                  {isPct ? `Flat ${promo.discountValue}% OFF` : `Flat ₹${promo.discountValue} OFF`}
                  <span style={{ fontSize: 10.5, fontWeight: 500, color: T.muted }}> (On orders above {formatINR(promo.minOrderValue)})</span>
                </div>
                <div style={{ fontSize: 10.5, color: T.muted }}>
                  {promo.description}
                </div>
              </div>

              {/* Offer Ends In / Validity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: T.muted, paddingLeft: 2 }}>
                <Calendar size={13} color={T.muted} />
                <span>Offer Validity: <strong>{promo.startDate}</strong> to <strong>{promo.endDate}</strong></span>
              </div>

              {/* Simple Metrics Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
                background: T.subtle, padding: '10px 12px', borderRadius: 16,
                textAlign: 'center', border: `1px solid ${T.line}`,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: T.muted }}>Orders with Offer</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{promo.ordersUsed}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted }}>Sales from Offer</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.brand }}>{formatINR(promo.revenueGenerated)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted }}>Discount Given</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.green }}>{formatINR(estDiscountAmt)}</div>
                </div>
              </div>

              {/* Bottom Actions: Pause/Resume + View Orders */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={() => handleToggleStatus(promo.id)}
                  style={{
                    flex: 1, height: 30, fontSize: 11.5, fontWeight: 700,
                    background: promo.status === 'active' ? T.amberBg : T.greenBg,
                    color: promo.status === 'active' ? T.amber : T.green,
                    border: `1px solid ${promo.status === 'active' ? T.amberBorder : T.greenBorder}`,
                    borderRadius: 9999, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  {promo.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
                </button>

                <button
                  onClick={() => setSelectedOrdersOffer(promo)}
                  style={{
                    flex: 1, height: 30, fontSize: 11.5, fontWeight: 700,
                    background: T.subtle, color: T.body,
                    border: `1px solid ${T.line}`,
                    borderRadius: 9999, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <ShoppingBag size={12} /> View Orders
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. CREATE / EDIT OFFER MODAL ── */}
      {showCreateModal && (
        <>
          <div onClick={() => setShowCreateModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '92vw', background: '#ffffff', borderRadius: 12,
            zIndex: 401, padding: 18, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink }}>
                {editingOffer ? 'Edit Offer' : 'Add New Offer'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveOfferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Offer Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Monsoon Weekend Special"
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Promo Code</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MONSOON20"
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 700,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none', fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Discount Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none', background: T.subtle,
                    }}
                  >
                    <option value="percentage">Percentage OFF (%)</option>
                    <option value="flat">Flat Amount OFF (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
                    {formType === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formVal}
                    onChange={e => setFormVal(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 13, fontWeight: 700,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={e => setFormMinOrder(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 13, fontWeight: 700,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Description / Offer Details</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="e.g. Flat 20% OFF on Orders above ₹499"
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 500,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    style={{
                      width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                      borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 34, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  {editingOffer ? 'Save Offer' : 'Publish Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    height: 34, padding: '0 14px', fontSize: 12, fontWeight: 600, color: T.body,
                    background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── 5. VIEW ORDERS DRAWER (FOR SELECTED OFFER) ── */}
      {selectedOrdersOffer && (
        <>
          <div onClick={() => setSelectedOrdersOffer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 440, maxWidth: '92vw', background: '#ffffff',
              zIndex: 401, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 20px rgba(15, 23, 42, 0.12)',
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '14px 18px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{selectedOrdersOffer.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>
                  Offer Code: <strong style={{ color: T.brand, fontFamily: 'monospace' }}>{selectedOrdersOffer.code}</strong> · {selectedOrdersOffer.ordersUsed} Orders Placed
                </div>
              </div>
              <button onClick={() => setSelectedOrdersOffer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Offer Summary Box */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 8, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Offer Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Total Sales Generated</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.brand }}>
                      {formatINR(selectedOrdersOffer.revenueGenerated)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Total Orders Placed</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                      {selectedOrdersOffer.ordersUsed} Orders
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders List placed using this offer */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                  Recent Orders Placed with {selectedOrdersOffer.code}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: '#FIC-8891', customer: 'Priya Sharma', amount: 680, date: 'Today, 1:15 PM', status: 'Delivered' },
                    { id: '#FIC-8840', customer: 'Anil Mehta', amount: 540, date: 'Yesterday, 8:30 PM', status: 'Delivered' },
                    { id: '#FIC-8790', customer: 'Rahul Verma', amount: 720, date: '3 days ago', status: 'Delivered' },
                  ].map((ord, i) => (
                    <div key={i} style={{
                      background: '#ffffff', padding: '10px 12px', borderRadius: 8,
                      border: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.brand }}>{ord.id}</div>
                        <div style={{ fontSize: 11, color: T.ink }}>{ord.customer} · <span style={{ color: T.muted }}>{ord.date}</span></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{formatINR(ord.amount)}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: T.greenBg, padding: '1px 5px', borderRadius: 4 }}>
                          ✓ {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div style={{ padding: '12px 18px', background: T.card, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  const targetId = selectedOrdersOffer.id;
                  setSelectedOrdersOffer(null);
                  handleToggleStatus(targetId);
                }}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: selectedOrdersOffer.status === 'active' ? T.amberBg : T.greenBg,
                  color: selectedOrdersOffer.status === 'active' ? T.amber : T.green,
                  border: `1px solid ${selectedOrdersOffer.status === 'active' ? T.amberBorder : T.greenBorder}`,
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                {selectedOrdersOffer.status === 'active' ? 'Pause Offer' : 'Resume Offer'}
              </button>

              <button
                onClick={() => {
                  const target = selectedOrdersOffer;
                  setSelectedOrdersOffer(null);
                  handleOpenEdit(target);
                }}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                Edit Offer Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
