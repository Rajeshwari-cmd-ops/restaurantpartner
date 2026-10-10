import {
  mockRestaurant,
  mockOrders,
  mockMenuItems,
  mockCategories,
  mockInventory,
  mockCustomers,
  mockReviews,
  mockPromotions,
  mockFinance,
  mockNotifications,
} from '../mock';

const defaultApiUrl = import.meta.env.PROD
  ? 'https://fic-restaurant-backend-2026.onrender.com/api/v1'
  : 'http://localhost:5000/api/v1';

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL as string) || defaultApiUrl;
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

async function fetchFromBackend<T>(endpoint: string, options: RequestInit = {}, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('API Response Error');
    const json = await response.json();
    return (json.data ?? json) as T;
  } catch (err) {
    // Graceful fallback if backend is offline
    return fallbackData;
  }
}

export const apiService = {
  checkHealth: () => fetchFromBackend('/health', {}, { status: 'offline' }),
  getRestaurant: () => fetchFromBackend('/restaurant', {}, mockRestaurant),
  toggleOnlineStatus: (isOnline: boolean) =>
    fetchFromBackend('/restaurant/toggle-online', { method: 'PATCH', body: JSON.stringify({ isOnline }) }, { isOnline }),
  getOrders: () => fetchFromBackend('/orders', {}, mockOrders),
  createOrder: (orderData: any) =>
    fetchFromBackend('/orders', { method: 'POST', body: JSON.stringify(orderData) }, orderData),
  updateOrderStatus: (orderId: string, status: string) =>
    fetchFromBackend(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, { id: orderId, status }),
  getInventory: () => fetchFromBackend('/inventory', {}, mockInventory),
  updateInventoryStock: (itemId: string, currentStock: number) =>
    fetchFromBackend(`/inventory/${itemId}`, { method: 'PATCH', body: JSON.stringify({ currentStock }) }, { id: itemId, currentStock }),
  getRiders: () => fetchFromBackend('/riders', {}, []),
  updateRiderStatus: (riderId: string, liveStatus: string) =>
    fetchFromBackend(`/riders/${riderId}/status`, { method: 'PATCH', body: JSON.stringify({ liveStatus }) }, { id: riderId, liveStatus }),
  getMenu: () => fetchFromBackend('/menu', {}, { categories: mockCategories, items: mockMenuItems }),
  getCustomers: () => fetchFromBackend('/customers', {}, mockCustomers),
  getReviews: () => fetchFromBackend('/reviews', {}, mockReviews),
  getPromotions: () => fetchFromBackend('/promotions', {}, mockPromotions),
  getFinance: () => fetchFromBackend('/finance', {}, mockFinance),
  getNotifications: () => fetchFromBackend('/notifications', {}, mockNotifications),
};
