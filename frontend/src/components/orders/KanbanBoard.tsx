import React, { useState } from 'react';
import type { Order, OrderStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatINR, formatRelativeTime } from '../../utils/formatters';
import { Flame, Clock, PackageCheck, CheckCircle2, Bike, Printer, Inbox, ChevronDown } from 'lucide-react';
import './KanbanBoard.css';

export interface KanbanBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onPrintKOT?: (orderNumber: string) => void;
}

const BATCH_SIZE = 3;

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onUpdateStatus,
  onPrintKOT,
}) => {
  // Pagination limits per column
  const [limits, setLimits] = useState<Record<string, number>>({
    new: BATCH_SIZE,
    preparing: BATCH_SIZE,
    ready: BATCH_SIZE,
    delivered: BATCH_SIZE,
  });

  const handleLoadMore = (colKey: string) => {
    setLimits((prev) => ({ ...prev, [colKey]: prev[colKey] + BATCH_SIZE }));
  };

  const newOrders = orders.filter((o) => o.status === 'new');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const renderCard = (o: Order) => (
    <div key={o.id} className="fic-kanban-card">
      <div className="fic-kanban-card__top">
        <span className="fic-kanban-card__id">{o.orderNumber}</span>
        <span className="fic-kanban-card__type">{o.deliveryType.replace('_', ' ')}</span>
      </div>

      <div className="fic-kanban-card__customer">
        <span className="fic-kanban-card__cust-name">{o.customerName}</span>
        <span className="fic-kanban-card__cust-sub">{o.customerPhone} • {formatRelativeTime(o.createdAt)}</span>
      </div>

      <div className="fic-kanban-card__items">
        {o.items.map((it) => (
          <div key={it.id} className="fic-kanban-card__item-row">
            <span className="fic-kanban-card__item-name">
              {it.quantity}x {it.name}
            </span>
            <span style={{ color: '#6b7280', fontSize: '11px' }}>{formatINR(it.price * it.quantity)}</span>
          </div>
        ))}
        {o.items.some((it) => it.notes) && (
          <div className="fic-kanban-card__notes">
            Note: {o.items.find((it) => it.notes)?.notes}
          </div>
        )}
      </div>

      <div className="fic-kanban-card__footer">
        <div>
          <span className="fic-kanban-card__amount">{formatINR(o.totalAmount)}</span>
          <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 600, marginLeft: '6px' }}>PAID</span>
        </div>

        <div className="fic-kanban-card__actions">
          {o.status === 'new' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(o.id, 'preparing')}
            >
              Accept & Cook
            </Button>
          )}

          {o.status === 'preparing' && (
            <>
              {onPrintKOT && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPrintKOT(o.orderNumber)}
                  title="Print KOT Slip"
                >
                  <Printer size={14} />
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<CheckCircle2 size={14} />}
                onClick={() => onUpdateStatus(o.id, 'ready')}
              >
                Mark Ready
              </Button>
            </>
          )}

          {o.status === 'ready' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bike size={14} />}
              onClick={() => onUpdateStatus(o.id, 'delivered')}
            >
              Handover
            </Button>
          )}

          {o.status === 'delivered' && (
            <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>Completed ✓</span>
          )}

          {o.status === 'cancelled' && (
            <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>Cancelled ✗</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (title: string, subtext: string) => (
    <div className="fic-kanban-column__empty">
      <Inbox className="fic-kanban-column__empty-icon" size={32} />
      <span className="fic-kanban-column__empty-title">{title}</span>
      <span className="fic-kanban-column__empty-text">{subtext}</span>
    </div>
  );

  return (
    <div className="fic-kanban-container">
      {/* COLUMN 1: NEW ORDERS */}
      <div className="fic-kanban-column" style={{ borderTop: '4px solid #F59E0B' }}>
        <div className="fic-kanban-column__header">
          <div className="fic-kanban-column__header-top">
            <div className="fic-kanban-column__title">
              <Clock size={18} color="#F59E0B" /> New Orders
            </div>
            <Badge variant="warning" size="sm">
              {newOrders.length} Pending
            </Badge>
          </div>
          <div className="fic-kanban-column__desc">Incoming customer orders needing kitchen acceptance</div>
        </div>

        <div className="fic-kanban-column__list">
          {newOrders.length === 0 ? (
            renderEmptyState('No New Orders', 'All incoming customer orders have been processed.')
          ) : (
            newOrders.slice(0, limits.new).map(renderCard)
          )}
        </div>

        {newOrders.length > limits.new && (
          <div className="fic-kanban-column__footer">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDown size={14} />}
              onClick={() => handleLoadMore('new')}
            >
              Load More ({newOrders.length - limits.new})
            </Button>
          </div>
        )}
      </div>

      {/* COLUMN 2: KITCHEN QUEUE (PREPARING) */}
      <div className="fic-kanban-column" style={{ borderTop: '4px solid #0D47A1' }}>
        <div className="fic-kanban-column__header">
          <div className="fic-kanban-column__header-top">
            <div className="fic-kanban-column__title">
              <Flame size={18} color="#0D47A1" /> In Kitchen Prep
            </div>
            <Badge variant="info" size="sm">
              {preparingOrders.length} Cooking
            </Badge>
          </div>
          <div className="fic-kanban-column__desc">Active dish preparation & cooking on station</div>
        </div>

        <div className="fic-kanban-column__list">
          {preparingOrders.length === 0 ? (
            renderEmptyState('Kitchen Queue Empty', 'No active dishes currently cooking.')
          ) : (
            preparingOrders.slice(0, limits.preparing).map(renderCard)
          )}
        </div>

        {preparingOrders.length > limits.preparing && (
          <div className="fic-kanban-column__footer">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDown size={14} />}
              onClick={() => handleLoadMore('preparing')}
            >
              Load More ({preparingOrders.length - limits.preparing})
            </Button>
          </div>
        )}
      </div>

      {/* COLUMN 3: READY FOR PICKUP */}
      <div className="fic-kanban-column" style={{ borderTop: '4px solid #22C55E' }}>
        <div className="fic-kanban-column__header">
          <div className="fic-kanban-column__header-top">
            <div className="fic-kanban-column__title">
              <PackageCheck size={18} color="#22C55E" /> Ready for Pickup
            </div>
            <Badge variant="success" size="sm">
              {readyOrders.length} Ready
            </Badge>
          </div>
          <div className="fic-kanban-column__desc">Packed & staged at counter for delivery rider handoff</div>
        </div>

        <div className="fic-kanban-column__list">
          {readyOrders.length === 0 ? (
            renderEmptyState('No Orders Staged', 'No food parcels waiting for pickup at counter.')
          ) : (
            readyOrders.slice(0, limits.ready).map(renderCard)
          )}
        </div>

        {readyOrders.length > limits.ready && (
          <div className="fic-kanban-column__footer">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDown size={14} />}
              onClick={() => handleLoadMore('ready')}
            >
              Load More ({readyOrders.length - limits.ready})
            </Button>
          </div>
        )}
      </div>

      {/* COLUMN 4: COMPLETED / DISPATCHED */}
      <div className="fic-kanban-column" style={{ borderTop: '4px solid #64748B' }}>
        <div className="fic-kanban-column__header">
          <div className="fic-kanban-column__header-top">
            <div className="fic-kanban-column__title">
              <CheckCircle2 size={18} color="#64748B" /> Dispatched & Done
            </div>
            <Badge variant="neutral" size="sm">
              {completedOrders.length} Done
            </Badge>
          </div>
          <div className="fic-kanban-column__desc">Completed, handed over, and delivered orders</div>
        </div>

        <div className="fic-kanban-column__list">
          {completedOrders.length === 0 ? (
            renderEmptyState('No History Yet', 'Dispatched orders will appear here.')
          ) : (
            completedOrders.slice(0, limits.delivered).map(renderCard)
          )}
        </div>

        {completedOrders.length > limits.delivered && (
          <div className="fic-kanban-column__footer">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDown size={14} />}
              onClick={() => handleLoadMore('delivered')}
            >
              Load More ({completedOrders.length - limits.delivered})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
