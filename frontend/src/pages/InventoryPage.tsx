import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockInventory as initialInventory } from '../mock/inventory';
import { formatINR } from '../utils/formatters';
import {
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Truck,
  PlusCircle,
  Search,
  X,
  MoreVertical,
  Clock,
  Flame,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import type { InventoryItem } from '../types';

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
  shadowHover: '0 4px 12px rgba(15, 23, 42, 0.08)',
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

interface GRNRecord {
  id: string;
  grnNumber: string;
  date: string;
  supplierName: string;
  invoiceNumber: string;
  itemsSummary: string;
  totalAmount: number;
  status: 'VERIFIED' | 'PENDING_INSPECTION';
  receivedBy: string;
}

const mockGRNRecords: GRNRecord[] = [
  { id: 'grn-101', grnNumber: 'GRN-2026-0891', date: 'Today, 09:30 AM', supplierName: 'MilkyMist Dairy Co.', invoiceNumber: 'INV-99201', itemsSummary: '20 kg Fresh Malai Paneer', totalAmount: 5600, status: 'VERIFIED', receivedBy: 'Rajesh Sharma (Store Mgr)' },
  { id: 'grn-102', grnNumber: 'GRN-2026-0888', date: 'Yesterday, 04:00 PM', supplierName: 'Fortune Foods Pvt Ltd', invoiceNumber: 'INV-44102', itemsSummary: '50 kg Basmati Rice', totalAmount: 6000, status: 'VERIFIED', receivedBy: 'Chef Suresh' },
  { id: 'grn-103', grnNumber: 'GRN-2026-0882', date: '2 days ago', supplierName: "Venky's Hatcheries", invoiceNumber: 'INV-77192', itemsSummary: '25 kg Fresh Cleaned Chicken', totalAmount: 5250, status: 'VERIFIED', receivedBy: 'Rajesh Sharma (Store Mgr)' },
];

interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  createdDate: string;
  supplierName: string;
  expectedDelivery: string;
  itemCount: number;
  totalValue: number;
  status: 'OPEN' | 'PARTIAL' | 'DELIVERED';
}

const initialPORecords: PurchaseOrderRecord[] = [
  { id: 'po-301', poNumber: 'PO-2026-041', createdDate: 'Today, 08:00 AM', supplierName: "Venky's Hatcheries", expectedDelivery: 'Tomorrow, 07:00 AM', itemCount: 2, totalValue: 6300, status: 'OPEN' },
  { id: 'po-302', poNumber: 'PO-2026-039', createdDate: 'Yesterday', supplierName: 'Gujarat Milk Federation', expectedDelivery: 'Today, 02:00 PM', itemCount: 3, totalValue: 4400, status: 'PARTIAL' },
  { id: 'po-303', poNumber: 'PO-2026-035', createdDate: '3 days ago', supplierName: 'SpiceCraft Mills Mysore', expectedDelivery: 'Yesterday', itemCount: 5, totalValue: 8750, status: 'DELIVERED' },
];

interface WasteLogRecord {
  id: string;
  date: string;
  skuCode: string;
  name: string;
  reason: 'Prep Waste' | 'Expired Lot' | 'Spillage' | 'Recipe Variance';
  quantityLost: string;
  costImpact: number;
  loggedBy: string;
}

const mockWasteLogs: WasteLogRecord[] = [
  { id: 'w-1', date: 'Today, 11:30 AM', skuCode: 'ING-103', name: 'Amul Fresh Cooking Butter', reason: 'Prep Waste', quantityLost: '0.5 kg', costImpact: 220, loggedBy: 'Chef Suresh' },
  { id: 'w-2', date: 'Yesterday', skuCode: 'ING-106', name: 'Alphonso Mango Pulp (Tin)', reason: 'Expired Lot', quantityLost: '1 tin', costImpact: 350, loggedBy: 'Rajesh Sharma' },
  { id: 'w-3', date: '2 days ago', skuCode: 'ING-101', name: 'Fresh Malai Paneer', reason: 'Recipe Variance', quantityLost: '0.8 kg', costImpact: 224, loggedBy: 'Kitchen Commis 1' },
];

export const InventoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabFromUrl = searchParams.get('tab') || 'register';

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [poRecords, setPoRecords] = useState<PurchaseOrderRecord[]>(initialPORecords);
  const [grnRecords, setGrnRecords] = useState<GRNRecord[]>(mockGRNRecords);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>(currentTabFromUrl);

  // Modals & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGrnItemId, setSelectedGrnItemId] = useState<string>(initialInventory[0]?.id || '');
  const [grnQty, setGrnQty] = useState<number>(10);
  const [grnInvoiceRef, setGrnInvoiceRef] = useState<string>('INV-2026-991');

  const [showAdjustModal, setShowAdjustModal] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  const [showPoModal, setShowPoModal] = useState<InventoryItem | null>(null);
  const [poQty, setPoQty] = useState<number>(20);

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InventoryItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => i.status === 'low_stock');
  const outOfStockItems = inventory.filter((i) => i.status === 'out_of_stock');
  const totalValuation = inventory.reduce((acc, i) => acc + i.currentStock * (i.unitCost || 0), 0);

  let filtered = inventory;
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        (i.code && i.code.toLowerCase().includes(term)) ||
        (i.supplierName && i.supplierName.toLowerCase().includes(term)) ||
        (i.lotNumber && i.lotNumber.toLowerCase().includes(term))
    );
  }

  if (quickFilter === 'low_stock') {
    filtered = filtered.filter(i => i.status === 'low_stock');
  } else if (quickFilter === 'out_of_stock') {
    filtered = filtered.filter(i => i.status === 'out_of_stock');
  } else if (quickFilter !== 'all') {
    filtered = filtered.filter(i => i.category === quickFilter);
  }

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;

    const updatedQty = Math.max(0, showAdjustModal.currentStock + adjustAmount);
    const newStatus =
      updatedQty === 0
        ? 'out_of_stock'
        : updatedQty <= showAdjustModal.minThreshold
        ? 'low_stock'
        : 'in_stock';

    const updatedItem = {
      ...showAdjustModal,
      currentStock: updatedQty,
      status: newStatus as any,
      lastUsed: `Adjusted just now (${adjustAmount >= 0 ? '+' : ''}${adjustAmount} ${showAdjustModal.unit})`,
      lastUpdated: 'Just now',
    };

    setInventory((prev) => prev.map((i) => (i.id === showAdjustModal.id ? updatedItem : i)));
    if (selectedHistoryItem?.id === showAdjustModal.id) {
      setSelectedHistoryItem(updatedItem);
    }

    addToast(
      'Stock Adjusted',
      `${showAdjustModal.name} updated to ${updatedQty} ${showAdjustModal.unit}`,
      'success'
    );
    setShowAdjustModal(null);
    setAdjustAmount(0);
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPoModal) return;

    const newPO: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-0${poRecords.length + 42}`,
      createdDate: 'Just now',
      supplierName: showPoModal.supplierName || 'Primary Vendor',
      expectedDelivery: 'Tomorrow, 09:00 AM',
      itemCount: 1,
      totalValue: poQty * (showPoModal.unitCost || 100),
      status: 'OPEN',
    };

    setPoRecords(prev => [newPO, ...prev]);

    addToast(
      'Purchase Order Issued',
      `${newPO.poNumber} sent to ${newPO.supplierName} (${poQty} ${showPoModal.unit})`,
      'success'
    );
    setShowPoModal(null);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();

    const targetItem = inventory.find(i => i.id === selectedGrnItemId);
    if (!targetItem) return;

    const addedQty = parseFloat(grnQty.toString()) || 0;
    const updatedStock = targetItem.currentStock + addedQty;
    const newStatus = updatedStock <= targetItem.minThreshold ? 'low_stock' : 'in_stock';

    const updatedItem = {
      ...targetItem,
      currentStock: updatedStock,
      status: newStatus as any,
      lastReceived: `Just now (+${addedQty} ${targetItem.unit})`,
      lastUpdated: 'Just now',
    };

    setInventory((prev) => prev.map((i) => (i.id === selectedGrnItemId ? updatedItem : i)));
    if (selectedHistoryItem?.id === selectedGrnItemId) {
      setSelectedHistoryItem(updatedItem);
    }

    const newGRN: GRNRecord = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2026-0${grnRecords.length + 892}`,
      date: 'Just now',
      supplierName: targetItem.supplierName || 'Direct Vendor',
      invoiceNumber: grnInvoiceRef || 'INV-LOGGED',
      itemsSummary: `${addedQty} ${targetItem.unit} ${targetItem.name}`,
      totalAmount: addedQty * (targetItem.unitCost || 100),
      status: 'VERIFIED',
      receivedBy: 'Store Manager (Logged)',
    };
    setGrnRecords(prev => [newGRN, ...prev]);

    setShowAddModal(false);
    addToast('Goods Received (GRN)', `Stock level increased to ${updatedStock} ${targetItem.unit}.`, 'success');
  };

  const handleSimulatePosDeduction = (item: InventoryItem, qtyToDeduct: number = 2) => {
    const updatedQty = Math.max(0, item.currentStock - qtyToDeduct);
    const newStatus =
      updatedQty === 0
        ? 'out_of_stock'
        : updatedQty <= item.minThreshold
        ? 'low_stock'
        : 'in_stock';

    const updatedItem = {
      ...item,
      currentStock: updatedQty,
      status: newStatus as any,
      lastUsed: `Just now (-${qtyToDeduct} ${item.unit}) via Order`,
      lastUpdated: 'Just now',
    };

    setInventory((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
    if (selectedHistoryItem?.id === item.id) {
      setSelectedHistoryItem(updatedItem);
    }

    addToast(
      'Order Stock Deduction',
      `Auto-deducted ${qtyToDeduct} ${item.unit} ${item.name} for active KOT order.`,
      'info'
    );
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>

      {/* ── 1. ULTRA-COMPACT KPI SUMMARY BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {/* KPI 1: Inventory Value */}
        <div
          onClick={() => {
            setActiveTab('register');
            setQuickFilter('all');
            setSearchTerm('');
            addToast('Inventory Stock List', 'Displaying all active inventory items', 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 22, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.brand;
            e.currentTarget.style.boxShadow = T.shadowHover;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Inventory Valuation
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {formatINR(totalValuation)}
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                {totalItems} items active · Click to view
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

        {/* KPI 2: Low Stock Alerts */}
        <div
          onClick={() => {
            setActiveTab('register');
            setQuickFilter('low_stock');
            setSearchTerm('');
            addToast('Stock Alerts Filter', 'Filtering inventory to low & out of stock items', 'warning');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 22, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.amber;
            e.currentTarget.style.boxShadow = T.shadowHover;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Stock Alerts
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: (lowStockItems.length + outOfStockItems.length) > 0 ? T.amber : T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {lowStockItems.length + outOfStockItems.length} Low / Out
              </div>
              <div style={{ fontSize: 10.5, color: T.red, fontWeight: 700 }}>
                {outOfStockItems.length > 0 ? `⚠️ ${outOfStockItems.length} Out of Stock` : 'All critical covered'}
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.amberBg, color: T.amber,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertTriangle size={14} />
            </div>
          </div>
        </div>

        {/* KPI 3: Expiring Soon */}
        <div
          onClick={() => {
            setActiveTab('register');
            setQuickFilter('all');
            setSearchTerm('Fresh');
            addToast('Expiring Stock Filter', 'Filtering perishables requiring rotation', 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 22, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.red;
            e.currentTarget.style.boxShadow = T.shadowHover;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Expiring (7 Days)
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                2 Items
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                Requires rotation · Click to filter
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.redBg, color: T.red,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Clock size={14} />
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Supplier Orders */}
        <div
          onClick={() => {
            setActiveTab('po');
            addToast('Supplier Orders', 'Switched to Pending Orders ledger', 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 22, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.blue;
            e.currentTarget.style.boxShadow = T.shadowHover;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Orders
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {poRecords.filter(p => p.status !== 'DELIVERED').length} Orders
              </div>
              <div style={{ fontSize: 10.5, color: T.blue, fontWeight: 600 }}>
                On schedule · Click to view
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 14, background: T.blueBg, color: T.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Truck size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. STREAMLINED TAB BAR & SINGLE PRIMARY CTA HEADER ── */}
      <div style={cardStyle({ padding: '8px 12px', borderRadius: 24 })}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Clean Segmented Tabs */}
          <div style={{ display: 'flex', gap: 2, background: T.subtle, padding: 3, borderRadius: 9999, border: `1px solid ${T.line}` }}>
            {[
              { id: 'register', label: 'Stock List' },
              { id: 'grn', label: 'Received' },
              { id: 'po', label: 'Orders' },
              { id: 'movements', label: 'Wastage' },
              { id: 'suppliers', label: 'Suppliers' },
              { id: 'audit', label: 'Stock Check' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    height: 28, padding: '0 14px', fontSize: 11.5, fontWeight: isActive ? 700 : 500, borderRadius: 9999,
                    border: 'none', cursor: 'pointer',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? T.ink : T.muted,
                    boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Controls: Clean Refresh & Single Primary CTA */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => addToast('Stock Synced', 'Live stock levels updated from kitchen orders.', 'info')}
              title="Sync Kitchen Stock"
              style={{
                height: 30, width: 30, background: T.subtle, color: T.muted,
                border: `1px solid ${T.line}`, borderRadius: 9999,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <RefreshCw size={13} />
            </button>

            {/* SINGLE PRIMARY CTA */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                height: 30, padding: '0 14px', background: T.brand, color: '#fff',
                border: 'none', borderRadius: 9999, fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                boxShadow: T.glow,
              }}
            >
              <PlusCircle size={13} /> Receive Stock
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. STOCK LIST TAB (HIGH-DENSITY COMPACT TABLE) ── */}
      {activeTab === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Quick Filter Chips Strip + Compact Search Bar */}
          <div style={cardStyle({ padding: '8px 14px', borderRadius: 24 })}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

              {/* Minimal Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'low_stock', label: 'Low Stock' },
                  { id: 'out_of_stock', label: 'Out of Stock' },
                  { id: 'Dairy', label: 'Dairy' },
                  { id: 'Grains', label: 'Grains' },
                  { id: 'Poultry', label: 'Poultry' },
                  { id: 'Produce', label: 'Produce' },
                  { id: 'Spices', label: 'Spices' },
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

              {/* Compact Search Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, padding: '4px 14px', width: 220,
              }}>
                <Search size={13} color={T.muted} />
                <input
                  type="text"
                  placeholder="Filter items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 11.5, outline: 'none', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* High-Density Compact Table */}
          <div style={cardStyle({ borderRadius: 24, overflow: 'hidden' })}>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Item &amp; Supplier</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Current Stock</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Unit Price</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Total Value</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => {
                    const isLow = item.currentStock <= item.minThreshold && item.currentStock > 0;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedHistoryItem(item)}
                        style={{
                          borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${T.lineSoft}`,
                          cursor: 'pointer', transition: 'background 0.12s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.subtle; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        {/* Item (Primary) & Supplier (Secondary) */}
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontWeight: 700, color: T.ink, fontSize: 12.5 }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 10.5, color: T.muted }}>
                            {item.supplierName || 'Primary Supplier'} · <span style={{ color: T.light }}>{item.category}</span>
                          </div>
                        </td>

                        {/* Current Stock (PRIMARY FOCUS) */}
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{
                              fontSize: 13.5, fontWeight: 800,
                              color: isOut ? T.red : isLow ? T.amber : T.ink,
                              fontVariantNumeric: 'tabular-nums'
                            }}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span style={{ fontSize: 10, color: T.muted }}>
                              (Min: {item.minThreshold})
                            </span>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td style={{ padding: '8px 12px', fontSize: 11.5, color: T.body, fontVariantNumeric: 'tabular-nums' }}>
                          {formatINR(item.unitCost || 0)} / {item.unit}
                        </td>

                        {/* Total Value */}
                        <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                          {formatINR(item.currentStock * (item.unitCost || 0))}
                        </td>

                        {/* Simplified Minimal Status Dot Badge */}
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                            color: isOut ? T.red : isLow ? T.amber : T.green,
                            background: isOut ? T.redBg : isLow ? T.amberBg : T.greenBg,
                          }}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>

                        {/* Contextual Action Menu */}
                        <td style={{ padding: '8px 12px', textAlign: 'right', position: 'relative' }} onClick={e => e.stopPropagation()}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                              style={{
                                width: 24, height: 24, borderRadius: 9999, background: 'transparent',
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: T.muted, cursor: 'pointer',
                              }}
                            >
                              <MoreVertical size={13} />
                            </button>

                            {activeMenuId === item.id && (
                              <div style={{
                                position: 'absolute', right: 0, top: 26, width: 160,
                                background: '#ffffff', border: `1px solid ${T.line}`,
                                borderRadius: 14, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                                zIndex: 100, padding: 4, display: 'flex', flexDirection: 'column', gap: 1,
                              }}>
                                <button
                                  onClick={() => {
                                    setShowAdjustModal(item);
                                    setAdjustAmount(0);
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.ink,
                                    background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  Adjust Stock Qty
                                </button>

                                <button
                                  onClick={() => {
                                    setShowPoModal(item);
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.brand,
                                    background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  Create Order
                                </button>

                                <button
                                  onClick={() => {
                                    handleSimulatePosDeduction(item, 2);
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    padding: '5px 8px', fontSize: 11, fontWeight: 600, color: T.amber,
                                    background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  Deduct for Order (-2)
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. GRN RECEIVED TAB ── */}
      {activeTab === 'grn' && (
        <div style={cardStyle({ borderRadius: 12 })}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>GRN #</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Supplier</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Invoice</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Items</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {grnRecords.map((grn, idx) => (
                  <tr key={grn.id} style={{ borderBottom: idx === grnRecords.length - 1 ? 'none' : `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.brand }}>{grn.grnNumber}</td>
                    <td style={{ padding: '8px 12px', color: T.muted, fontSize: 11 }}>{grn.date}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: T.ink }}>{grn.supplierName}</td>
                    <td style={{ padding: '8px 12px', color: T.body, fontSize: 11 }}>{grn.invoiceNumber}</td>
                    <td style={{ padding: '8px 12px', color: T.body }}>{grn.itemsSummary}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.ink }}>{formatINR(grn.totalAmount)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: T.greenBg, padding: '1px 6px', borderRadius: 4 }}>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. SUPPLIER ORDERS TAB ── */}
      {activeTab === 'po' && (
        <div style={cardStyle({ borderRadius: 12 })}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>PO #</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Supplier</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Expected</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Items</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Value</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {poRecords.map((po, idx) => (
                  <tr key={po.id} style={{ borderBottom: idx === poRecords.length - 1 ? 'none' : `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.blue }}>{po.poNumber}</td>
                    <td style={{ padding: '8px 12px', color: T.muted, fontSize: 11 }}>{po.createdDate}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: T.ink }}>{po.supplierName}</td>
                    <td style={{ padding: '8px 12px', color: T.body, fontSize: 11 }}>{po.expectedDelivery}</td>
                    <td style={{ padding: '8px 12px', color: T.body }}>{po.itemCount} items</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.ink }}>{formatINR(po.totalValue)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                        color: po.status === 'DELIVERED' ? T.green : po.status === 'PARTIAL' ? T.amber : T.blue,
                        background: po.status === 'DELIVERED' ? T.greenBg : po.status === 'PARTIAL' ? T.amberBg : T.blueBg,
                      }}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. WASTAGE & LOSSES TAB ── */}
      {activeTab === 'movements' && (
        <div style={cardStyle({ borderRadius: 12 })}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.muted, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Item</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Reason</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Lost Qty</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Cost Impact</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {mockWasteLogs.map((w, idx) => (
                  <tr key={w.id} style={{ borderBottom: idx === mockWasteLogs.length - 1 ? 'none' : `1px solid ${T.lineSoft}` }}>
                    <td style={{ padding: '8px 12px', color: T.muted, fontSize: 11 }}>{w.date}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: T.ink }}>{w.name}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.red, background: T.redBg, padding: '1px 6px', borderRadius: 4 }}>
                        {w.reason}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.red }}>-{w.quantityLost}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.red }}>{formatINR(w.costImpact)}</td>
                    <td style={{ padding: '8px 12px', color: T.muted, fontSize: 11 }}>{w.loggedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. SUPPLIERS TAB ── */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {[
            { name: 'MilkyMist Dairy Co.', contact: 'Ramesh Kumar', phone: '+91 98450 11223', leadTime: '24 Hours', rating: '4.9 ★' },
            { name: 'Fortune Foods Pvt Ltd', contact: 'Anil Sharma', phone: '+91 98860 33445', leadTime: '48 Hours', rating: '4.8 ★' },
            { name: "Venky's Hatcheries", contact: 'Suresh Gowda', phone: '+91 97410 55667', leadTime: '12 Hours', rating: '4.9 ★' },
            { name: 'Gujarat Milk Federation', contact: 'Vijay Patel', phone: '+91 99001 77889', leadTime: '24 Hours', rating: '4.7 ★' },
          ].map((sup, idx) => (
            <div key={idx} style={cardStyle({ padding: '12px 14px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{sup.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.amber, background: T.amberBg, padding: '1px 5px', borderRadius: 4 }}>
                  {sup.rating}
                </span>
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                <div>Contact: {sup.contact} ({sup.phone})</div>
                <div>Lead Time: {sup.leadTime}</div>
              </div>
              <button
                onClick={() => addToast('Calling Supplier', `Calling ${sup.contact}...`, 'info')}
                style={{
                  height: 28, fontSize: 11, fontWeight: 700, color: T.body,
                  background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 6, cursor: 'pointer',
                }}
              >
                Call Vendor
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── 8. STOCK CHECK AUDIT TAB ── */}
      {activeTab === 'audit' && (
        <div style={cardStyle({ padding: '14px 16px', borderRadius: 12 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: 0 }}>Stock Audit Ledger</h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: T.muted }}>Reconciliation between system stock and physical count</p>
            </div>
            <button
              onClick={() => addToast('Audit Mode', 'Opening Audit Worksheet', 'info')}
              style={{
                height: 28, padding: '0 12px', background: T.brand, color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Start Audit
            </button>
          </div>

          <div style={{ background: T.subtle, border: `1px solid ${T.line}`, padding: '10px 14px', borderRadius: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10.5, color: T.muted }}>Last Audit</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>28 Jul 2026</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: T.muted }}>Accuracy</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: T.green }}>98.4%</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: T.muted }}>Variance</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: T.amber }}>-₹444</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: RECEIVE STOCK ── */}
      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, maxWidth: '92vw', background: '#ffffff', borderRadius: 12,
            zIndex: 401, padding: 18, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink }}>Receive Stock</h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Item</label>
                <select
                  value={selectedGrnItemId}
                  onChange={e => setSelectedGrnItemId(e.target.value)}
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none', background: T.subtle,
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.name} — Current: {i.currentStock} {i.unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Quantity</label>
                <input
                  type="number"
                  value={grnQty}
                  onChange={e => setGrnQty(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 13, fontWeight: 700,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Invoice / GRN Ref</label>
                <input
                  type="text"
                  value={grnInvoiceRef}
                  onChange={e => setGrnInvoiceRef(e.target.value)}
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 12, fontWeight: 600,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 34, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

      {/* ── MODAL 2: ADJUST STOCK ── */}
      {showAdjustModal && (
        <>
          <div onClick={() => setShowAdjustModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 380, maxWidth: '92vw', background: '#ffffff', borderRadius: 12,
            zIndex: 401, padding: 18, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink }}>Adjust Stock</h3>
              <button onClick={() => setShowAdjustModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: T.body }}>
                Item: <strong>{showAdjustModal.name}</strong> (Current: {showAdjustModal.currentStock} {showAdjustModal.unit})
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Adjustment Qty (+/-)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 13, fontWeight: 700,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 34, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  Save Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(null)}
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

      {/* ── MODAL 3: GENERATE PO ── */}
      {showPoModal && (
        <>
          <div onClick={() => setShowPoModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 380, maxWidth: '92vw', background: '#ffffff', borderRadius: 12,
            zIndex: 401, padding: 18, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink }}>Create Supplier Order</h3>
              <button onClick={() => setShowPoModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePo} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: T.body }}>
                Item: <strong>{showPoModal.name}</strong><br />
                Supplier: {showPoModal.supplierName || 'Primary Vendor'}
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Order Quantity ({showPoModal.unit})</label>
                <input
                  type="number"
                  value={poQty}
                  onChange={e => setPoQty(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%', height: 34, padding: '0 10px', fontSize: 13, fontWeight: 700,
                    borderRadius: 6, border: `1px solid ${T.line}`, marginTop: 3, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 34, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  Send Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowPoModal(null)}
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

      {/* ── INSPECTOR DRAWER (ROW CLICK) ── */}
      {selectedHistoryItem && (
        <>
          <div onClick={() => setSelectedHistoryItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />

          <div
            className="animate-slide-in-right"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 420, maxWidth: '92vw', background: '#ffffff',
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
                <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{selectedHistoryItem.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>
                  {selectedHistoryItem.supplierName || 'Primary Supplier'} · {selectedHistoryItem.category}
                </div>
              </div>
              <button onClick={() => setSelectedHistoryItem(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Stock Status Box */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 8, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Stock Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Current Stock</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedHistoryItem.currentStock} {selectedHistoryItem.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Min Threshold</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.amber, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedHistoryItem.minThreshold} {selectedHistoryItem.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ background: T.subtle, padding: '12px 14px', borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Unit Cost: <strong>{formatINR(selectedHistoryItem.unitCost || 0)} / {selectedHistoryItem.unit}</strong></div>
                <div>Total Valuation: <strong>{formatINR(selectedHistoryItem.currentStock * (selectedHistoryItem.unitCost || 0))}</strong></div>
                <div>Location: {selectedHistoryItem.storageLocation || 'Main Kitchen Pantry'}</div>
              </div>

              {/* Activity Log */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
                  Recent Movements
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedHistoryItem.lastReceived && (
                    <div style={{ background: T.greenBg, padding: '8px 10px', borderRadius: 6, fontSize: 11 }}>
                      <div style={{ fontWeight: 700, color: T.green }}>Received Stock</div>
                      <div style={{ color: T.body, marginTop: 1 }}>{selectedHistoryItem.lastReceived}</div>
                    </div>
                  )}
                  <div style={{ background: T.subtle, padding: '8px 10px', borderRadius: 6, fontSize: 11, border: `1px solid ${T.line}` }}>
                    <div style={{ fontWeight: 700, color: T.ink }}>Ingredients Used</div>
                    <div style={{ color: T.body, marginTop: 1 }}>{selectedHistoryItem.lastUsed || 'Recent KOT deduction logged'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div style={{ padding: '12px 18px', background: T.card, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleSimulatePosDeduction(selectedHistoryItem, 2)}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: T.subtle, color: T.amber, border: `1px solid ${T.amberBorder}`,
                  borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <Flame size={13} /> Deduct for Order (-2)
              </button>
              <button
                onClick={() => {
                  setShowAdjustModal(selectedHistoryItem);
                  setAdjustAmount(0);
                }}
                style={{
                  flex: 1, height: 32, fontSize: 11.5, fontWeight: 700,
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
