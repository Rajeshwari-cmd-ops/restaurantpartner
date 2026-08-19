import React, { useState } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  X,
  Send,
  UserCheck,
  HelpCircle,
  Headphones,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

// Design Tokens (Enterprise SaaS Palette - Matching Application Theme)
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

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: 'Order Dispatch' | 'Payout Settlement' | 'Menu Update' | 'Kitchen Hardware' | 'Rider Issue';
  subject: string;
  description: string;
  orderRef?: string;
  priority: 'Urgent' | 'High' | 'Normal';
  createdDate: string;
  slaTarget: string;
  status: 'In Progress' | 'Pending Partner Input' | 'Resolved';
  lastResponse: string;
}

const initialTickets: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'TKT-99201',
    category: 'Order Dispatch',
    subject: 'Delayed Rider Assignment for Order #FIC-8891',
    description: 'Order food is cooked and ready for pickup, but auto-assign is taking over 12 mins.',
    orderRef: '#FIC-8891',
    priority: 'Urgent',
    createdDate: 'Today, 10:15 AM',
    slaTarget: 'SLA: 8m left',
    status: 'In Progress',
    lastResponse: 'Priority Express Ops is re-routing nearest rider (Anil V).',
  },
  {
    id: 'tkt-2',
    ticketNumber: 'TKT-98840',
    category: 'Payout Settlement',
    subject: 'Weekly Bank Settlement Tax Invoice Discrepancy',
    description: 'Requesting breakdown for GST input credit on last week payout cycle ending 28 Jul.',
    priority: 'Normal',
    createdDate: 'Yesterday, 04:30 PM',
    slaTarget: 'SLA Met (1h 12m)',
    status: 'Pending Partner Input',
    lastResponse: 'Accounts team attached tax invoice reconciliation worksheet.',
  },
  {
    id: 'tkt-3',
    ticketNumber: 'TKT-97102',
    category: 'Menu Update',
    subject: 'Add Combo Category & Update Paneer Tikka Pricing',
    description: 'Bulk update request for 4 menu items in Tandoor section.',
    priority: 'Normal',
    createdDate: '3 days ago',
    slaTarget: 'Resolved in 24m',
    status: 'Resolved',
    lastResponse: 'Menu catalogue updated successfully for live orders.',
  },
];

const faqsList = [
  {
    question: 'How do daily & weekly payout settlements work?',
    answer: 'Payouts are automatically settled into your registered bank account every Tuesday by 12:00 PM. Live order earnings and deductions can be audited under the Finance module.',
  },
  {
    question: 'What should I do if a rider is delayed for a live order?',
    answer: 'If a rider is not assigned within 8 minutes of food preparation, click "Auto-Reassign Rider" on the Delivery page or open a live 24/7 priority chat ticket.',
  },
  {
    question: 'How do I mark a dish out of stock (86’d) immediately?',
    answer: 'Navigate to Menu Management, search for the dish, and toggle the "86 Dish" switch to hide it instantly across all online ordering channels.',
  },
  {
    question: 'Where can I request changes to GST or Bank Account details?',
    answer: 'You can submit updated bank passbooks or GST certificates via the Raise Ticket drawer under the "Payout Settlement" category for compliance review.',
  },
];

export const SupportPage: React.FC = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState<'tickets' | 'faqs' | 'history'>('tickets');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Drawer State
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('Order Dispatch');
  const [newSubject, setNewSubject] = useState('');
  const [newOrderRef, setNewOrderRef] = useState('#FIC-8891');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('Urgent');
  const [newMessage, setNewMessage] = useState('');

  // Live Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello Rajesh! I am Anand from Priority Partner Support. How can I assist with your live order or store operations today?' },
  ]);

  // Filtered Tickets
  let filteredTickets = tickets;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filteredTickets = filteredTickets.filter(
      t =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.orderRef && t.orderRef.toLowerCase().includes(q))
    );
  }
  if (ticketFilter === 'active') {
    filteredTickets = filteredTickets.filter(t => t.status !== 'Resolved');
  } else if (ticketFilter === 'resolved') {
    filteredTickets = filteredTickets.filter(t => t.status === 'Resolved');
  }

  // Handle New Ticket Submission
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      addToast('Validation Error', 'Please enter a ticket subject summary.', 'warning');
      return;
    }

    const created: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      category: newCategory,
      subject: newSubject,
      description: newMessage || 'No additional details provided.',
      orderRef: newOrderRef || undefined,
      priority: newPriority,
      createdDate: 'Just now',
      slaTarget: newPriority === 'Urgent' ? 'SLA: 15m Express' : 'SLA: 2h Target',
      status: 'In Progress',
      lastResponse: 'Ticket logged. Support agent assigned to your request.',
    };

    setTickets(prev => [created, ...prev]);
    setShowCreateDrawer(false);
    setNewSubject('');
    setNewMessage('');
    addToast('Support Ticket Created', `Ticket ${created.ticketNumber} raised successfully.`, 'success');
  };

  // Handle Send Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Simulate Agent Reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'agent', text: `Got it, Rajesh. I am checking the live status for your request regarding "${userText}". Standby for 30 seconds.` },
      ]);
    }, 1000);
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. EXECUTIVE PRIORITY HELPDESK HEADER & KPI BAR (4 CARDS)
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {/* KPI 1: Active Tickets */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Tickets
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {tickets.filter(t => t.status !== 'Resolved').length} Tickets
              </div>
              <div style={{ fontSize: 11, color: T.brand, fontWeight: 700, marginTop: 2 }}>
                ● 1 Express Urgent SLA
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LifeBuoy size={16} />
            </div>
          </div>
        </div>

        {/* KPI 2: Avg Response Speed */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avg Response Speed
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.green, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                4.2 Mins
              </div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginTop: 2 }}>
                ✓ Guaranteed &lt; 15m SLA
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Clock size={16} />
            </div>
          </div>
        </div>

        {/* KPI 3: Resolved Tickets */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resolved (30D)
              </span>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                24 Issues
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 2 }}>
                ★ 98.2% CSAT Satisfaction
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>

        {/* KPI 4: Partner Account Lead */}
        <div style={cardStyle({ padding: '14px 18px', borderRadius: 24 })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Partner Success Manager
              </span>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginTop: 2 }}>
                Anand V. (Tier 1 Lead)
              </div>
              <div style={{ fontSize: 11, color: T.brand, fontWeight: 700, marginTop: 2 }}>
                ● Direct Agent Online
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.purpleBg, color: T.purple,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UserCheck size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. EXPRESS CONTACT CHANNELS STRIP (TOLL FREE + CHAT)
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 14,
      }}>
        {/* Priority Toll-Free Card */}
        <div style={cardStyle({ padding: '16px 20px', borderRadius: 28, background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F3 100%)' })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: T.brandSoft, color: T.brand,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 122, 48, 0.15)',
              }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  24/7 Priority Express Toll-Free
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.ink, marginTop: 1, letterSpacing: '-0.01em' }}>
                  1800-102-9900
                </div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>
                  Dedicated line for live order &amp; dispatch emergencies
                </div>
              </div>
            </div>

            <button
              onClick={() => addToast('Calling Support', 'Initiating call to 1800-102-9900...', 'info')}
              style={{
                height: 38, padding: '0 18px', fontSize: 12, fontWeight: 800,
                background: T.brand, color: '#fff', border: 'none', borderRadius: 9999,
                cursor: 'pointer', boxShadow: T.glow, display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Call Now
            </button>
          </div>
        </div>

        {/* Live Partner Chat Card */}
        <div style={cardStyle({ padding: '16px 20px', borderRadius: 28, background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F8FF 100%)' })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: T.blueBg, color: T.blue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Instant Partner Live Chat
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: T.ink, marginTop: 1 }}>
                  Anand V. (Live Support)
                </div>
                <div style={{ fontSize: 11.5, color: T.green, fontWeight: 700, marginTop: 2 }}>
                  ● Typically replies in &lt; 2 minutes
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLiveChat(true)}
              style={{
                height: 38, padding: '0 18px', fontSize: 12, fontWeight: 800,
                background: T.blue, color: '#fff', border: 'none', borderRadius: 9999,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
              }}
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. MAIN TAB NAVIGATION & TOOLBAR
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '12px 20px', borderRadius: 28 })}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Sub-Tabs */}
          <div style={{ display: 'flex', gap: 4, background: T.subtle, padding: 4, borderRadius: 9999, border: `1px solid ${T.line}` }}>
            {[
              { id: 'tickets', label: `My Tickets (${tickets.length})`, icon: <LifeBuoy size={14} /> },
              { id: 'faqs', label: 'Help Center FAQs', icon: <HelpCircle size={14} /> },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    height: 36, padding: '0 18px', fontSize: 12, fontWeight: 700, borderRadius: 9999,
                    border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? T.brand : T.muted,
                    boxShadow: isActive ? '0 1px 4px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Primary Trigger: Raise Support Ticket */}
          <button
            onClick={() => setShowCreateDrawer(true)}
            style={{
              height: 38, padding: '0 18px', fontSize: 12.5, fontWeight: 800,
              background: T.brand, color: '#fff', border: 'none', borderRadius: 9999,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: T.glow,
            }}
          >
            <PlusCircle size={15} /> Raise Support Ticket
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          4. TAB 1: MY SUPPORT TICKETS LIST & FILTERS
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Filter Pills + Search Bar */}
          <div style={cardStyle({ padding: '10px 18px', borderRadius: 28 })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

              {/* Quick Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { id: 'all', label: 'All Tickets' },
                  { id: 'active', label: '● Active & In Progress' },
                  { id: 'resolved', label: '✓ Resolved' },
                ].map(chip => {
                  const isActive = ticketFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setTicketFilter(chip.id)}
                      style={{
                        height: 32, padding: '0 14px', fontSize: 11.5, fontWeight: 700,
                        borderRadius: 9999, border: `1px solid ${isActive ? T.brand : T.line}`,
                        background: isActive ? T.brandSoft : T.subtle,
                        color: isActive ? T.brand : T.body,
                        cursor: 'pointer', transition: 'all 0.12s ease',
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, padding: '5px 14px', width: 240,
              }}>
                <Search size={14} color={T.muted} />
                <input
                  type="text"
                  placeholder="Search ticket #, subject..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Tickets Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTickets.map(tkt => (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicket(tkt)}
                style={cardStyle({
                  padding: '16px 20px', borderRadius: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, flexWrap: 'wrap', cursor: 'pointer',
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
                {/* Column 1: Ticket # + Subject + Category */}
                <div style={{ minWidth: 280, flex: 1.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: T.brand, fontFamily: 'monospace' }}>
                      {tkt.ticketNumber}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: T.body, background: T.subtle, border: `1px solid ${T.line}`,
                    }}>
                      {tkt.category}
                    </span>
                    {tkt.priority === 'Urgent' && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                        color: T.red, background: T.redBg, border: `1px solid ${T.redBorder}`,
                      }}>
                        ⚡ URGENT PRIORITY
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em' }}>
                    {tkt.subject}
                  </div>

                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{tkt.createdDate}</span>
                    {tkt.orderRef && (
                      <>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: T.body }}>Order {tkt.orderRef}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Column 2: SLA Status & Last Agent Response */}
                <div style={{ minWidth: 200, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.brand }}>
                    {tkt.slaTarget}
                  </div>
                  <div style={{ fontSize: 12, color: T.body, fontStyle: 'italic', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
                    "{tkt.lastResponse}"
                  </div>
                </div>

                {/* Column 3: Status Badge */}
                <div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 9999,
                    color: tkt.status === 'In Progress' ? T.brand : tkt.status === 'Resolved' ? T.green : T.amber,
                    background: tkt.status === 'In Progress' ? T.brandSoft : tkt.status === 'Resolved' ? T.greenBg : T.amberBg,
                    border: `1px solid ${tkt.status === 'In Progress' ? 'rgba(255,107,44,0.3)' : tkt.status === 'Resolved' ? T.greenBorder : T.amberBorder}`,
                    whiteSpace: 'nowrap',
                  }}>
                    ● {tkt.status.toUpperCase()}
                  </span>
                </div>

                {/* Column 4: Action Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedTicket(tkt)}
                    style={{
                      height: 34, padding: '0 14px', fontSize: 12, fontWeight: 700,
                      background: T.subtle, color: T.brand, border: `1px solid ${T.line}`,
                      borderRadius: 9999, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.brandSoft;
                      e.currentTarget.style.borderColor = 'rgba(255,107,44,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = T.subtle;
                      e.currentTarget.style.borderColor = T.line;
                    }}
                  >
                    View <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          5. TAB 2: HELP CENTER KNOWLEDGE BASE FAQs
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'faqs' && (
        <div style={cardStyle({ padding: '20px 24px', borderRadius: 28 })}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0 }}>
              Partner Knowledge Base &amp; Frequently Asked Questions
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>
              Instant answers to order dispatch, rider assignment, bank settlements, and menu updates.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqsList.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: T.subtle, border: `1px solid ${T.line}`,
                  borderRadius: 18, padding: '14px 18px',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={16} color={T.brand} />
                  <span>{faq.question}</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.body, marginTop: 6, lineHeight: 1.5, paddingLeft: 24 }}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          6. SLIDE-IN RAISE SUPPORT TICKET DRAWER
      ═══════════════════════════════════════════════════ */}
      {showCreateDrawer && (
        <>
          <div
            onClick={() => setShowCreateDrawer(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 460, maxWidth: '92vw', background: '#ffffff',
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
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>Raise a Support Ticket</div>
                <div style={{ fontSize: 12, color: T.muted }}>Guaranteed response from Priority Partner Desk</div>
              </div>

              <button
                onClick={() => setShowCreateDrawer(false)}
                style={{
                  width: 34, height: 34, borderRadius: 9999, background: T.subtle,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleCreateTicketSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Issue Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%', height: 40, padding: '0 14px', fontSize: 12.5, fontWeight: 700,
                    borderRadius: 9999, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none', background: T.subtle,
                  }}
                >
                  <option value="Order Dispatch">Order Dispatch &amp; Rider Assignment</option>
                  <option value="Payout Settlement">Bank Settlement &amp; GST Payouts</option>
                  <option value="Menu Update">Menu Catalogue &amp; Price Update</option>
                  <option value="Kitchen Hardware">Kitchen Hardware &amp; Sync</option>
                  <option value="Rider Issue">Rider Conduct &amp; Delay</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Priority Level
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {(['Normal', 'High', 'Urgent'] as const).map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      style={{
                        flex: 1, height: 36, fontSize: 12, fontWeight: 700, borderRadius: 9999,
                        border: `1px solid ${newPriority === p ? T.brand : T.line}`,
                        background: newPriority === p ? T.brandSoft : T.subtle,
                        color: newPriority === p ? T.brand : T.body,
                        cursor: 'pointer', transition: 'all 0.12s ease',
                      }}
                    >
                      {p === 'Urgent' ? '⚡ Urgent' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Related Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={newOrderRef}
                  onChange={e => setNewOrderRef(e.target.value)}
                  placeholder="e.g. #FIC-8891"
                  style={{
                    width: '100%', height: 40, padding: '0 14px', fontSize: 12.5, fontWeight: 700,
                    borderRadius: 9999, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Subject Summary
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="Brief summary of your request..."
                  style={{
                    width: '100%', height: 40, padding: '0 14px', fontSize: 12.5, fontWeight: 700,
                    borderRadius: 9999, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Detailed Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Provide order details or specific issue notes..."
                  style={{
                    width: '100%', height: 110, padding: '12px 14px', fontSize: 12.5, fontWeight: 500,
                    borderRadius: 18, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                    resize: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Submit Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 42, fontSize: 12.5, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 9999, cursor: 'pointer',
                    boxShadow: T.glow,
                  }}
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateDrawer(false)}
                  style={{
                    height: 42, padding: '0 18px', fontSize: 12.5, fontWeight: 700, color: T.body,
                    background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 9999, cursor: 'pointer',
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
          7. TICKET DETAILS INSPECTOR DRAWER
      ═══════════════════════════════════════════════════ */}
      {selectedTicket && (
        <>
          <div
            onClick={() => setSelectedTicket(null)}
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
                  <span style={{ fontSize: 16, fontWeight: 900, color: T.brand, fontFamily: 'monospace' }}>{selectedTicket.ticketNumber}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: T.body, background: T.subtle, padding: '2px 8px', borderRadius: 9999 }}>
                    {selectedTicket.category}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{selectedTicket.subject}</div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
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

              {/* Status & SLA Bar */}
              <div style={{ background: T.subtle, padding: '14px 16px', borderRadius: 18, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  SLA Target &amp; Current Status
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.brand }}>{selectedTicket.slaTarget}</div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 9999,
                    color: selectedTicket.status === 'In Progress' ? T.brand : T.green,
                    background: selectedTicket.status === 'In Progress' ? T.brandSoft : T.greenBg,
                    border: `1px solid ${selectedTicket.status === 'In Progress' ? 'rgba(255,107,44,0.3)' : T.greenBorder}`,
                  }}>
                    ● {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Initial Issue Description */}
              <div style={{ background: T.subtle, padding: '14px 16px', borderRadius: 18, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Initial Description
                </div>
                <div style={{ fontSize: 12.5, color: T.body, lineHeight: 1.5 }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Agent Activity Timeline */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 10 }}>
                  Agent Activity &amp; Support Audit
                </div>

                <div style={{ background: T.brandSoft, border: `1px solid rgba(255,107,44,0.25)`, padding: '12px 14px', borderRadius: 16, fontSize: 12 }}>
                  <div style={{ fontWeight: 800, color: T.brand }}>👨‍💼 Partner Agent Response (Anand V)</div>
                  <div style={{ color: T.body, marginTop: 4, lineHeight: 1.4 }}>"{selectedTicket.lastResponse}"</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Logged at {selectedTicket.createdDate}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: '16px 24px', background: T.card, borderTop: `1px solid ${T.line}`,
              display: 'flex', gap: 10,
            }}>
              <button
                onClick={() => {
                  setShowLiveChat(true);
                  setSelectedTicket(null);
                }}
                style={{
                  flex: 1, height: 42, fontSize: 12.5, fontWeight: 800,
                  background: T.blue, color: '#fff', border: 'none',
                  borderRadius: 9999, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <MessageSquare size={15} /> Chat with Agent
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  height: 42, padding: '0 20px', fontSize: 12.5, fontWeight: 700,
                  background: T.subtle, color: T.body, border: `1px solid ${T.line}`,
                  borderRadius: 9999, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          8. LIVE PARTNER CHAT MODAL
      ═══════════════════════════════════════════════════ */}
      {showLiveChat && (
        <>
          <div
            onClick={() => setShowLiveChat(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 450,
            }}
          />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 440, maxWidth: '92vw', height: 520, background: '#ffffff',
            borderRadius: 28, zIndex: 451, display: 'flex', flexDirection: 'column',
            boxShadow: '0 16px 48px rgba(15, 23, 42, 0.22)', overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: T.blueBg, color: T.blue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Headphones size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Partner Priority Live Chat</div>
                  <div style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>● Agent Anand V. (Online)</div>
                </div>
              </div>

              <button
                onClick={() => setShowLiveChat(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: T.subtle }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: msg.sender === 'user' ? T.brand : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : T.ink,
                    padding: '10px 14px', borderRadius: 18,
                    fontSize: 12.5, lineHeight: 1.4,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
                    border: msg.sender === 'user' ? 'none' : `1px solid ${T.line}`,
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} style={{ padding: '12px 16px', background: T.card, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type your message to Anand..."
                style={{
                  flex: 1, height: 38, padding: '0 14px', fontSize: 12.5,
                  borderRadius: 9999, border: `1px solid ${T.line}`, outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  width: 38, height: 38, borderRadius: 9999, background: T.brand,
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
