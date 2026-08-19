import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Sparkles,
  Search,
  X,
  Send,
  ThumbsUp,
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

export interface ReputationReview {
  id: string;
  customerName: string;
  avatar: string;
  customerSegment: string;
  rating: number;
  orderNumber: string;
  orderAmount: number;
  orderedItems: string[];
  comment: string;
  date: string;
  replied: boolean;
  replyText?: string;
  replyDate?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const initialReviewsList: ReputationReview[] = [
  {
    id: 'rev-1',
    customerName: 'Aarav Mehta',
    avatar: 'AM',
    customerSegment: 'VIP Platinum',
    rating: 5,
    orderNumber: '#FIC-8891',
    orderAmount: 680,
    orderedItems: ['Fresh Malai Paneer Tikka', 'Garlic Butter Naan', 'Sweet Lassi'],
    comment: 'Best Paneer Butter Masala in town! Arrived super hot, fresh, and perfectly packaged.',
    date: 'Today, 2 hours ago',
    replied: true,
    replyText: 'Thank you so much Aarav! We are thrilled to be your favorite Indian kitchen in Electronic City.',
    replyDate: '1 hour ago',
    sentiment: 'Positive',
  },
  {
    id: 'rev-2',
    customerName: 'Priya Sharma',
    avatar: 'PS',
    customerSegment: 'VIP Gold',
    rating: 4,
    orderNumber: '#FIC-8890',
    orderAmount: 540,
    orderedItems: ['Chicken Dum Biryani (Full)', 'Mirchi Ka Salan'],
    comment: 'Biryani was delicious and full of authentic spice. Great portion size, will reorder!',
    date: 'Yesterday, 8:15 PM',
    replied: false,
    sentiment: 'Positive',
  },
  {
    id: 'rev-3',
    customerName: 'Siddharth Verma',
    avatar: 'SV',
    customerSegment: 'Regular',
    rating: 2,
    orderNumber: '#FIC-8850',
    orderAmount: 920,
    orderedItems: ['Mutton Rogan Josh', 'Butter Roti (4x)'],
    comment: 'Delivery took almost 50 minutes. Food was lukewarm and bread became slightly chewy.',
    date: '3 days ago',
    replied: true,
    replyText: 'We sincerely apologize Siddharth. We have escalated this to our express dispatch team to ensure faster delivery.',
    replyDate: '2 days ago',
    sentiment: 'Negative',
  },
  {
    id: 'rev-4',
    customerName: 'Sneha Kulkarni',
    avatar: 'SK',
    customerSegment: 'New Guest',
    rating: 5,
    orderNumber: '#FIC-8888',
    orderAmount: 430,
    orderedItems: ['Paneer Tikka Roll', 'Mango Lassi'],
    comment: 'First time ordering from Forge India Connect! Outstanding taste and premium eco-friendly packaging.',
    date: '4 days ago',
    replied: false,
    sentiment: 'Positive',
  },
  {
    id: 'rev-5',
    customerName: 'Rahul Verma',
    avatar: 'RV',
    customerSegment: 'VIP Gold',
    rating: 5,
    orderNumber: '#FIC-8872',
    orderAmount: 780,
    orderedItems: ['Dal Makhani Slow Cooked', 'Jeera Rice', 'Gulab Jamun'],
    comment: 'Slow cooked dal makhani was incredible as usual. 5 star rating every single time!',
    date: '5 days ago',
    replied: true,
    replyText: 'Thank you Rahul! Our chefs slow cook the Dal Makhani overnight for 12 hours.',
    replyDate: '4 days ago',
    sentiment: 'Positive',
  },
];

export const ReviewsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReputationReview[]>(initialReviewsList);
  const [selectedReview, setSelectedReview] = useState<ReputationReview | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'critical'>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer Reply State
  const [replyInput, setReplyInput] = useState('');

  // Filter Pipeline
  let filtered = reviews;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      r =>
        r.customerName.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.orderedItems.some(item => item.toLowerCase().includes(q))
    );
  }

  if (activeTab === 'pending') {
    filtered = filtered.filter(r => !r.replied);
  } else if (activeTab === 'critical') {
    filtered = filtered.filter(r => r.rating <= 3);
  }

  if (starFilter !== 'all') {
    filtered = filtered.filter(r => r.rating === starFilter);
  }

  // Analytics Metrics
  const avgRating = 4.8;
  const pendingCount = reviews.filter(r => !r.replied).length;

  // AI Reply Presets
  const getAiReplySuggestion = (review: ReputationReview) => {
    if (review.rating >= 4) {
      return `Dear ${review.customerName}, thank you so much for the fantastic ${review.rating}-star review! We are delighted that you enjoyed the ${review.orderedItems[0] || 'meal'}. We look forward to cooking for you again soon!`;
    }
    return `Dear ${review.customerName}, thank you for your feedback regarding order ${review.orderNumber}. We sincerely apologize that your experience fell short. We have shared this with our head chef and dispatch manager to fix this immediately.`;
  };

  // Submit Official Response
  const handlePublishReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !replyInput.trim()) return;

    const updatedReview: ReputationReview = {
      ...selectedReview,
      replied: true,
      replyText: replyInput,
      replyDate: 'Just now',
    };

    setReviews(prev => prev.map(r => (r.id === selectedReview.id ? updatedReview : r)));
    setSelectedReview(updatedReview);
    setReplyInput('');
    addToast('Response Published', `Official restaurant reply sent for ${selectedReview.customerName}'s review.`, 'success');
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. REPUTATION EXECUTIVE KPI DASHBOARD (4 CARDS)
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {/* KPI 1: Overall Rating */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Outlet Rating
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.amber, fontVariantNumeric: 'tabular-nums', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>★ {avgRating}</span>
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 2 }}>
                Based on 1,420 Verified Orders
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.amberBg, color: T.amber,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Star size={16} fill={T.amber} />
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Responses */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Replies
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.brand, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {pendingCount} Reviews
              </div>
              <div style={{ fontSize: 11, color: T.brand, fontWeight: 700, marginTop: 2 }}>
                ● Action Needed
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MessageSquare size={16} />
            </div>
          </div>
        </div>

        {/* KPI 3: Positive Sentiment */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Positive Sentiment
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.green, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                94.8%
              </div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginTop: 2 }}>
                ↑ +2.1% vs last month
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ThumbsUp size={16} />
            </div>
          </div>
        </div>

        {/* KPI 4: AI Reply Speed */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Smart Replies
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                Enabled
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 2 }}>
                1-Click Sentiment Assistant
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. ENTERPRISE REPUTATION TOOLBAR & FILTERS
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '12px 20px', borderRadius: 28 })}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Sub-Tabs */}
          <div style={{ display: 'flex', gap: 4, background: T.subtle, padding: 4, borderRadius: 9999, border: `1px solid ${T.line}` }}>
            {[
              { id: 'all', label: `All Reviews (${reviews.length})` },
              { id: 'pending', label: `⚠️ Pending Reply (${pendingCount})` },
              { id: 'critical', label: '🚨 Critical (1-3★)' },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    height: 36, padding: '0 18px', fontSize: 12, fontWeight: 700, borderRadius: 9999,
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

          {/* Search Bar & Star Filter */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.subtle, border: `1px solid ${T.line}`,
              borderRadius: 9999, padding: '5px 14px', width: 220,
            }}>
              <Search size={14} color={T.muted} />
              <input
                type="text"
                placeholder="Search dish, guest..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: '100%' }}
              />
            </div>

            <select
              value={starFilter.toString()}
              onChange={e => setStarFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              style={{
                height: 36, padding: '0 14px', fontSize: 11.5, fontWeight: 700,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, color: T.body, cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="all">All Rating Stars</option>
              <option value="5">★ 5 Stars Only</option>
              <option value="4">★ 4 Stars Only</option>
              <option value="3">★ 3 Stars Only</option>
              <option value="2">★ 1-2 Stars Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. REVIEWS LIST (CLICKABLE CARDS + LINKED ORDER/CUSTOMER)
      ═══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(rev => (
          <div
            key={rev.id}
            onClick={() => {
              setSelectedReview(rev);
              setReplyInput(rev.replyText || '');
            }}
            style={cardStyle({
              padding: '18px 22px', borderRadius: 28,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12,
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
            {/* Header Line: Customer Info + Rating Badge + Order Ref */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: rev.customerSegment.includes('VIP') ? 'linear-gradient(135deg, #FF7A30 0%, #E05A10 100%)' : T.subtle,
                  color: rev.customerSegment.includes('VIP') ? '#fff' : T.ink,
                  border: `1px solid ${rev.customerSegment.includes('VIP') ? T.brand : T.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, flexShrink: 0,
                }}>
                  {rev.avatar}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/customers');
                      }}
                      style={{ fontSize: 15, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em' }}
                      className="hover:underline"
                    >
                      {rev.customerName}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: rev.customerSegment.includes('VIP') ? T.amber : T.body,
                      background: rev.customerSegment.includes('VIP') ? T.amberBg : T.subtle,
                      border: `1px solid ${rev.customerSegment.includes('VIP') ? T.amberBorder : T.line}`,
                    }}>
                      {rev.customerSegment}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>
                    {rev.date}
                  </div>
                </div>
              </div>

              {/* Rating Star Badge & Linked Order Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 9999,
                  color: rev.rating >= 4 ? T.amber : T.red,
                  background: rev.rating >= 4 ? T.amberBg : T.redBg,
                  border: `1px solid ${rev.rating >= 4 ? T.amberBorder : T.redBorder}`,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  ★ {rev.rating}.0 / 5
                </span>

                <span
                  onClick={e => {
                    e.stopPropagation();
                    navigate('/dashboard');
                  }}
                  style={{
                    fontSize: 12, fontWeight: 800, color: T.brand, fontFamily: 'monospace',
                    background: T.brandSoft, padding: '4px 10px', borderRadius: 9999,
                    border: '1px solid rgba(255,107,44,0.2)',
                  }}
                >
                  Order {rev.orderNumber}
                </span>
              </div>
            </div>

            {/* Ordered Dish Tag Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {rev.orderedItems.map((dish, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 700, color: T.body, background: T.subtle,
                  padding: '2px 8px', borderRadius: 9999, border: `1px solid ${T.line}`,
                }}>
                  🥘 {dish}
                </span>
              ))}
            </div>

            {/* Review Comment Body */}
            <p style={{ fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              "{rev.comment}"
            </p>

            {/* Official Restaurant Response Block or AI Reply CTA */}
            {rev.replied ? (
              <div style={{
                background: T.subtle, padding: '12px 16px', borderRadius: 18,
                borderLeft: `4px solid ${T.brand}`, border: `1px solid ${T.line}`,
                fontSize: 12.5,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: 800, color: T.brand }}>👨‍🍳 Official Restaurant Response</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{rev.replyDate || 'Recently'}</span>
                </div>
                <div style={{ color: T.body, marginTop: 2 }}>{rev.replyText}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11.5, color: T.amber, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  ⚠️ Unreplied Customer Review
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedReview(rev);
                    setReplyInput(getAiReplySuggestion(rev));
                  }}
                  style={{
                    height: 32, padding: '0 14px', fontSize: 11.5, fontWeight: 800,
                    background: T.brandSoft, color: T.brand, border: '1px solid rgba(255,107,44,0.3)',
                    borderRadius: 9999, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Sparkles size={13} /> ✨ Generate AI Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          4. REVIEW INSPECTOR & AI REPLY DRAWER
      ═══════════════════════════════════════════════════ */}
      {selectedReview && (
        <>
          <div
            onClick={() => setSelectedReview(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 480, maxWidth: '92vw', background: '#ffffff',
              zIndex: 401, display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.18)',
              borderTopLeftRadius: 28, borderBottomLeftRadius: 28, overflow: 'hidden',
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '18px 24px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{selectedReview.customerName}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: T.amber, background: T.amberBg, padding: '2px 8px', borderRadius: 9999 }}>
                    ★ {selectedReview.rating}.0 Rating
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  Order {selectedReview.orderNumber} ({formatINR(selectedReview.orderAmount)}) · {selectedReview.date}
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                style={{
                  width: 34, height: 34, borderRadius: 9999, background: T.subtle,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Review Comment Card */}
              <div style={{ background: T.subtle, padding: '16px', borderRadius: 20, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Customer Feedback Comment
                </div>
                <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5, fontWeight: 500, fontStyle: 'italic' }}>
                  "{selectedReview.comment}"
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedReview.orderedItems.map((item, idx) => (
                    <span key={idx} style={{ fontSize: 11, fontWeight: 700, color: T.body, background: '#fff', padding: '3px 8px', borderRadius: 9999, border: `1px solid ${T.line}` }}>
                      🥘 {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* ✨ AI Smart Reply Generator Suggestions */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.brand, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> ✨ AI Response Suggestions
                </div>

                <button
                  type="button"
                  onClick={() => setReplyInput(getAiReplySuggestion(selectedReview))}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 12, fontWeight: 600,
                    background: T.brandSoft, border: '1px solid rgba(255,107,44,0.3)',
                    borderRadius: 16, color: T.ink, textAlign: 'left', cursor: 'pointer',
                    lineHeight: 1.4, transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, marginBottom: 2 }}>
                    Click to load AI Custom Preset:
                  </div>
                  "{getAiReplySuggestion(selectedReview)}"
                </button>
              </div>

              {/* Response Publisher Form */}
              <form onSubmit={handlePublishReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Official Restaurant Response
                  </label>
                  <textarea
                    value={replyInput}
                    onChange={e => setReplyInput(e.target.value)}
                    placeholder="Type official response to customer..."
                    style={{
                      width: '100%', height: 110, padding: '12px 14px', fontSize: 12.5, fontWeight: 500,
                      borderRadius: 18, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                      resize: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    height: 42, fontSize: 12.5, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 9999, cursor: 'pointer',
                    boxShadow: T.glow, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Send size={15} /> {selectedReview.replied ? 'Update Response' : 'Publish Response'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
