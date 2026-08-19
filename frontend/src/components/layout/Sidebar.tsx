import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Truck,
  Bike,
  UtensilsCrossed,
  Grid,
  Boxes,
  Users,
  Star,
  BarChart3,
  HelpCircle,
  Flame,
  Percent,
} from 'lucide-react';
import type { NavItem } from '../../types';
import { Badge } from '../ui/Badge';
import { useOrders } from '../../context/OrderContext';
import './Sidebar.css';

export interface SidebarProps {
  collapsed: boolean;
  onSidebarClick: () => void;
}

export interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

export const navSectionsConfig: NavSection[] = [
  {
    sectionTitle: 'OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', iconName: 'LayoutDashboard' },
      { id: 'orders', label: 'Orders', path: '/orders', iconName: 'ShoppingBag', badge: '3 New', badgeVariant: 'warning' },
      { id: 'kitchen', label: 'Kitchen', path: '/kitchen', iconName: 'ChefHat' },
      { id: 'delivery', label: 'Delivery', path: '/delivery', iconName: 'Truck' },
      { id: 'riders', label: 'Riders', path: '/riders', iconName: 'Bike' },
      { id: 'inventory', label: 'Inventory', path: '/inventory', iconName: 'Boxes', badge: '1 Alert', badgeVariant: 'error' },
    ],
  },
  {
    sectionTitle: 'RESTAURANT',
    items: [
      { id: 'menu', label: 'Menu Management', path: '/menu', iconName: 'UtensilsCrossed' },
      { id: 'categories', label: 'Categories', path: '/categories', iconName: 'Grid' },
      { id: 'offers', label: 'Offers', path: '/promotions', iconName: 'Percent' },
      { id: 'reports', label: 'Reports', path: '/reports', iconName: 'BarChart3' },
    ],
  },
  {
    sectionTitle: 'CUSTOMERS',
    items: [
      { id: 'customers', label: 'Customers', path: '/customers', iconName: 'Users' },
      { id: 'reviews', label: 'Reviews', path: '/reviews', iconName: 'Star' },
      { id: 'support', label: 'Support', path: '/support', iconName: 'HelpCircle' },
    ],
  },
];

const renderIcon = (name: string) => {
  const iconProps = { size: 19 };
  switch (name) {
    case 'LayoutDashboard': return <LayoutDashboard {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'ChefHat': return <ChefHat {...iconProps} />;
    case 'Truck': return <Truck {...iconProps} />;
    case 'Bike': return <Bike {...iconProps} />;
    case 'UtensilsCrossed': return <UtensilsCrossed {...iconProps} />;
    case 'Grid': return <Grid {...iconProps} />;
    case 'Boxes': return <Boxes {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Percent': return <Percent {...iconProps} />;
    case 'BarChart3': return <BarChart3 {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    default: return <Grid {...iconProps} />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onSidebarClick,
}) => {
  const { isOnline } = useOrders();

  return (
    <aside
      className={`fic-sidebar ${collapsed ? 'collapsed' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSidebarClick();
      }}
    >
      {/* Brand Header */}
      <div className="fic-sidebar__brand">
        <div className="fic-sidebar__logo-icon" title={collapsed ? 'Forge India Partner Portal' : undefined}>
          <Flame size={24} color="#FF7A30" />
        </div>
        {!collapsed && (
          <div className="fic-sidebar__brand-text">
            <h1 className="fic-sidebar__app-name">Forge India</h1>
            <span className="fic-sidebar__portal-tag">PARTNER PORTAL</span>
          </div>
        )}
      </div>

      {/* Grouped Section Navigation List */}
      <nav className="fic-sidebar__nav">
        {navSectionsConfig.map((sec) => (
          <div key={sec.sectionTitle} className="fic-sidebar__section">
            {!collapsed ? (
              <div className="fic-sidebar__section-heading">{sec.sectionTitle}</div>
            ) : (
              <div className="fic-sidebar__section-divider" />
            )}
            <ul className="fic-sidebar__nav-list">
              {sec.items.map((item) => {
                const tooltipText = item.badge ? `${item.label} (${item.badge})` : item.label;
                return (
                  <li key={item.id} className="fic-sidebar__nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `fic-sidebar__link ${isActive ? 'active' : ''}`
                      }
                      data-tooltip={collapsed ? tooltipText : undefined}
                    >
                      <span className="fic-sidebar__link-icon">{renderIcon(item.iconName)}</span>
                      {!collapsed && <span className="fic-sidebar__link-label">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <Badge variant={item.badgeVariant || 'neutral'} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                      {collapsed && item.badge && (
                        <span
                          className={`fic-sidebar__collapsed-badge ${item.badgeVariant || 'warning'}`}
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Restaurant Profile Card */}
      {collapsed ? (
        <div className="fic-sidebar__footer collapsed">
          <div
            className="fic-sidebar__profile-avatar"
            data-tooltip={`Spice Junction (${isOnline ? 'ONLINE' : 'OFFLINE'})`}
          >
            SJ
          </div>
        </div>
      ) : (
        <div className="fic-sidebar__footer">
          <div className="fic-sidebar__restaurant-card">
            <div className="fic-sidebar__profile-avatar">SJ</div>
            <div className="fic-sidebar__restaurant-details">
              <div className="fic-sidebar__restaurant-name">Spice Junction</div>
              <div className="fic-sidebar__outlet-location">Electronic City Phase 1</div>
              <div className="fic-sidebar__online-indicator" style={{ color: isOnline ? '#10B981' : '#EF4444' }}>
                <span className="fic-sidebar__status-dot" style={{ background: isOnline ? '#10B981' : '#EF4444' }} />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
