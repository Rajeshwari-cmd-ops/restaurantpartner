import React, { useState } from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { mockRestaurant } from '../../mock/restaurant';
import { useLocalStorage } from '../../utils/storage';
import { useToast } from '../ui/Toast';
import { useOrders } from '../../context/OrderContext';
import './Layout.css';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('fic_sidebar_collapsed', true);
  const { isOnline, setIsOnline } = useOrders();
  const [activeOutletId, setActiveOutletId] = useLocalStorage<string>('fic_active_outlet', 'out-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);

  const { addToast } = useToast();

  const handleCreateQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickActionModalOpen(false);
    addToast('Quick Order Created!', 'Order #FIC-8892 added to active prep queue.', 'success');
  };

  return (
    <div className={`fic-app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Focus-Based Fixed Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onSidebarClick={() => setSidebarCollapsed(false)}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fic-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Container Region - Clicking anywhere here collapses sidebar */}
      <div
        className="fic-main-wrapper"
        onClick={() => {
          if (!sidebarCollapsed) {
            setSidebarCollapsed(true);
          }
        }}
      >
        {/* Sticky Header */}
        <Header
          isOnline={isOnline}
          onToggleOnline={(status) => setIsOnline(status)}
          outlets={mockRestaurant.outlets}
          activeOutletId={activeOutletId}
          onSelectOutlet={(id) => setActiveOutletId(id)}
          searchTerm={searchTerm}
          onSearchChange={(term) => setSearchTerm(term)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onQuickActionClick={() => setQuickActionModalOpen(true)}
        />

        {/* Content Area */}
        <main className="fic-content-area animate-fade-in">
          <RouterOutlet context={{ searchTerm, isOnline, activeOutletId }} />
        </main>
      </div>

      {/* Quick Action Modal */}
      <Modal
        isOpen={quickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        title="Create Quick Action / Walk-in Order"
        description="Quickly generate a dine-in or counter pickup order."
        footer={
          <>
            <Button variant="outline" onClick={() => setQuickActionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateQuickOrder}>
              Create Order
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateQuickOrder} className="flex flex-col gap-md">
          <Input label="Customer Name" placeholder="e.g. Rahul Sharma" required />
          <Input label="Customer Phone (+91)" placeholder="e.g. 9876543210" required />
          <Select
            label="Order Type"
            options={[
              { value: 'dine_in', label: 'Dine-In' },
              { value: 'pickup', label: 'Counter Pickup' },
              { value: 'delivery', label: 'Direct Delivery' },
            ]}
          />
          <Input label="Select Items & Notes" placeholder="e.g. 2 Butter Chicken + 4 Naan" />
        </form>
      </Modal>
    </div>
  );
};
