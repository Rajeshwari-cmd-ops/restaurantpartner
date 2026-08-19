import React, { useState } from 'react';
import {
  Layers,
  Search,
  PlusCircle,
  GripVertical,
  CheckCircle2,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  Utensils,
  ArrowLeft,
  ChevronRight,
  PackageX,
  RefreshCw,
  Edit2,
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
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
  ...extra,
});

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  itemCount: number;
  vegCount: number;
  nonVegCount: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface CategoryDish {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  inStock: boolean;
  portionsAvailable: number;
  description: string;
}

const mockCategoryDishesMap: Record<string, CategoryDish[]> = {
  'cat-1': [
    { id: 'cd-101', name: 'Paneer Butter Masala', price: 340, isVeg: true, inStock: true, portionsAvailable: 42, description: 'Cottage cheese in buttery tomato gravy.' },
    { id: 'cd-102', name: 'Chicken Dum Biryani (Full)', price: 380, isVeg: false, inStock: true, portionsAvailable: 55, description: 'Basmati rice layered with marinated chicken.' },
    { id: 'cd-103', name: 'Dal Makhani Slow Cooked', price: 290, isVeg: true, inStock: true, portionsAvailable: 30, description: 'Black lentils slow cooked with cream & butter.' },
    { id: 'cd-104', name: 'Mutton Rogan Josh', price: 460, isVeg: false, inStock: false, portionsAvailable: 0, description: 'Kashmiri style mutton curry.' },
    { id: 'cd-105', name: 'Kadai Paneer Special', price: 330, isVeg: true, inStock: true, portionsAvailable: 28, description: 'Paneer cooked with bell peppers & pounded spices.' },
    { id: 'cd-106', name: 'Butter Chicken Murgh', price: 390, isVeg: false, inStock: true, portionsAvailable: 40, description: 'Classic tandoori chicken in velvet tomato cream gravy.' },
  ],
  'cat-2': [
    { id: 'cd-201', name: 'Paneer Tikka Tandoori', price: 280, isVeg: true, inStock: true, portionsAvailable: 35, description: 'Marinated cottage cheese cooked in clay oven.' },
    { id: 'cd-202', name: 'Chicken Malai Tikka', price: 320, isVeg: false, inStock: true, portionsAvailable: 24, description: 'Creamy marinated chicken skewers.' },
    { id: 'cd-203', name: 'Crispy Veg Spring Rolls', price: 220, isVeg: true, inStock: true, portionsAvailable: 50, description: 'Golden fried rolls with seasoned veggies.' },
  ],
  'cat-3': [
    { id: 'cd-301', name: 'Garlic Butter Naan', price: 75, isVeg: true, inStock: true, portionsAvailable: 120, description: 'Tandoori bread brushed with minced garlic and butter.' },
    { id: 'cd-302', name: 'Butter Roti Tandoori', price: 35, isVeg: true, inStock: true, portionsAvailable: 200, description: 'Whole wheat tandoori roti with butter.' },
    { id: 'cd-303', name: 'Cheese Stuffed Kulcha', price: 110, isVeg: true, inStock: true, portionsAvailable: 45, description: 'Soft kulcha stuffed with spiced melted cheese.' },
  ],
  'cat-4': [
    { id: 'cd-401', name: 'Mango Lassi Thick', price: 120, isVeg: true, inStock: true, portionsAvailable: 60, description: 'Churned yogurt drink with Alphonso mango.' },
    { id: 'cd-402', name: 'Masala Cutting Chai', price: 40, isVeg: true, inStock: true, portionsAvailable: 150, description: 'Traditional spiced ginger tea.' },
  ],
  'cat-5': [
    { id: 'cd-501', name: 'Gulab Jamun (2 pcs)', price: 90, isVeg: true, inStock: true, portionsAvailable: 80, description: 'Warm milk solid dumplings in sugar syrup.' },
    { id: 'cd-502', name: 'Rasmalai Saffron', price: 130, isVeg: true, inStock: true, portionsAvailable: 40, description: 'Soft cottage cheese patties in saffron milk.' },
  ],
  'cat-6': [
    { id: 'cd-601', name: 'Winter Nalli Nihari', price: 520, isVeg: false, inStock: false, portionsAvailable: 0, description: 'Slow simmered lamb shank stew.' },
  ],
};

const initialCategories: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Main Course',
    description: 'Rich North & South Indian curries, biryanis, and traditional gravies.',
    displayOrder: 1,
    itemCount: 14,
    vegCount: 8,
    nonVegCount: 6,
    isActive: true,
    lastUpdated: 'Today, 10:15 AM',
  },
  {
    id: 'cat-2',
    name: 'Starters & Appetizers',
    description: 'Crispy tandoori kebabs, paneer tikka, spring rolls, and light starters.',
    displayOrder: 2,
    itemCount: 8,
    vegCount: 5,
    nonVegCount: 3,
    isActive: true,
    lastUpdated: 'Yesterday',
  },
  {
    id: 'cat-3',
    name: 'Tandoor & Breads',
    description: 'Freshly baked naan, roti, butter kulcha, and tandoori parathas.',
    displayOrder: 3,
    itemCount: 6,
    vegCount: 6,
    nonVegCount: 0,
    isActive: true,
    lastUpdated: 'Today, 09:30 AM',
  },
  {
    id: 'cat-4',
    name: 'Beverages & Lassi',
    description: 'Refreshing lassi, coolers, cold drinks, masala chai, and juices.',
    displayOrder: 4,
    itemCount: 5,
    vegCount: 5,
    nonVegCount: 0,
    isActive: true,
    lastUpdated: '3 days ago',
  },
  {
    id: 'cat-5',
    name: 'Desserts & Sweets',
    description: 'Gulab jamun, rasmalai, kulfi, and authentic Indian desserts.',
    displayOrder: 5,
    itemCount: 4,
    vegCount: 4,
    nonVegCount: 0,
    isActive: true,
    lastUpdated: '4 days ago',
  },
  {
    id: 'cat-6',
    name: 'Chef Specials (Seasonal)',
    description: 'Exclusive seasonal recipes crafted by master chefs.',
    displayOrder: 6,
    itemCount: 1,
    vegCount: 0,
    nonVegCount: 1,
    isActive: false, // Hidden category
    lastUpdated: '1 week ago',
  },
];

export const CategoriesPage: React.FC = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'dishes' | 'name'>('order');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Category Details Page State
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<CategoryItem | null>(null);
  const [dishesMap, setDishesMap] = useState<Record<string, CategoryDish[]>>(mockCategoryDishesMap);

  // Handlers
  const handleToggleVisibility = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCategories(prev =>
      prev.map(c => {
        if (c.id === catId) {
          const nextActive = !c.isActive;
          addToast(
            nextActive ? 'Category Published' : 'Category Hidden',
            `${c.name} is now ${nextActive ? 'ACTIVE on menu' : 'HIDDEN from menu'}`,
            nextActive ? 'success' : 'info'
          );
          return { ...c, isActive: nextActive };
        }
        return c;
      })
    );
  };

  const handleMoveOrder = (catId: string, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const idx = categories.findIndex(c => c.id === catId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categories.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newCategories = [...categories];

    // Swap positions
    const temp = newCategories[idx];
    newCategories[idx] = newCategories[targetIdx];
    newCategories[targetIdx] = temp;

    // Re-assign displayOrder numbers
    const reordered = newCategories.map((c, i) => ({ ...c, displayOrder: i + 1 }));
    setCategories(reordered);
    addToast('Reordered', `Updated display rank for ${temp.name}`, 'info');
  };

  const handleDeleteCategory = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (selectedCategoryDetails?.id === catId) {
      setSelectedCategoryDetails(null);
    }
    addToast('Category Deleted', `${cat.name} removed from categories list`, 'warning');
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setCategories(prev =>
      prev.map(c => (c.id === editingCategory.id ? { ...editingCategory, lastUpdated: 'Just now' } : c))
    );
    if (selectedCategoryDetails?.id === editingCategory.id) {
      setSelectedCategoryDetails({ ...editingCategory, lastUpdated: 'Just now' });
    }
    addToast('Saved Changes', `Category ${editingCategory.name} updated`, 'success');
    setEditingCategory(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddModal(false);
    addToast('Category Created', 'New menu category added successfully', 'success');
  };

  // Bulk 86 Dish Actions for Selected Category
  const handleBulkCategory86 = (catId: string, enableAll: boolean) => {
    setDishesMap(prev => {
      const categoryDishes = prev[catId] || [];
      const updatedDishes = categoryDishes.map(d => ({
        ...d,
        inStock: enableAll,
        portionsAvailable: enableAll ? 40 : 0,
      }));
      return { ...prev, [catId]: updatedDishes };
    });

    const catName = selectedCategoryDetails?.name || 'Category';
    if (enableAll) {
      addToast('Bulk Restock', `All dishes in ${catName} restocked and ENABLED`, 'success');
    } else {
      addToast("Bulk 86'd", `All dishes in ${catName} marked OUT OF STOCK`, 'warning');
    }
  };

  // Single Dish 86 Toggle
  const handleSingleDish86 = (catId: string, dishId: string) => {
    setDishesMap(prev => {
      const categoryDishes = prev[catId] || [];
      const updated = categoryDishes.map(d => {
        if (d.id === dishId) {
          const nextStock = !d.inStock;
          return { ...d, inStock: nextStock, portionsAvailable: nextStock ? 35 : 0 };
        }
        return d;
      });
      return { ...prev, [catId]: updated };
    });
  };

  // Filter & Sort Pipeline
  let filtered = categories;
  if (searchTerm.trim() !== '') {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }
  if (statusFilter === 'active') filtered = filtered.filter(c => c.isActive);
  if (statusFilter === 'hidden') filtered = filtered.filter(c => !c.isActive);

  if (sortBy === 'dishes') {
    filtered = [...filtered].sort((a, b) => b.itemCount - a.itemCount);
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered = [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const activeCount = categories.filter(c => c.isActive).length;
  const hiddenCount = categories.filter(c => !c.isActive).length;
  const totalDishesCount = categories.reduce((acc, c) => acc + c.itemCount, 0);

  /* ═══════════════════════════════════════════════════════════════════
     VIEW B: DEDICATED CATEGORY DETAILS PAGE
  ═══════════════════════════════════════════════════════════════════ */
  if (selectedCategoryDetails) {
    const categoryDishes = dishesMap[selectedCategoryDetails.id] || [];

    return (
      <div style={{ fontFamily: 'var(--font-family-sans)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

        {/* Top Navigation & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSelectedCategoryDetails(null)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', background: T.subtle, color: T.ink,
                border: `1px solid ${T.line}`, borderRadius: 9,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} /> Back to All Categories
            </button>

            <span style={{ color: T.muted, fontSize: 12 }}>/</span>

            <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Category Details</span>
            <span style={{ color: T.muted, fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, color: T.brand, fontWeight: 800 }}>{selectedCategoryDetails.name}</span>
          </div>

          {/* Bulk Category Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleBulkCategory86(selectedCategoryDetails.id, false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 11px', background: T.redBg, color: T.red,
                border: `1px solid ${T.redBorder}`, borderRadius: 9,
                fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
              }}
            >
              <PackageX size={14} /> 86 Entire Category
            </button>

            <button
              onClick={() => handleBulkCategory86(selectedCategoryDetails.id, true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 11px', background: T.greenBg, color: T.green,
                border: `1px solid ${T.greenBorder}`, borderRadius: 9,
                fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Restock Category
            </button>

            <button
              onClick={() => setEditingCategory(selectedCategoryDetails)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', background: T.brandSoft, color: T.brand,
                border: `1px solid rgba(255,107,44,0.25)`, borderRadius: 9,
                fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
              }}
            >
              <Edit2 size={14} /> Edit Category
            </button>
          </div>
        </div>

        {/* Category Header Card */}
        <div style={cardStyle({ padding: '16px 20px', borderRadius: 18 })}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>
                  {selectedCategoryDetails.name}
                </h1>

                <span style={{
                  fontSize: 11, fontWeight: 800, fontFamily: 'monospace',
                  background: T.subtle, color: T.ink, border: `1px solid ${T.line}`,
                  padding: '2px 8px', borderRadius: 6,
                }}>
                  DISPLAY RANK #{selectedCategoryDetails.displayOrder}
                </span>

                <span style={{
                  fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                  color: selectedCategoryDetails.isActive ? T.green : T.muted,
                  background: selectedCategoryDetails.isActive ? T.greenBg : T.subtle,
                  border: `1px solid ${selectedCategoryDetails.isActive ? T.greenBorder : T.line}`,
                }}>
                  ● {selectedCategoryDetails.isActive ? 'ACTIVE ON MENU' : 'HIDDEN'}
                </span>
              </div>

              <p style={{ margin: '2px 0 0', fontSize: 13, color: T.muted, maxWidth: 650, lineHeight: 1.4 }}>
                {selectedCategoryDetails.description}
              </p>
            </div>

            {/* Category Metrics Pills */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: T.subtle, border: `1px solid ${T.line}`, padding: '8px 14px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>Dishes Listed</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: T.ink }}>{selectedCategoryDetails.itemCount} Dishes</div>
              </div>

              <div style={{ background: T.subtle, border: `1px solid ${T.line}`, padding: '8px 14px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>Dietary Split</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.green }}>
                  🟢 {selectedCategoryDetails.vegCount} Veg · <span style={{ color: T.red }}>🔴 {selectedCategoryDetails.nonVegCount} Non-Veg</span>
                </div>
              </div>

              <div style={{ background: T.subtle, border: `1px solid ${T.line}`, padding: '8px 14px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>Active Channels</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.brand }}>
                  Online Delivery, Direct Web, Dine-In
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Dishes Table */}
        <div style={cardStyle({ borderRadius: 18 })}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: T.ink, margin: 0 }}>
              Dishes in "{selectedCategoryDetails.name}" ({categoryDishes.length})
            </h3>
            <span style={{ fontSize: 11.5, color: T.muted }}>
              Manage portion availability and 86'd toggles for items in this category.
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: T.subtle, borderBottom: `1px solid ${T.line}`, color: T.ink, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Dish Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Selling Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Portions Available</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Stock Availability</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryDishes.map((dish, idx) => (
                  <tr
                    key={dish.id}
                    style={{
                      borderBottom: idx === categoryDishes.length - 1 ? 'none' : `1px solid ${T.lineSoft}`,
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.subtle; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 9, height: 9, borderRadius: '50%',
                          background: dish.isVeg ? T.green : T.red,
                          flexShrink: 0,
                        }} title={dish.isVeg ? 'Vegetarian' : 'Non-Veg'} />
                        <div>
                          <strong style={{ fontSize: 13.5, color: T.ink, display: 'block' }}>{dish.name}</strong>
                          <div style={{ fontSize: 11, color: T.muted }}>{dish.description}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ fontSize: 14, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>
                        {formatINR(dish.price)}
                      </strong>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: dish.inStock ? T.ink : T.red }}>
                        {dish.inStock ? `${dish.portionsAvailable} Portions` : '0'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
                        color: dish.inStock ? T.green : T.red,
                        background: dish.inStock ? T.greenBg : T.redBg,
                        border: `1px solid ${dish.inStock ? T.greenBorder : T.redBorder}`,
                      }}>
                        ● {dish.inStock ? 'AVAILABLE' : 'OUT OF STOCK'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleSingleDish86(selectedCategoryDetails.id, dish.id)}
                        style={{
                          padding: '5px 11px', fontSize: 11, fontWeight: 800,
                          color: dish.inStock ? T.red : T.green,
                          background: dish.inStock ? T.redBg : T.greenBg,
                          border: `1px solid ${dish.inStock ? T.redBorder : T.greenBorder}`,
                          borderRadius: 8, cursor: 'pointer',
                        }}
                      >
                        {dish.inStock ? 'Mark Out of Stock' : 'Restock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     VIEW A: MAIN CATEGORIES GRID DASHBOARD
  ═══════════════════════════════════════════════════════════════════ */
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
              <Layers size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: T.ink, margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Menu Categories
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: T.muted }}>
                Organize menu items, channel visibility, and ordering sequence
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              height: 32, padding: '0 14px', background: T.brand, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              boxShadow: T.glow,
            }}
          >
            <PlusCircle size={14} /> Create Category
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. CRISP & SPACIOUS KPI SUMMARY CARDS
      ═══════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {/* KPI 1: Total Categories */}
        <div
          onClick={() => setStatusFilter('all')}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
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
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {categories.length} Total
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                All menu sections
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: T.subtle, color: T.ink,
              border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Layers size={14} />
            </div>
          </div>
        </div>

        {/* KPI 2: Active Online */}
        <div
          onClick={() => setStatusFilter('active')}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.15s ease',
          })}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.green;
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
                Active Online
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {activeCount} Active
              </div>
              <div style={{ fontSize: 10.5, color: T.green, fontWeight: 700 }}>
                ● Visible on apps
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: T.greenBg, color: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>

        {/* KPI 3: Hidden */}
        <div
          onClick={() => setStatusFilter('hidden')}
          style={cardStyle({
            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
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
                Hidden Categories
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {hiddenCount} Hidden
              </div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>
                Unpublished
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: T.subtle, color: T.muted,
              border: `1px solid ${T.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <EyeOff size={14} />
            </div>
          </div>
        </div>

        {/* KPI 4: Total Menu Dishes */}
        <div
          style={cardStyle({
            padding: '10px 14px', borderRadius: 12,
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Menu Dishes
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.brand, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                {totalDishesCount} Dishes
              </div>
              <div style={{ fontSize: 10.5, color: T.brand, fontWeight: 600 }}>
                Across all categories
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: T.brandSoft, color: T.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Utensils size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. SEARCH, STATUS FILTER & SORT TOOLBAR
      ═══════════════════════════════════════════════════ */}
      <div style={cardStyle({ padding: '10px 16px', borderRadius: 28 })}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: T.subtle, border: `1px solid ${T.line}`,
            borderRadius: 9999, padding: '5px 14px', width: 260,
          }}>
            <Search size={14} color={T.muted} />
            <input
              type="text"
              placeholder="Search category name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </div>

          {/* Filters & Sort */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, background: T.subtle, padding: 4, borderRadius: 9999, border: `1px solid ${T.line}` }}>
              {(['all', 'active', 'hidden'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    height: 32, padding: '0 14px', fontSize: 12, fontWeight: 700, borderRadius: 9999,
                    border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                    background: statusFilter === st ? '#ffffff' : 'transparent',
                    color: statusFilter === st ? T.brand : T.muted,
                    boxShadow: statusFilter === st ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                height: 38, padding: '0 16px', fontSize: 12, fontWeight: 700,
                background: T.subtle, border: `1px solid ${T.line}`,
                borderRadius: 9999, color: T.body, cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="order">Sort: Display Rank (#1-#8)</option>
              <option value="dishes">Sort: Most Dishes First</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. COMPACT CATEGORY GRID CARDS (CLICKABLE CARDS)
      ═══════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map((cat, idx) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategoryDetails(cat)}
            style={cardStyle({
              padding: 16, borderRadius: 28,
              borderLeft: `4px solid ${cat.isActive ? T.brand : T.muted}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = T.shadowHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = T.shadowCard;
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Card Top: Rank, Title & Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ cursor: 'grab', color: T.muted }} title="Drag to reorder category">
                    <GripVertical size={16} />
                  </div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, fontFamily: 'monospace',
                    background: T.subtle, color: T.ink, border: `1px solid ${T.line}`,
                    padding: '2px 8px', borderRadius: 9999,
                  }}>
                    RANK #{cat.displayOrder}
                  </span>
                </div>

                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                  color: cat.isActive ? T.green : T.muted,
                  background: cat.isActive ? T.greenBg : T.subtle,
                  border: `1px solid ${cat.isActive ? T.greenBorder : T.line}`,
                }}>
                  ● {cat.isActive ? 'ACTIVE' : 'HIDDEN'}
                </span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 800, color: T.ink, margin: '0 0 4px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {cat.name}
                <ChevronRight size={15} color={T.muted} />
              </h3>
              <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {cat.description}
              </p>
            </div>

            {/* Dish Breakdown Metrics Bar */}
            <div style={{
              background: T.subtle, padding: '10px 14px', borderRadius: 18,
              border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>
                {cat.itemCount} Dishes Listed
              </div>

              <div style={{ display: 'flex', gap: 6, fontSize: 10.5, fontWeight: 700 }}>
                <span style={{ color: T.green }}>🟢 {cat.vegCount} Veg</span>
                <span style={{ color: T.line }}>|</span>
                <span style={{ color: T.red }}>🔴 {cat.nonVegCount} Non-Veg</span>
              </div>
            </div>

            {/* Actions Footer (e.stopPropagation prevents triggering card navigation) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.lineSoft}`, paddingTop: 10 }}>
              {/* Reorder Buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  disabled={idx === 0}
                  onClick={(e) => handleMoveOrder(cat.id, 'up', e)}
                  style={{
                    width: 28, height: 28, fontSize: 10, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${T.line}`, background: T.subtle, color: T.body,
                    cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Move Category Up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  disabled={idx === filtered.length - 1}
                  onClick={(e) => handleMoveOrder(cat.id, 'down', e)}
                  style={{
                    width: 28, height: 28, fontSize: 10, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${T.line}`, background: T.subtle, color: T.body,
                    cursor: idx === filtered.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === filtered.length - 1 ? 0.4 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Move Category Down"
                >
                  <ArrowDown size={12} />
                </button>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={(e) => handleToggleVisibility(cat.id, e)}
                  style={{
                    height: 32, padding: '0 12px', fontSize: 11, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${T.line}`, background: T.subtle, color: T.body, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {cat.isActive ? 'Hide' : 'Show'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(cat);
                  }}
                  style={{
                    height: 32, padding: '0 12px', fontSize: 11, fontWeight: 800, borderRadius: 9999,
                    border: `1px solid rgba(255,107,44,0.25)`, background: T.brandSoft, color: T.brand, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => handleDeleteCategory(cat.id, e)}
                  style={{
                    width: 32, height: 32, fontSize: 11, fontWeight: 700, borderRadius: 9999,
                    border: `1px solid ${T.line}`, background: T.subtle, color: T.red, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Delete Category"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          EDIT CATEGORY MODAL
      ═══════════════════════════════════════════════════ */}
      {editingCategory && (
        <>
          <div
            onClick={() => setEditingCategory(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: T.ink }}>
                Edit Category — {editingCategory.name}
              </h3>
              <button onClick={() => setEditingCategory(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Category Title</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 700,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 500,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '9px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  style={{
                    padding: '9px 14px', fontSize: 12, fontWeight: 700, color: T.body,
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

      {/* ═══════════════════════════════════════════════════
          CREATE CATEGORY MODAL
      ═══════════════════════════════════════════════════ */}
      {showAddModal && (
        <>
          <div
            onClick={() => setShowAddModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)', zIndex: 400,
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            zIndex: 401, padding: 20, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: T.ink }}>
                Create New Menu Category
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Category Title</label>
                <input
                  type="text"
                  placeholder="e.g. Biryanis & Rice"
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 700,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Fragrant basmati rice dishes cooked on slow dum."
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 500,
                    borderRadius: 8, border: `1px solid ${T.line}`, marginTop: 4, outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '9px', fontSize: 12, fontWeight: 800, color: '#fff',
                    background: T.brand, border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 14px', fontSize: 12, fontWeight: 700, color: T.body,
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
