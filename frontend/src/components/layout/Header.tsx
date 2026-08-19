import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  CheckCircle,
  XCircle,
  Menu,
  MapPin,
  Zap,
  X,
} from 'lucide-react';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';
import type { Outlet } from '../../types';
import { useToast } from '../ui/Toast';
import './Header.css';

export interface HeaderProps {
  isOnline: boolean;
  onToggleOnline: (online: boolean) => void;
  outlets: Outlet[];
  activeOutletId: string;
  onSelectOutlet: (outletId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onMobileMenuToggle: () => void;
  onQuickActionClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  outlets,
  activeOutletId,
  onSelectOutlet,
  searchTerm,
  onSearchChange,
  onMobileMenuToggle,
  onQuickActionClick,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const { addToast } = useToast();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const outletRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (outletRef.current && !outletRef.current.contains(event.target as Node)) {
        setShowOutletDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeOutlet = outlets.find((o) => o.id === activeOutletId) || outlets[0];

  const handleStatusChange = (newStatus: boolean) => {
    onToggleOnline(newStatus);
  };

  return (
    <header className="fic-header">
      <div className="fic-header__left">
        <button
          className="fic-header__mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search with Ctrl + K Badge */}
        <div className="fic-header__search">
          <Search
            size={17}
            className="fic-header__search-icon"
            style={{ cursor: 'pointer' }}
            onClick={() => searchInputRef.current?.focus()}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search orders (#FIC-8891), menu items, customers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="fic-header__search-input"
          />
          {searchTerm ? (
            <button
              type="button"
              className="fic-header__search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd
              className="fic-header__search-kbd"
              onClick={() => searchInputRef.current?.focus()}
              style={{ cursor: 'pointer' }}
            >
              Ctrl + K
            </kbd>
          )}
        </div>
      </div>

      <div className="fic-header__right">
        {/* Restaurant Status Toggle */}
        <div
          className={`fic-header__status-pill ${isOnline ? 'is-online' : 'is-offline'}`}
          title={isOnline ? 'Store is accepting orders' : 'Store is not accepting orders'}
        >
          <Toggle
            checked={isOnline}
            onChange={(checked) => handleStatusChange(checked)}
            size="sm"
          />
          <span className="fic-header__status-label">
            {isOnline ? 'Accepting Orders' : 'Not Accepting Orders'}
          </span>
        </div>

        {/* Outlet Switcher with Location Pin */}
        <div className="fic-header__outlet-selector" ref={outletRef}>
          <button
            className="fic-header__outlet-btn"
            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
          >
            <MapPin size={15} color="#FA4A33" />
            <div className="fic-header__outlet-text">
              <span className="fic-header__outlet-name">{activeOutlet?.name || 'Spice Junction'}</span>
              <span className="fic-header__outlet-sub">{activeOutlet?.city || 'Electronic City Phase 1'}</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showOutletDropdown && (
            <div className="fic-header__dropdown fic-header__dropdown--outlet animate-fade-in">
              <div className="fic-header__dropdown-header">Select Restaurant Outlet</div>
              {outlets.map((o) => (
                <button
                  key={o.id}
                  className={`fic-header__dropdown-item ${o.id === activeOutletId ? 'active' : ''}`}
                  onClick={() => {
                    onSelectOutlet(o.id);
                    setShowOutletDropdown(false);
                    addToast(`Switched to ${o.name}`, undefined, 'info');
                  }}
                >
                  <span className="fic-header__outlet-item-title">{o.name}</span>
                  <span className="fic-header__outlet-item-sub">{o.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          className="fic-header__quick-action-btn"
          onClick={onQuickActionClick}
        >
          <Zap size={16} fill="#ffffff" color="#ffffff" />
          <span>Quick Actions</span>
        </button>

        {/* Notifications Bell */}
        <div className="fic-header__notif-wrapper" ref={notifRef}>
          <button
            className="fic-header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="fic-header__badge-count">3</span>
          </button>
          {showNotifications && (
            <div className="fic-header__dropdown fic-header__dropdown--notif animate-fade-in">
              <div className="fic-header__dropdown-header flex justify-between items-center">
                <span>Recent Notifications</span>
                <Badge variant="primary" size="sm">3 Unread</Badge>
              </div>
              <div className="fic-header__notif-list">
                <div className="fic-header__notif-item unread">
                  <CheckCircle size={16} color="#10B981" />
                  <div>
                    <p className="fic-header__notif-title">New Order #FIC-8891</p>
                    <span className="fic-header__notif-time">5 mins ago</span>
                  </div>
                </div>
                <div className="fic-header__notif-item unread">
                  <XCircle size={16} color="#EF4444" />
                  <div>
                    <p className="fic-header__notif-title">Butter Stock Alert (&lt; 5kg)</p>
                    <span className="fic-header__notif-time">30 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="fic-header__profile-wrapper" ref={profileRef}>
          <button
            className="fic-header__profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="fic-header__avatar">RS</div>
            <div className="fic-header__user-text">
              <span className="fic-header__user-name">Rajesh Sharma</span>
              <span className="fic-header__user-role">Manager</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showProfileMenu && (
            <div className="fic-header__dropdown fic-header__dropdown--profile animate-fade-in">
              <div className="fic-header__profile-header">
                <strong>Rajesh Sharma</strong>
                <span>partner@spicejunction.in</span>
              </div>
              <div className="fic-header__dropdown-divider" />
              <button className="fic-header__dropdown-item">
                <User size={16} /> My Account
              </button>
              <button className="fic-header__dropdown-item">
                <Sliders size={16} /> Portal Settings
              </button>
              <div className="fic-header__dropdown-divider" />
              <button className="fic-header__dropdown-item text-danger">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
