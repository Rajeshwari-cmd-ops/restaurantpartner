import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import { KitchenPage } from '../pages/KitchenPage';
import { DeliveryPage } from '../pages/DeliveryPage';
import { RidersPage } from '../pages/RidersPage';
import { MenuPage } from '../pages/MenuPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CustomersPage } from '../pages/CustomersPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { PromotionsPage } from '../pages/PromotionsPage';
import { FinancePage } from '../pages/FinancePage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SupportPage } from '../pages/SupportPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/riders" element={<RidersPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
