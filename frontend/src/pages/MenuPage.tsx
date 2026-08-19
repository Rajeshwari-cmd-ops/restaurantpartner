import React, { useState } from 'react';
import {
  Utensils,
  PlusCircle,
  Search,
  X,
  CheckCircle2,
  PackageX,
  FileText,
  Layers,
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
  shadowHover: '0 8px 20px rgba(15, 23, 42, 0.06)',
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

export interface OperationalMenuItem {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  foodCost: number;
  marginPercent: number;
  isVeg: boolean;
  isCombo?: boolean;
  isBeverage?: boolean;
  inStock: boolean; // 86 status
  stockPortionsAvailable: number;
  linkedSkus: { name: string; skuCode: string; qtyPerPortion: string; stockOk: boolean }[];
  channels: { name: string; online: boolean }[];
  description: string;
  rating: number;
  ordersToday: number;
}

const initialOperationalMenu: OperationalMenuItem[] = [
  {
    id: 'm-101',
    name: 'Paneer Butter Masala',
    categoryName: 'Main Course',
    price: 340,
    foodCost: 110,
    marginPercent: 67.6,
    isVeg: true,
    inStock: true,
    stockPortionsAvailable: 42,
    linkedSkus: [
      { name: 'Paneer Fresh', skuCode: '#SKU-102', qtyPerPortion: '200g', stockOk: true },
      { name: 'Butter Amul', skuCode: '#SKU-108', qtyPerPortion: '30g', stockOk: true },
      { name: 'Tomato Makhani Gravy', skuCode: '#SKU-115', qtyPerPortion: '150ml', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: true },
      { name: 'Delivery App', online: true },
      { name: 'Direct Web', online: true },
      { name: 'Dine-In', online: true },
    ],
    description: 'Cottage cheese cubes simmered in a rich, buttery tomato gravy with aromatic spices.',
    rating: 4.8,
    ordersToday: 68,
  },
  {
    id: 'm-102',
    name: 'Chicken Dum Biryani (Full)',
    categoryName: 'Main Course',
    price: 380,
    foodCost: 125,
    marginPercent: 67.1,
    isVeg: false,
    inStock: true,
    stockPortionsAvailable: 55,
    linkedSkus: [
      { name: 'Chicken Fresh Leg/Thigh', skuCode: '#SKU-201', qtyPerPortion: '350g', stockOk: true },
      { name: 'Basmati Rice Premium', skuCode: '#SKU-101', qtyPerPortion: '250g', stockOk: true },
      { name: 'Biryani Spice Mix', skuCode: '#SKU-305', qtyPerPortion: '25g', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: true },
      { name: 'Delivery App', online: true },
      { name: 'Direct Web', online: true },
      { name: 'Dine-In', online: true },
    ],
    description: 'Fragrant long-grain basmati rice layered with marinated chicken and cooked on slow dum.',
    rating: 4.9,
    ordersToday: 142,
  },
  {
    id: 'm-103',
    name: 'Dal Makhani Slow Cooked',
    categoryName: 'Main Course',
    price: 290,
    foodCost: 75,
    marginPercent: 74.1,
    isVeg: true,
    inStock: true,
    stockPortionsAvailable: 30,
    linkedSkus: [
      { name: 'Black Urad Dal', skuCode: '#SKU-104', qtyPerPortion: '150g', stockOk: true },
      { name: 'Fresh Cream', skuCode: '#SKU-109', qtyPerPortion: '40ml', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: true },
      { name: 'Delivery App', online: true },
      { name: 'Direct Web', online: true },
      { name: 'Dine-In', online: true },
    ],
    description: 'Black lentils slow cooked overnight with butter, cream, and subtle north Indian spices.',
    rating: 4.7,
    ordersToday: 48,
  },
  {
    id: 'm-104',
    name: 'Mutton Rogan Josh',
    categoryName: 'Main Course',
    price: 460,
    foodCost: 190,
    marginPercent: 58.7,
    isVeg: false,
    inStock: false, // 86'd out of stock
    stockPortionsAvailable: 0,
    linkedSkus: [
      { name: 'Mutton Tender Shoulder', skuCode: '#SKU-205', qtyPerPortion: '300g', stockOk: false },
      { name: 'Kashmiri Chili Gravy', skuCode: '#SKU-118', qtyPerPortion: '180ml', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: false },
      { name: 'Delivery App', online: false },
      { name: 'Direct Web', online: false },
      { name: 'Dine-In', online: false },
    ],
    description: 'Tender mutton cooked in authentic Kashmiri style with ratanjot and fennel gravy.',
    rating: 4.6,
    ordersToday: 0,
  },
  {
    id: 'm-105',
    name: 'Garlic Butter Naan',
    categoryName: 'Tandoor & Bread',
    price: 75,
    foodCost: 18,
    marginPercent: 76.0,
    isVeg: true,
    inStock: true,
    stockPortionsAvailable: 120,
    linkedSkus: [
      { name: 'Maida Flour Fine', skuCode: '#SKU-103', qtyPerPortion: '120g', stockOk: true },
      { name: 'Fresh Garlic Minced', skuCode: '#SKU-122', qtyPerPortion: '15g', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: true },
      { name: 'Delivery App', online: true },
      { name: 'Direct Web', online: true },
      { name: 'Dine-In', online: true },
    ],
    description: 'Traditional tandoor baked refined flour bread brushed with garlic and melted butter.',
    rating: 4.85,
    ordersToday: 210,
  },
  {
    id: 'm-106',
    name: 'Mango Lassi Thick',
    categoryName: 'Beverages',
    price: 120,
    foodCost: 32,
    marginPercent: 73.3,
    isVeg: true,
    isBeverage: true,
    inStock: true,
    stockPortionsAvailable: 60,
    linkedSkus: [
      { name: 'Fresh Curd', skuCode: '#SKU-106', qtyPerPortion: '200g', stockOk: true },
      { name: 'Mango Pulp Alphonso', skuCode: '#SKU-140', qtyPerPortion: '50ml', stockOk: true },
    ],
    channels: [
      { name: 'Online App', online: true },
      { name: 'Delivery App', online: true },
      { name: 'Direct Web', online: true },
      { name: 'Dine-In', online: true },
    ],
    description: 'Rich and creamy churned yogurt drink infused with sweet Alphonso mango pulp.',
    rating: 4.9,
    ordersToday: 85,
  },
];

export const MenuPage: React.FC = () => {
  const { addToast } = useToast();
  const [menuItems, setMenuItems] = useState<OperationalMenuItem[]>(initialOperationalMenu);
  const [selectedItem, setSelectedItem] = useState<OperationalMenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState<string>('all');

  // Add Dish Modal State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Main Course');
  const [newDishPrice, setNewDishPrice] = useState<number>(290);
  const [newDishIsVeg, setNewDishIsVeg] = useState<boolean>(true);
  const [newDishDesc, setNewDishDesc] = useState('');

  const handleCreateDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdDish: OperationalMenuItem = {
      id: `m-${Date.now()}`,
      name: newDishName || 'Special Culinary Dish',
      categoryName: newDishCategory,
      price: newDishPrice || 250,
      foodCost: Math.round((newDishPrice || 250) * 0.3),
      marginPercent: 70,
      isVeg: newDishIsVeg,
      inStock: true,
      stockPortionsAvailable: 50,
      linkedSkus: [
        { name: 'Fresh Ingredients Mix', skuCode: '#SKU-100', qtyPerPortion: '1 portion', stockOk: true },
      ],
      channels: [
        { name: 'Online App', online: true },
        { name: 'Delivery App', online: true },
        { name: 'Direct Web', online: true },
        { name: 'Dine-In', online: true },
      ],
      description: newDishDesc || 'Freshly prepared authentic recipe by our head chef.',
      rating: 5.0,
      ordersToday: 0,
    };

    setMenuItems(prev => [createdDish, ...prev]);
    addToast('Dish Created', `${createdDish.name} added to your active menu!`, 'success');
    setShowAddDishModal(false);
    setNewDishName('');
    setNewDishDesc('');
  };

  const handleToggle86Stock = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const nextStockState = !item.inStock;
          const updatedChannels = item.channels.map(c => ({ ...c, online: nextStockState }));
          return {
            ...item,
            inStock: nextStockState,
            stockPortionsAvailable: nextStockState ? 40 : 0,
            channels: updatedChannels,
          };
        }
        return item;
      })
    );

    const targetItem = menuItems.find(i => i.id === itemId);
    if (targetItem) {
      if (targetItem.inStock) {
        addToast("86'd Item", `${targetItem.name} marked OUT OF STOCK across all channels`, 'warning');
      } else {
        addToast('Restocked', `${targetItem.name} restocked and ENABLED across all channels`, 'success');
      }
    }
  };

  const handleToggleChannel = (itemId: string, channelName: string) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const updatedChannels = item.channels.map(c =>
            c.name === channelName ? { ...c, online: !c.online } : c
          );
          return { ...item, channels: updatedChannels };
        }
        return item;
      })
    );
  };

  // Filter pipeline
  let filtered = menuItems;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      m => m.name.toLowerCase().includes(q) || m.categoryName.toLowerCase().includes(q)
    );
  }
  if (tabFilter !== 'all') {
    if (tabFilter === 'veg') filtered = filtered.filter(m => m.isVeg);
    else if (tabFilter === 'nonveg') filtered = filtered.filter(m => !m.isVeg);
    else if (tabFilter === 'combos') filtered = filtered.filter(m => m.isCombo);
    else if (tabFilter === 'beverages') filtered = filtered.filter(m => m.isBeverage || m.categoryName === 'Beverages');
    else if (tabFilter === 'out_of_stock') filtered = filtered.filter(m => !m.inStock);
    else if (tabFilter === 'available') filtered = filtered.filter(m => m.inStock);
  }

  const totalItemsCount = menuItems.length;
  const availableCount = menuItems.filter(m => m.inStock).length;
  const outOfStockCount = menuItems.filter(m => !m.inStock).length;
  const draftCount = 0;
  const categoriesCount = new Set(menuItems.map(m => m.categoryName)).size;

  return (
    <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

      {/* ═══════════════════════════════════════════════════
          1. CLEAN PAGE HEADER & PRIMARY CTA
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '12px 18px', borderRadius: 16 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: T.grad, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.glow, flexShrink: 0,
            }}>
              <Utensils size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Menu Operations
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: T.muted }}>
                Manage dishes, pricing, recipe stock, and channel availability
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setShowAddDishModal(true)}
            style={{
              height: 32, padding: '0 14px', background: T.brand, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              boxShadow: T.glow,
            }}
          >
            <PlusCircle size={14} /> + Add Menu Dish
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. ATTRACTIVE & CLICKABLE KPI SUMMARY CARDS
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
      }}>
        {/* Card 1: Total Items */}
        <div
          onClick={() => {
            setTabFilter('all');
            addToast('Menu Filtered', 'Showing all menu items', 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 18, cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderColor: tabFilter === 'all' ? T.brand : T.line,
            background: tabFilter === 'all' ? T.brandSoft : T.card,
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.brand;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = tabFilter === 'all' ? T.brand : T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Items
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {totalItemsCount}
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                Active catalog
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 12, background: T.subtle, color: T.ink,
              border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Utensils size={14} />
            </div>
          </div>
        </div>

        {/* Card 2: Available */}
        <div
          onClick={() => {
            setTabFilter('available');
            addToast('Filter Applied', 'Showing available items ready for ordering', 'success');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 18, cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderColor: tabFilter === 'available' ? T.green : T.line,
            background: tabFilter === 'available' ? T.greenBg : T.card,
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.green;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = tabFilter === 'available' ? T.green : T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Available
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {availableCount}
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ● In stock online
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 12, background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div
          onClick={() => {
            setTabFilter('out_of_stock');
            addToast('Stock Filter', 'Showing items currently out of stock', 'warning');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 18, cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderColor: tabFilter === 'out_of_stock' ? T.red : T.line,
            background: tabFilter === 'out_of_stock' ? T.redBg : T.card,
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.red;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = tabFilter === 'out_of_stock' ? T.red : T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Out of Stock
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.red, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {outOfStockCount}
              </div>
              <div style={{ fontSize: 10.5, color: T.red, fontWeight: 700 }}>
                ● Temporarily off
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 12, background: T.redBg, color: T.red,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PackageX size={14} />
            </div>
          </div>
        </div>

        {/* Card 4: Draft */}
        <div
          onClick={() => {
            addToast('Draft Items', 'All menu items are currently published and live', 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 18, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.muted;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Draft
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {draftCount}
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                Pending review
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 12, background: T.subtle, color: T.muted,
              border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={14} />
            </div>
          </div>
        </div>

        {/* Card 5: Categories */}
        <div
          onClick={() => {
            addToast('Categories Summary', `Menu items organized across ${categoriesCount} active categories`, 'info');
          }}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 18, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.brand;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.line;
            e.currentTarget.style.boxShadow = T.shadowCard;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Categories
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {categoriesCount}
              </div>
              <div style={{ fontSize: 10.5, color: T.brand, fontWeight: 600 }}>
                Menu sections
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 12, background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Layers size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. CLEANER TABS BAR & FILTER TOOLBAR
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '10px 16px', borderRadius: 28 })}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: 4, background: T.subtle, padding: 4, borderRadius: 9999, flexWrap: 'wrap', border: `1px solid ${T.line}` }}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'veg', label: '🟢 Veg' },
              { id: 'nonveg', label: '🔴 Non-Veg' },
              { id: 'combos', label: '🍱 Combos' },
              { id: 'beverages', label: '🥤 Beverages' },
              { id: 'out_of_stock', label: `⚠️ Out of Stock (${outOfStockCount})` },
            ].map(tab => {
              const isActive = tabFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabFilter(tab.id)}
                  style={{
                    height: 36, padding: '0 16px', fontSize: 12.5, fontWeight: 700, borderRadius: 9999,
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

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: T.subtle, border: `1px solid ${T.line}`,
            borderRadius: 9999, padding: '5px 14px', width: 230,
          }}>
            <Search size={14} color={T.muted} />
            <input
              type="text"
              placeholder="Search dish or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. SIMPLIFIED CLEAN MAIN TABLE (DISH, CATEGORY, PRICE, AVAILABILITY, PORTIONS, ACTIONS)
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ borderRadius: 28 })}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.ink, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Dish Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Price</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Availability Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 800 }}>Portions Available</th>
                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${T.lineSoft}`,
                    cursor: 'pointer', transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.subtle; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  {/* Dish Name */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 9, height: 9, borderRadius: '50%',
                        background: item.isVeg ? T.green : T.red,
                        flexShrink: 0,
                      }} title={item.isVeg ? 'Vegetarian' : 'Non-Veg'} />

                      <div>
                        <strong style={{ fontSize: 14, color: T.ink, display: 'block' }}>{item.name}</strong>
                        <div style={{ fontSize: 11, color: T.muted, lineClamp: 1 }}>{item.description}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: T.body, background: T.subtle,
                      border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 9999,
                    }}>
                      {item.categoryName}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '12px 16px' }}>
                    <strong style={{ fontSize: 14, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(item.price)}
                    </strong>
                  </td>

                  {/* Availability Status */}
                  {/* Stock Status Pill */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: item.inStock ? T.green : T.red,
                      background: item.inStock ? T.greenBg : T.redBg,
                      border: `1px solid ${item.inStock ? T.greenBorder : T.redBorder}`,
                    }}>
                      ● {item.inStock ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </span>
                  </td>

                  {/* Portions Available */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.inStock ? T.ink : T.red }}>
                      {item.inStock ? `${item.stockPortionsAvailable} Portions` : '0'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleToggle86Stock(item.id)}
                        style={{
                          height: 32, padding: '0 14px', fontSize: 11.5, fontWeight: 800,
                          color: item.inStock ? T.red : T.green,
                          background: item.inStock ? T.redBg : T.greenBg,
                          border: `1px solid ${item.inStock ? T.redBorder : T.greenBorder}`,
                          borderRadius: 9999, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {item.inStock ? 'Mark Out of Stock' : 'Restock'}
                      </button>

                      <button
                        onClick={() => setSelectedItem(item)}
                        style={{
                          height: 32, padding: '0 14px', fontSize: 11.5, fontWeight: 700,
                          background: T.subtle, color: T.body, border: `1px solid ${T.line}`,
                          borderRadius: 9999, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SLIDE-IN MENU ITEM DETAILS DRAWER (BOM, CHANNELS, MARGIN & MODIFIERS)
      ═══════════════════════════════════════════════════ */}
      {selectedItem && (
        <>
          <div
            onClick={() => setSelectedItem(null)}
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
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', background: T.card, borderBottom: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{selectedItem.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: selectedItem.isVeg ? T.green : T.red }}>
                    {selectedItem.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>
                  {selectedItem.categoryName} · Rating ★ {selectedItem.rating}
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: T.subtle,
                  border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.muted, cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Price & Profitability */}
              <div style={{ background: T.subtle, padding: '14px', borderRadius: 12, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Pricing &amp; Food Cost Profitability
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Selling Price</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: T.ink }}>{formatINR(selectedItem.price)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Food Cost (BOM)</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: T.amber }}>{formatINR(selectedItem.foodCost)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>Gross Margin</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: T.green }}>{selectedItem.marginPercent}%</div>
                  </div>
                </div>
              </div>

              {/* Recipe BOM & Linked Inventory SKUs */}
              <div style={{ background: T.subtle, padding: '14px', borderRadius: 12, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Recipe BOM &amp; Linked Inventory SKUs
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedItem.linkedSkus.map((sku, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#fff', padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.line}`,
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>{sku.name}</div>
                        <div style={{ fontSize: 10.5, color: T.brand, fontFamily: 'monospace' }}>{sku.skuCode}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>{sku.qtyPerPortion} / portion</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: sku.stockOk ? T.green : T.red }}>
                          {sku.stockOk ? '● Stock Available' : '⚠️ Low Stock Alert'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Availability Controls */}
              <div style={{ background: T.subtle, padding: '14px', borderRadius: 12, border: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Channel Availability Controls
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedItem.channels.map((ch, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.line}`,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{ch.name}</span>
                      <button
                        onClick={() => handleToggleChannel(selectedItem.id, ch.name)}
                        style={{
                          padding: '4px 10px', fontSize: 10.5, fontWeight: 800,
                          color: ch.online ? T.green : T.red,
                          background: ch.online ? T.greenBg : T.redBg,
                          border: `1px solid ${ch.online ? T.greenBorder : T.redBorder}`,
                          borderRadius: 6, cursor: 'pointer',
                        }}
                      >
                        {ch.online ? 'ONLINE' : 'OFFLINE'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: '14px 20px', background: T.card, borderTop: `1px solid ${T.line}`,
              display: 'flex', gap: 8,
            }}>
              <button
                onClick={() => {
                  handleToggle86Stock(selectedItem.id);
                  setSelectedItem(null);
                }}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 11.5, fontWeight: 800,
                  background: selectedItem.inStock ? T.redBg : T.greenBg,
                  color: selectedItem.inStock ? T.red : T.green,
                  border: `1px solid ${selectedItem.inStock ? T.redBorder : T.greenBorder}`,
                  borderRadius: 8, cursor: 'pointer',
                }}
              >
                {selectedItem.inStock ? "Mark Out of Stock Across All Channels" : 'Restock & Enable All Channels'}
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '8px 14px', fontSize: 11.5, fontWeight: 700,
                  background: T.subtle, color: T.body, border: `1px solid ${T.line}`,
                  borderRadius: 8, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 3. ADD MENU DISH MODAL ── */}
      {showAddDishModal && (
        <>
          <div onClick={() => setShowAddDishModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 400 }} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: T.ink }}>Add New Menu Dish</h3>
              <button onClick={() => setShowAddDishModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Dish Name</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={e => setNewDishName(e.target.value)}
                  placeholder="e.g. Malai Kofta Curry"
                  style={{
                    width: '100%', height: 36, padding: '0 12px', fontSize: 13, fontWeight: 600,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Category</label>
                  <select
                    value={newDishCategory}
                    onChange={e => setNewDishCategory(e.target.value)}
                    style={{
                      width: '100%', height: 36, padding: '0 10px', fontSize: 12.5, fontWeight: 600,
                      borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none', background: T.subtle,
                    }}
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Tandoor & Bread">Tandoor &amp; Bread</option>
                    <option value="Starters & Appetizers">Starters &amp; Appetizers</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newDishPrice}
                    onChange={e => setNewDishPrice(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', height: 36, padding: '0 12px', fontSize: 13, fontWeight: 700,
                      borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Food Type</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setNewDishIsVeg(true)}
                    style={{
                      flex: 1, height: 34, fontSize: 12, fontWeight: 700,
                      borderRadius: 8, border: `1px solid ${newDishIsVeg ? T.green : T.line}`,
                      background: newDishIsVeg ? T.greenBg : T.subtle,
                      color: newDishIsVeg ? T.green : T.body,
                      cursor: 'pointer',
                    }}
                  >
                    🟢 Vegetarian
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDishIsVeg(false)}
                    style={{
                      flex: 1, height: 34, fontSize: 12, fontWeight: 700,
                      borderRadius: 8, border: `1px solid ${!newDishIsVeg ? T.red : T.line}`,
                      background: !newDishIsVeg ? T.redBg : T.subtle,
                      color: !newDishIsVeg ? T.red : T.body,
                      cursor: 'pointer',
                    }}
                  >
                    🔴 Non-Vegetarian
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Dish Description</label>
                <textarea
                  value={newDishDesc}
                  onChange={e => setNewDishDesc(e.target.value)}
                  placeholder="Describe the dish ingredients and flavors..."
                  rows={2}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 500,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                    fontFamily: 'inherit', resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: 38, fontSize: 12.5, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 8, cursor: 'pointer',
                    boxShadow: T.glow,
                  }}
                >
                  Add Dish to Menu
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  style={{
                    height: 38, padding: '0 16px', fontSize: 12, fontWeight: 700, color: T.body,
                    background: T.subtle, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
