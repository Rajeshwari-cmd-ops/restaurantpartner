import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { SearchInput } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatINR, formatRelativeTime } from '../utils/formatters';
import { filterData, paginateArray, sortData } from '../utils/pagination';
import {
  List,
  Grid3X3,
  Printer,
  Bike,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  Phone,
  Utensils,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import type { OrderStatus, Order } from '../types';
import { OrderDetailsDrawer } from '../components/orders/OrderDetailsDrawer';
import { useOrders } from '../context/OrderContext';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  brand:    '#FF7A30',
  grad:     '#FF7A30',
  green:    '#10B981',
  amber:    '#F59E0B',
  red:      '#EF4444',
  blue:     '#3B82F6',
  purple:   '#8B5CF6',
  greenBg:  '#ECFDF5',
  amberBg:  '#FFFBEB',
  redBg:    '#FEF2F2',
  blueBg:   '#EFF6FF',
  ink:      '#111827',
  body:     '#4B5563',
  muted:    '#9CA3AF',
  line:     '#E5E7EB',
  lineSoft: '#F3F4F6',
  card:     '#FFFFFF',
  canvas:   '#F7F8FA',
};

// ─── Status Tabs Config ───────────────────────────────────────────────────────
const TAB_CONFIG: Record<string, {
  label: string; icon?: React.ReactNode;
  activeColor: string; activeBg: string; activeBorder: string;
}> = {
  all:       { label: 'All Orders',       activeColor: '#fff',     activeBg: T.grad,    activeBorder: T.brand   },
  new:       { label: 'New',              icon: <Clock size={13} strokeWidth={2} />,      activeColor: T.amber,  activeBg: T.amberBg, activeBorder: '#FCD34D' },
  preparing: { label: 'In Kitchen',       icon: <Flame size={13} strokeWidth={2} />,      activeColor: T.blue,   activeBg: T.blueBg,  activeBorder: '#93C5FD' },
  ready:     { label: 'Ready',            icon: <PackageCheck size={13} strokeWidth={2} />,activeColor: T.green, activeBg: T.greenBg, activeBorder: '#6EE7B7' },
  delivered: { label: 'Dispatched',       icon: <CheckCircle2 size={13} strokeWidth={2} />,activeColor: '#475569',activeBg: T.lineSoft,activeBorder: '#CBD5E1' },
  cancelled: { label: 'Cancelled',        activeColor: T.red,     activeBg: T.redBg,   activeBorder: '#FCA5A5' },
};

const DTYPE_LABEL: Record<string, string> = {
  delivery: 'Delivery',
  pickup:   'Pickup',
  dine_in:  'Dine-In',
};

import { useOutletContext } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<{ searchTerm?: string }>();
  const globalSearchTerm = outletCtx?.searchTerm || '';
  const { orders, updateOrderStatus, rejectOrder } = useOrders();
  const [searchTerm, setSearchTerm]           = useState('');
  const effectiveSearchTerm = searchTerm || globalSearchTerm;
  const [activeTab, setActiveTab]             = useState<string>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode]               = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage]         = useState(1);
  const [sortKey, setSortKey]                 = useState('createdAt');
  const [sortDirection, setSortDirection]     = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder]     = useState<Order | null>(null);

  const { addToast } = useToast();

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handlePrintKOT = (orderNumber: string) => {
    addToast('Printing KOT Slip', `Kitchen receipt printed for ${orderNumber}`, 'info');
  };

  // Counts
  const countAll       = orders.length;
  const countNew       = orders.filter(o => o.status === 'new').length;
  const countPreparing = orders.filter(o => o.status === 'preparing').length;
  const countReady     = orders.filter(o => o.status === 'ready').length;
  const countDone      = orders.filter(o => o.status === 'delivered').length;
  const countCancelled = orders.filter(o => o.status === 'cancelled').length;

  const countMap: Record<string, number> = {
    all: countAll, new: countNew, preparing: countPreparing,
    ready: countReady, delivered: countDone, cancelled: countCancelled,
  };

  // Filter pipeline
  let filtered = filterData(orders, effectiveSearchTerm, ['orderNumber', 'customerName', 'customerPhone']);
  if (activeTab !== 'all')            filtered = filtered.filter(o => o.status === activeTab);
  if (deliveryTypeFilter !== 'all')   filtered = filtered.filter(o => o.deliveryType === deliveryTypeFilter);

  const sorted    = sortData(filtered, sortKey, sortDirection);
  const paginated = paginateArray(sorted, currentPage, 6);

  const statusVariant = (s: string) =>
    s === 'new'       ? 'warning'
    : s === 'preparing' ? 'info'
    : s === 'ready'     ? 'success'
    : s === 'delivered' ? 'neutral'
    : 'error' as const;

  // Render Compact Order Card (Clickable to open Order Details Drawer)
  const renderCompactCard = (o: Order) => (
    <div
      key={o.id}
      onClick={() => setSelectedOrder(o)}
      style={{
        background: T.card,
        borderRadius: 28,
        border: `1px solid ${T.line}`,
        boxShadow: '0 2px 8px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.1)';
        (e.currentTarget as HTMLDivElement).style.borderColor = T.brand;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)';
        (e.currentTarget as HTMLDivElement).style.borderColor = T.line;
      }}
    >
      {/* Card Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 14.5, color: T.brand, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {o.orderNumber}
            </strong>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '2px 8px', borderRadius: 9999,
              background: T.lineSoft, color: T.body,
            }}>
              {DTYPE_LABEL[o.deliveryType] ?? o.deliveryType}
            </span>
          </div>
          <Badge variant={statusVariant(o.status)} dot size="sm">
            {o.status === 'new' ? 'New' :
             o.status === 'preparing' ? 'Preparing' :
             o.status === 'ready'     ? 'Ready' :
             o.status === 'delivered' ? 'Delivered' : 'Cancelled'}
          </Badge>
        </div>

        {/* Customer row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>
            {o.customerName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: T.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={11} strokeWidth={2} /> {o.customerPhone}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} strokeWidth={2} /> {formatRelativeTime(o.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div style={{
        background: T.canvas,
        borderRadius: 18,
        padding: '12px 14px',
        border: `1px solid ${T.lineSoft}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {o.items.map(it => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: T.body }}>
              <span style={{ fontWeight: 700, color: T.ink }}>{it.quantity}×</span>{' '}{it.name}
            </span>
            <span style={{ fontSize: 12, color: T.muted, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {formatINR(it.price * it.quantity)}
            </span>
          </div>
        ))}

        {o.items.some(it => it.notes) && (
          <div style={{
            fontSize: 11, color: T.amber,
            background: T.amberBg,
            padding: '5px 10px', borderRadius: 10,
            marginTop: 3, fontStyle: 'italic',
            borderLeft: `3px solid #FCD34D`,
          }}>
            ✎ {o.items.find(it => it.notes)?.notes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12,
        borderTop: `1px solid ${T.lineSoft}`,
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {formatINR(o.totalAmount)}
          </div>
          <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700, marginTop: 3, letterSpacing: '0.03em' }}>
            {o.paymentStatus === 'refunded' ? '↩ REFUNDED' : `✓ ${o.paymentStatus.toUpperCase()}`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {o.status === 'new' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(o.id, 'preparing'); }}>
                Accept &amp; Cook
              </Button>
              <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); rejectOrder(o.id, 'Kitchen Busy'); }}>
                Reject
              </Button>
            </div>
          )}

          {o.status === 'preparing' && (<>
            <Button
              variant="ghost" size="sm"
              onClick={(e) => { e.stopPropagation(); handlePrintKOT(o.orderNumber); }}
              title="Print KOT Slip"
            >
              <Printer size={13} strokeWidth={2} />
            </Button>
            <Button
              variant="secondary" size="sm"
              leftIcon={<CheckCircle2 size={13} strokeWidth={2} />}
              onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(o.id, 'ready'); }}
            >
              Mark Ready
            </Button>
          </>)}

          {o.status === 'ready' && (
            <Button
              variant="outline" size="sm"
              leftIcon={<Bike size={13} strokeWidth={2} />}
              onClick={(e) => { e.stopPropagation(); handleUpdateOrderStatus(o.id, 'delivered'); }}
            >
              Handover
            </Button>
          )}

          {o.status === 'delivered' && (
            <span style={{ fontSize: 11.5, color: T.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} strokeWidth={2.5} /> Dispatched
            </span>
          )}

          {o.status === 'cancelled' && (
            <span style={{ fontSize: 11.5, color: T.red, fontWeight: 700 }}>✕ Cancelled</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 4, paddingBottom: 32, fontFamily: 'var(--font-family-sans)' }}>

      {/* ── 1. STATUS TABS ── */}
      <div style={{
        display: 'flex', gap: 6,
        overflowX: 'auto', paddingBottom: 2,
        marginBottom: 16,
        scrollbarWidth: 'none',
      }}>
        {Object.entries(TAB_CONFIG).map(([key, cfg]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setCurrentPage(1); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                height: 40, padding: '0 18px', borderRadius: 9999,
                border: `1px solid ${isActive ? cfg.activeBorder : T.line}`,
                background: isActive ? cfg.activeBg : T.card,
                color: isActive ? cfg.activeColor : T.body,
                fontWeight: 700, fontSize: 13,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.12s ease',
                boxShadow: isActive ? '0 1px 4px rgba(15,23,42,0.06)' : 'none',
              }}
            >
              {cfg.icon}
              {cfg.label}
              <span style={{
                minWidth: 20, height: 20, borderRadius: 9999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'rgba(255,255,255,0.25)' : T.lineSoft,
                color: isActive ? 'inherit' : T.muted,
                fontSize: 11, fontWeight: 800,
                padding: '0 6px',
              }}>
                {countMap[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 2. FILTER & VIEW CONTROL BAR ── */}
      <Card padding="md" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280 }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={effectiveSearchTerm}
                onChange={setSearchTerm}
                placeholder="Search by order #, customer name or phone…"
              />
            </div>
            <div style={{ width: 176 }}>
              <Select
                value={deliveryTypeFilter}
                onChange={e => setDeliveryTypeFilter(e.target.value)}
                options={[
                  { value: 'all',      label: 'All Types'       },
                  { value: 'delivery', label: 'Delivery'        },
                  { value: 'pickup',   label: 'Counter Pickup'  },
                  { value: 'dine_in',  label: 'Dine-In'         },
                ]}
              />
            </div>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: T.lineSoft, padding: 3, borderRadius: 10, gap: 2 }}>
            {([
              { mode: 'cards',  label: 'Cards',  icon: <Grid3X3 size={13} strokeWidth={2} />  },
              { mode: 'table',  label: 'Table',  icon: <List size={13} strokeWidth={2} />      },
            ] as const).map(({ mode, label, icon }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={icon}
                onClick={() => setViewMode(mode)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── 3. CARDS VIEW ── */}
      {viewMode === 'cards' && (<>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(316px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {paginated.data.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1', textAlign: 'center',
              padding: '56px 16px', color: T.muted,
              background: T.card, borderRadius: 16,
              border: `1px dashed ${T.line}`,
            }}>
              <Utensils size={32} color={T.muted} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
                No matching orders found
              </div>
              <div style={{ fontSize: 12.5, color: T.muted }}>
                Try resetting your search or status filter.
              </div>
            </div>
          ) : (
            paginated.data.map(renderCompactCard)
          )}
        </div>

        {paginated.totalPages > 1 && (
          <Pagination
            currentPage={paginated.page}
            totalPages={paginated.totalPages}
            totalItems={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </>)}

      {/* ── 4. TABLE VIEW (Clicking row opens OrderDetailsDrawer) ── */}
      {viewMode === 'table' && (
        <Card padding="none">
          <Table
            data={paginated.data}
            keyExtractor={o => o.id}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onRowClick={o => setSelectedOrder(o)}
            onSort={key => {
              if (sortKey === key) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              else { setSortKey(key); setSortDirection('asc'); }
            }}
            columns={[
              {
                key: 'orderNumber', header: 'Order ID', sortable: true,
                render: o => (
                  <strong style={{ color: T.brand, fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>
                    {o.orderNumber}
                  </strong>
                ),
              },
              {
                key: 'customerName', header: 'Customer', sortable: true,
                render: o => (
                  <div>
                    <div style={{ fontWeight: 600, color: T.ink, fontSize: 13 }}>{o.customerName}</div>
                    <span style={{ fontSize: 11, color: T.muted }}>{o.customerPhone}</span>
                  </div>
                ),
              },
              {
                key: 'items', header: 'Items',
                render: o => (
                  <span style={{ fontSize: 12.5, color: T.body }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>
                ),
              },
              {
                key: 'totalAmount', header: 'Amount', sortable: true,
                render: o => (
                  <span style={{ fontWeight: 700, color: T.ink, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                    {formatINR(o.totalAmount)}
                  </span>
                ),
              },
              {
                key: 'deliveryType', header: 'Type',
                render: o => (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: T.body,
                  }}>
                    {DTYPE_LABEL[o.deliveryType] ?? o.deliveryType}
                  </span>
                ),
              },
              {
                key: 'status', header: 'Status', sortable: true,
                render: o => <Badge variant={statusVariant(o.status)} dot size="sm">{o.status}</Badge>,
              },
              {
                key: 'createdAt', header: 'Time', sortable: true,
                render: o => <span style={{ fontSize: 12, color: T.muted }}>{formatRelativeTime(o.createdAt)}</span>,
              },
            ]}
          />
          <Pagination
            currentPage={paginated.page}
            totalPages={paginated.totalPages}
            totalItems={paginated.total}
            pageSize={paginated.pageSize}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* ── 5. SLIDE-IN ORDER DETAILS DRAWER ── */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAction={(actionName, orderId, targetStatus) => {
            if (actionName.startsWith('Assign Rider') || actionName.startsWith('Assign Partner')) {
              navigate('/delivery');
            } else if (orderId && targetStatus) {
              handleUpdateOrderStatus(orderId, targetStatus);
            }
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
